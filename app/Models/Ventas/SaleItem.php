<?php

namespace App\Models\Ventas;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Renglon estructurado de una venta de producto (OtherPayment guarda ademas
 * un resumen en texto libre en "description" para el ticket impreso - esto
 * es la version estructurada, pensada para reportes de margen a futuro).
 * unit_cost es un snapshot del costo promedio del producto al momento de
 * la venta, no se actualiza si avg_cost cambia despues.
 */
class SaleItem extends Model
{
    protected $fillable = ['other_payment_id', 'product_id', 'name', 'unit_price', 'unit_cost', 'qty', 'serial'];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'unit_cost' => 'decimal:2',
    ];

    public function otherPayment(): BelongsTo
    {
        return $this->belongsTo(OtherPayment::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
