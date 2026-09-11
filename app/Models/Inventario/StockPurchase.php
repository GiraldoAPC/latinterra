<?php

namespace App\Models\Inventario;

use App\Models\User;
use App\Models\Ventas\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

/**
 * Bitacora de compras: unico mecanismo que aumenta el stock de un producto.
 * register() hace todo dentro de una transaccion con bloqueo de fila, para
 * que dos compras simultaneas del mismo producto no se pisen entre si.
 */
class StockPurchase extends Model
{
    protected $fillable = [
        'product_id',
        'supplier_id',
        'document_type',
        'document_number',
        'payment_method',
        'unit_cost',
        'quantity',
        'total',
        'purchased_at',
        'notes',
        'registered_by',
    ];

    protected $casts = [
        'unit_cost' => 'decimal:2',
        'total' => 'decimal:2',
        'purchased_at' => 'date',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function registeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    public static function register(array $data): self
    {
        return DB::transaction(function () use ($data) {
            $product = Product::whereKey($data['product_id'])->lockForUpdate()->firstOrFail();

            $purchase = self::create($data + [
                'total' => $data['unit_cost'] * $data['quantity'],
            ]);

            $product->registerPurchase((int) $data['quantity'], (float) $data['unit_cost']);

            return $purchase;
        });
    }
}
