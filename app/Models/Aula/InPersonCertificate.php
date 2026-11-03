<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class InPersonCertificate extends Model
{
    protected $fillable = ['code', 'student_name', 'document_type', 'document_number', 'course_title', 'final_score', 'signatories', 'issued_at', 'expires_at', 'issued_by'];
    protected $casts = ['final_score' => 'decimal:2', 'signatories' => 'array', 'issued_at' => 'datetime', 'expires_at' => 'datetime'];

    public function participant(): BelongsTo
    {
        return $this->belongsTo(InPersonParticipant::class, 'in_person_participant_id');
    }

    public function validityStatus(): string
    {
        return now()->greaterThanOrEqualTo($this->expires_at) ? 'expired' : 'valid';
    }

    public function signatureImages(): array
    {
        return collect($this->signatories)->map(fn ($signer) => [
            'name' => $signer['name'], 'role' => $signer['role'],
            'url' => Storage::disk('public')->url($signer['path']),
        ])->all();
    }

    public function publicDetails(): array
    {
        return [
            'code' => $this->code, 'student_name' => $this->student_name,
            'course_title' => $this->course_title, 'final_score' => $this->final_score,
            'issued_at' => $this->issued_at->toIso8601String(),
            'expires_at' => $this->expires_at->toIso8601String(),
            'status' => $this->validityStatus(), 'modality' => 'Presencial',
        ];
    }
}
