<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

/**
 * Identidad compartida entre todos los tipos de persona que gestiona el
 * sistema (Estudiante, Docente/Instructor, Personal, Administrativo). Una
 * persona puede tener una o mas cuentas `User` (roles) asociadas, aunque
 * hoy en la practica es 1 a 1.
 */
class Persona extends Model
{
    protected $fillable = [
        'document_type',
        'dni',
        'name',
        'last_name',
        'gender',
        'birth_date',
        'phone',
        'address',
        'distrito_id',
        'pais_id',
        'ciudad_extranjero',
        'avatar',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    protected $appends = ['avatar_url', 'full_name'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function distrito(): BelongsTo
    {
        return $this->belongsTo(Distrito::class);
    }

    public function pais(): BelongsTo
    {
        return $this->belongsTo(Pais::class);
    }

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar ? Storage::disk('public')->url($this->avatar) : null;
    }

    public function getFullNameAttribute(): string
    {
        return trim(($this->last_name ? $this->last_name . ' ' : '') . $this->name);
    }
}
