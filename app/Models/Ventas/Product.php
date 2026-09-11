<?php

namespace App\Models\Ventas;

use App\Models\Inventario\Brand;
use App\Models\Inventario\Category;
use App\Models\Inventario\StockPurchase;
use App\Models\Inventario\StockTransfer;
use App\Models\Setting;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = ['category_id', 'brand_id', 'name', 'sku', 'barcode', 'color', 'size', 'price', 'min_stock', 'is_active'];

    protected $casts = [
        'price' => 'decimal:2',
        'avg_cost' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function stockPurchases(): HasMany
    {
        return $this->hasMany(StockPurchase::class);
    }

    public function stockTransfers(): HasMany
    {
        return $this->hasMany(StockTransfer::class);
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function tracksStock(): bool
    {
        return $this->stock !== null;
    }

    public function isLowStock(): bool
    {
        return $this->tracksStock() && $this->stock <= ($this->min_stock ?? 5);
    }

    /**
     * Unico mecanismo permitido para subir el stock: recalcula el costo
     * promedio ponderado y suma la cantidad. No usa increment() (la
     * aritmetica SQL sobre NULL da NULL, y stock=null significa "sin
     * control de stock" - increment() lo dejaria en NULL para siempre).
     *
     * El costo promedio se calcula sobre el TOTAL (stock + stock_warehouse)
     * porque es un solo costo de compra para toda la mercaderia, sin
     * importar en que "lado" este fisicamente - eso es lo unico que decide
     * si la cantidad entra a stock_warehouse (modo almacen activo) o
     * directo a stock (modo simple, como hasta ahora).
     */
    public function registerPurchase(int $qty, float $unitCost): void
    {
        if ($qty < 1) {
            throw new \InvalidArgumentException('La cantidad comprada debe ser mayor a 0.');
        }

        $oldTotal = ($this->stock ?? 0) + ($this->stock_warehouse ?? 0);

        $this->avg_cost = ($oldTotal <= 0 || $this->avg_cost === null)
            ? $unitCost
            : (($oldTotal * (float) $this->avg_cost) + ($qty * $unitCost)) / ($oldTotal + $qty);

        if (Setting::bool('warehouse_mode')) {
            $this->stock_warehouse = ($this->stock_warehouse ?? 0) + $qty;
        } else {
            $this->stock = ($this->stock ?? 0) + $qty;
        }

        $this->save();
    }

    /**
     * Mueve cantidad de almacen a ventas (unica direccion). No toca
     * avg_cost - es la misma mercaderia, solo cambia de lugar.
     */
    public function transferToSales(int $qty): void
    {
        if ($qty < 1) {
            throw new \InvalidArgumentException('La cantidad a transferir debe ser mayor a 0.');
        }

        $available = $this->stock_warehouse ?? 0;
        if ($qty > $available) {
            throw new \InvalidArgumentException("No hay suficiente stock en almacen (disponible: {$available}).");
        }

        $this->stock_warehouse = $available - $qty;
        $this->stock = ($this->stock ?? 0) + $qty;
        $this->save();
    }
}
