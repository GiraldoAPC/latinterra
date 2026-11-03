<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InPersonSession extends Model
{
    protected $fillable = ['course_id', 'title', 'location', 'starts_at', 'capacity', 'registration_token', 'registration_open', 'registration_closes_at'];
    protected $casts = ['starts_at' => 'datetime', 'registration_closes_at' => 'datetime', 'capacity' => 'integer', 'registration_open' => 'boolean'];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(InPersonParticipant::class);
    }

    public function registrationAvailable(): bool
    {
        return $this->registration_open && (!$this->registration_closes_at || now()->lessThan($this->registration_closes_at));
    }
}
