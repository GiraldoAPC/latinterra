<?php

namespace App\Models\Ventas;

use App\Models\User;
use App\Support\DocumentNumber;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Pago ajeno a un curso (venta de producto u otro concepto suelto) - ver
 * comentario de la migracion create_other_payments_table para el porque de
 * separarlo de course_installments/course_orders.
 */
class OtherPayment extends Model
{
    protected $fillable = [
        'type',
        'document_type',
        'concept',
        'description',
        'amount',
        'user_id',
        'buyer_name',
        'buyer_ruc',
        'buyer_business_name',
        'client_id',
        'payment_method',
        'payment_reference',
        'receipt_code',
        'registered_by',
        'paid_at',
        'voided_at',
        'voided_by',
        'void_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'voided_at' => 'datetime',
    ];

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function registeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    public function voidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    public function isVoided(): bool
    {
        return $this->voided_at !== null;
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    /** Crea el pago ya registrado como pagado (a diferencia de una cuota, no pasa por "pendiente"). */
    public static function register(array $data): self
    {
        return self::create($data + [
            'receipt_code' => DocumentNumber::next($data['document_type'] ?? 'ticket'),
            'paid_at' => now(),
        ]);
    }
}
