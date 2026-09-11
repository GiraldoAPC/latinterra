<?php

namespace App\Models\Aula;

use App\Support\ReceiptNumber;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseInstallment extends Model
{
    protected $fillable = [
        'enrollment_id',
        'type',
        'installment_number',
        'amount',
        'due_date',
        'status',
        'paid_at',
        'payment_method',
        'payment_reference',
        'receipt_code',
    ];

    protected $casts = [
        'due_date' => 'date',
        'paid_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function isOverdue(): bool
    {
        return $this->status === 'pending' && $this->due_date->isPast();
    }

    /** Registra el pago con sus detalles y genera el codigo del ticket interno. */
    public function markPaid(?string $paymentMethod = null, ?string $paymentReference = null): void
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_method' => $paymentMethod,
            'payment_reference' => $paymentReference,
            'receipt_code' => $this->receipt_code ?? ReceiptNumber::next(),
        ]);
    }
}
