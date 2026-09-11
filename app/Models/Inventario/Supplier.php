<?php

namespace App\Models\Inventario;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = ['name', 'ruc', 'phone', 'email', 'address', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function stockPurchases(): HasMany
    {
        return $this->hasMany(StockPurchase::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
