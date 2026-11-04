<?php

namespace App\Models\Ventas;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Quote extends Model
{
    protected $fillable = ['code', 'buyer_name', 'buyer_document', 'buyer_email', 'valid_until', 'status', 'items', 'amount', 'notes', 'registered_by', 'approved_by', 'approved_at', 'other_payment_id', 'emailed_to', 'emailed_at'];
    protected $casts = ['items' => 'array', 'amount' => 'decimal:2', 'valid_until' => 'date', 'approved_at' => 'datetime', 'emailed_at' => 'datetime'];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(OtherPayment::class, 'other_payment_id');
    }

    public function isExpired(): bool
    {
        return $this->valid_until && \Illuminate\Support\Carbon::parse($this->valid_until->format('Y-m-d'), 'America/Lima')->endOfDay()->isPast();
    }
}
