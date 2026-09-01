<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = ['enrollment_id', 'code', 'pdf_path', 'issued_at'];

    protected $casts = [
        'issued_at' => 'datetime',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public static function generateUniqueCode(): string
    {
        do {
            $code = 'LT-' . strtoupper(Str::random(8));
        } while (self::where('code', $code)->exists());

        return $code;
    }
}
