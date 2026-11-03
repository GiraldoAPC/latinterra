<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class InPersonParticipant extends Model
{
    protected $fillable = ['document_type', 'document_number', 'name', 'last_name', 'email', 'phone'];
    protected $casts = ['score' => 'decimal:2', 'attendance_confirmed' => 'boolean', 'assessed_at' => 'datetime'];

    public function certificate(): HasOne
    {
        return $this->hasOne(InPersonCertificate::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(InPersonSession::class, 'in_person_session_id');
    }
}
