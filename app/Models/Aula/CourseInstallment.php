<?php

namespace App\Models\Aula;

use App\Models\Ventas\Client;
use App\Support\DocumentNumber;
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
        'document_type',
        'client_id',
        'buyer_ruc',
        'buyer_business_name',
        'original_due_date',
        'due_date_extended_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'original_due_date' => 'date',
        'due_date_extended_at' => 'datetime',
        'paid_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function isOverdue(): bool
    {
        return $this->status === 'pending' && $this->due_date->isPast();
    }

    public function wasExtended(): bool
    {
        return $this->due_date_extended_at !== null;
    }

    /**
     * Amplia el vencimiento X dias - solo una vez por cuota (segunda vez
     * lanza excepcion, el controlador la traduce a un error normal). Guarda
     * la fecha original la primera vez, por si hay que auditar despues.
     */
    public function extendDueDate(int $days): void
    {
        if ($this->wasExtended()) {
            throw new \RuntimeException('Esta cuota ya tuvo una ampliacion de plazo, no se puede repetir.');
        }

        $this->update([
            'original_due_date' => $this->due_date,
            'due_date' => $this->due_date->copy()->addDays($days),
            'due_date_extended_at' => now(),
        ]);
    }

    /** Registra el pago con sus detalles y genera el codigo del ticket/boleta/factura. */
    public function markPaid(
        ?string $paymentMethod = null,
        ?string $paymentReference = null,
        string $documentType = 'ticket',
        ?int $clientId = null,
        ?string $buyerRuc = null,
        ?string $buyerBusinessName = null
    ): void {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_method' => $paymentMethod,
            'payment_reference' => $paymentReference,
            'receipt_code' => $this->receipt_code ?? DocumentNumber::next($documentType),
            'document_type' => $documentType,
            'client_id' => $clientId,
            'buyer_ruc' => $buyerRuc,
            'buyer_business_name' => $buyerBusinessName,
        ]);
    }
}
