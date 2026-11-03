<?php

namespace App\Services;

use App\Models\Aula\InPersonCertificate;
use App\Models\Aula\InPersonParticipant;
use App\Models\Aula\InPersonSession;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class InPersonCertification
{
    public const PASSING_SCORE = 13;

    public function assess(InPersonSession $session, InPersonParticipant $participant, ?float $score, bool $attended, int $adminId): void
    {
        DB::transaction(function () use ($session, $participant, $score, $attended, $adminId) {
            InPersonSession::whereKey($session->id)->lockForUpdate()->firstOrFail();
            $locked = $this->lockParticipant($session, $participant);
            if ($locked->certificate()->exists()) {
                throw ValidationException::withMessages(['assessment' => 'Este participante ya tiene un certificado emitido. No se puede cambiar su evaluación.']);
            }
            if ($score !== null && ($score < 0 || $score > 20)) {
                throw ValidationException::withMessages(['score' => 'La nota debe estar entre 0 y 20.']);
            }
            $locked->forceFill(['score' => $score, 'attendance_confirmed' => $attended, 'assessed_at' => now(), 'assessed_by' => $adminId])->save();
        });
    }

    public function issue(InPersonSession $session, InPersonParticipant $participant, int $adminId): InPersonCertificate
    {
        return DB::transaction(function () use ($session, $participant, $adminId) {
            $group = InPersonSession::whereKey($session->id)->lockForUpdate()->firstOrFail();
            $locked = $this->lockParticipant($group, $participant);
            if ($existing = $locked->certificate()->first()) {
                return $existing;
            }
            if ($group->starts_at->isFuture()) {
                throw ValidationException::withMessages(['certificate' => 'La capacitación todavía no ha comenzado.']);
            }
            if (!$locked->attendance_confirmed || $locked->score === null || (float) $locked->score < self::PASSING_SCORE) {
                throw ValidationException::withMessages(['certificate' => 'Confirma la asistencia y registra una nota aprobatoria mínima de 13/20 antes de emitir.']);
            }
            $signers = collect($group->course->certificate_signatories ?? []);
            if ($signers->where('role', 'company')->count() !== 1 || $signers->where('role', 'instructor')->isEmpty()
                || $signers->contains(fn ($signer) => !Storage::disk('public')->exists($signer['path']))) {
                throw ValidationException::withMessages(['certificate' => 'Configura las firmas de empresa e instructores del curso antes de emitir.']);
            }
            do {
                // Separate prefix avoids collisions with certificates from the virtual classroom.
                $code = 'LT-P-'.strtoupper(Str::random(12));
            } while (InPersonCertificate::where('code', $code)->exists());
            $issuedAt = now();

            return $locked->certificate()->create([
                'code' => $code,
                'student_name' => trim($locked->name.' '.$locked->last_name),
                'document_type' => $locked->document_type, 'document_number' => $locked->document_number,
                'course_title' => $group->course->title, 'final_score' => $locked->score,
                'signatories' => $signers->all(), 'issued_at' => $issuedAt,
                'expires_at' => $issuedAt->copy()->addYearNoOverflow(), 'issued_by' => $adminId,
            ]);
        });
    }

    private function lockParticipant(InPersonSession $session, InPersonParticipant $participant): InPersonParticipant
    {
        return $session->participants()->whereKey($participant->id)->lockForUpdate()->firstOrFail();
    }
}
