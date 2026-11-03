<?php

namespace App\Services;

use App\Models\Aula\InPersonParticipant;
use App\Models\Aula\InPersonSession;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InPersonRegistration
{
    public function register(InPersonSession $session, array $data): InPersonParticipant
    {
        return DB::transaction(function () use ($session, $data) {
            // Serialize registrations for this group so concurrent requests cannot exceed capacity.
            $locked = InPersonSession::whereKey($session->id)->lockForUpdate()->firstOrFail();
            if (!$locked->registrationAvailable()) {
                throw ValidationException::withMessages(['registration' => 'El registro de este grupo está cerrado.']);
            }
            $data['document_number'] = strtoupper(trim($data['document_number']));
            if ($locked->participants()->where('document_type', $data['document_type'])->where('document_number', $data['document_number'])->exists()) {
                throw ValidationException::withMessages(['document_number' => 'Este documento ya está registrado en el grupo. Si necesitas corregirlo, contacta con administración.']);
            }
            if ($locked->participants()->count() >= $locked->capacity) {
                throw ValidationException::withMessages(['registration' => 'El grupo ya completó su cupo.']);
            }

            return $locked->participants()->create($data);
        });
    }
}
