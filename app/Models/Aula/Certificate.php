<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = ['enrollment_id', 'code', 'pdf_path', 'issued_at', 'expires_at', 'final_score', 'signatories'];

    protected $casts = [
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
        'final_score' => 'decimal:2',
        'signatories' => 'array',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function validityEndsAt(): ?\Illuminate\Support\Carbon
    {
        return $this->expires_at ?? $this->issued_at?->copy()->addYearNoOverflow();
    }

    public function validityStatus(): string
    {
        $expires = $this->validityEndsAt();

        return !$expires ? 'unknown' : (now()->greaterThanOrEqualTo($expires) ? 'expired' : 'valid');
    }

    public function renewalNotice(): ?array
    {
        $expires = $this->validityEndsAt();
        if (!$expires || $expires->greaterThan(now()->addDays(30))) {
            return null;
        }

        return [
            'status' => $this->validityStatus(),
            'expires_at' => $expires->toIso8601String(),
            'message' => $this->validityStatus() === 'expired'
                ? 'Tu certificado venció. Contacta con administración para coordinar la recertificación.'
                : 'Tu certificado vence en los próximos 30 días. Contacta con administración para coordinar la recertificación.',
        ];
    }

    public function signatureImages(): array
    {
        return collect($this->signatories ?? [])->map(fn ($signer) => [
            'name' => $signer['name'],
            'role' => $signer['role'],
            'url' => \Illuminate\Support\Facades\Storage::disk('public')->url($signer['path']),
        ])->all();
    }

    public static function generateUniqueCode(): string
    {
        do {
            $code = 'LT-' . strtoupper(Str::random(8));
        } while (self::where('code', $code)->exists());

        return $code;
    }
}
