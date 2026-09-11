<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Aula\CourseOrder;
use App\Models\Aula\Enrollment;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

/**
 * La identidad (nombre, apellido, documento, fecha de nacimiento,
 * ubicacion, foto...) vive en Persona (ver App\Models\Persona) - `users`
 * es solo la cuenta de acceso (login, rol) mas los datos que son propios
 * de ser estudiante (SCTR, emergencia, etc, no aplican a un docente).
 *
 * "name" y "dni" se mantienen ademas como copias sincronizadas aca (ver
 * syncFromPersona()): Auth::attempt() para el login por DNI necesita una
 * columna real en esta tabla (no puede filtrar por una relacion), y tener
 * "name" a mano evita un join solo para ordenar/mostrar listados.
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'persona_id',
        'name',
        'dni',
        'email',
        'password',
        'role',
        'is_active',
        'company',
        'position',
        'district',
        'emergency_contact_name',
        'emergency_contact_phone',
        'blood_type',
        'medical_conditions',
        'sctr_status',
        'sctr_expires_at',
        'previous_experience',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'sctr_expires_at' => 'date',
    ];

    // Estos ya no son columnas de `users` (viven en Persona), pero se
    // exponen igual via accessor + append para que todo el codigo que ya
    // lee `$student->dni`, `$student->distrito_id`, etc. (controllers,
    // JSON al frontend) siga funcionando sin cambios.
    protected $appends = [
        'avatar_url',
        'avatar',
        'last_name',
        'document_type',
        'gender',
        'birth_date',
        'phone',
        'address',
        'distrito_id',
        'pais_id',
        'ciudad_extranjero',
    ];

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class);
    }

    public function getAvatarAttribute(): ?string
    {
        return $this->persona?->avatar;
    }

    public function getAvatarUrlAttribute(): ?string
    {
        $path = $this->persona?->avatar;
        return $path ? Storage::disk('public')->url($path) : null;
    }

    public function getLastNameAttribute(): ?string
    {
        return $this->persona?->last_name;
    }

    public function getDocumentTypeAttribute(): ?string
    {
        return $this->persona?->document_type;
    }

    public function getGenderAttribute(): ?string
    {
        return $this->persona?->gender;
    }

    public function getBirthDateAttribute()
    {
        return $this->persona?->birth_date;
    }

    public function getPhoneAttribute(): ?string
    {
        return $this->persona?->phone;
    }

    public function getAddressAttribute(): ?string
    {
        return $this->persona?->address;
    }

    public function getDistritoIdAttribute(): ?int
    {
        return $this->persona?->distrito_id;
    }

    public function getPaisIdAttribute(): ?int
    {
        return $this->persona?->pais_id;
    }

    public function getCiudadExtranjeroAttribute(): ?string
    {
        return $this->persona?->ciudad_extranjero;
    }

    /** Copia name/dni de la persona hacia esta cuenta (ver comentario de clase). */
    public function syncFromPersona(): void
    {
        if (!$this->persona) {
            return;
        }
        $this->name = $this->persona->name;
        $this->dni = $this->persona->dni;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function courseOrders(): HasMany
    {
        return $this->hasMany(CourseOrder::class);
    }
}
