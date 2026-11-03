<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = ['enrollment_id', 'code', 'pdf_path', 'issued_at', 'expires_at', 'final_score'];

    protected $casts = [
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
        'final_score' => 'decimal:2',
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

    public static function generateUniqueCode(): string
    {
        do {
            $code = 'LT-' . strtoupper(Str::random(8));
        } while (self::where('code', $code)->exists());

        return $code;
    }
}
