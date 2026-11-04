<?php

namespace App\Models\Inventario;

use Illuminate\Database\Eloquent\Model;

class StockSponsorship extends Model
{
    protected $fillable = ['product_id', 'product_name', 'recipient', 'source', 'quantity', 'unit_cost', 'total_cost', 'notes', 'request_key', 'registered_by'];
    protected $casts = ['unit_cost' => 'decimal:2', 'total_cost' => 'decimal:2', 'product_id' => 'integer', 'registered_by' => 'integer', 'quantity' => 'integer'];
}
