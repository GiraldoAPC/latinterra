<?php

namespace App\Models\Inventario;

use App\Models\User;
use App\Models\Ventas\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

/**
 * Transferencia de Almacen a Ventas - solo tiene sentido cuando el modo
 * almacen esta activo (Setting::bool('warehouse_mode')). register() hace
 * todo en una transaccion con bloqueo de fila, igual que StockPurchase.
 */
class StockTransfer extends Model
{
    protected $fillable = ['product_id', 'quantity', 'notes', 'registered_by'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function registeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    public static function register(array $data): self
    {
        return DB::transaction(function () use ($data) {
            $product = Product::whereKey($data['product_id'])->lockForUpdate()->firstOrFail();

            $transfer = self::create($data);

            $product->transferToSales((int) $data['quantity']);

            return $transfer;
        });
    }
}
