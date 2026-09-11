<?php

namespace App\Models\Ventas;

use Illuminate\Database\Eloquent\Model;

/**
 * Cliente con RUC para facturarle (simulado) - empresa/negocio, no un
 * estudiante. Se registra al vuelo la primera vez que se le factura desde
 * el carrito de venta, y despues se busca/reutiliza desde el mismo selector.
 */
class Client extends Model
{
    protected $fillable = ['type', 'ruc', 'dni', 'business_name', 'address', 'phone', 'email'];
}
