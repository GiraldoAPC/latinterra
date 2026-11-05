<?php

namespace App\Http\Controllers\Aula;

use App\Http\Controllers\Controller;
use App\Models\Aula\Certificate;
use App\Models\Aula\Enrollment;
use App\Models\Aula\InPersonCertificate;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    public function show(Enrollment $enrollment): Response
    {
        abort_unless($enrollment->user_id === Auth::id(), 403);
        abort_unless($enrollment->isTrulyCompleted(), 403, 'Este curso todavía no está completado.');

        $certificate = $enrollment->certificate()->firstOrFail();
        $enrollment->load('course', 'user');

        return Inertia::render('Aula/Certificado', [
            'certificate' => $certificate,
            'enrollment' => $enrollment,
            'signatories' => $certificate->signatureImages(),
            'courseDetails' => \App\Services\CertificateCourseDetails::resolve($certificate),
            'validity' => [
                'expires_at' => $certificate->validityEndsAt()?->toIso8601String(),
                'status' => $certificate->validityStatus(),
            ],
        ]);
    }

    public function verify(string $code): Response
    {
        $certificate = Certificate::where('code', $code)->with('enrollment.course', 'enrollment.user')->first();
        $inPerson = $certificate ? null : InPersonCertificate::where('code', $code)->first();
        $details = $certificate ? \App\Services\CertificateCourseDetails::resolve($certificate) : null;

        return Inertia::render('Aula/VerificarCertificado', [
            'certificate' => $certificate ? [
                'code' => $certificate->code,
                'issued_at' => $certificate->issued_at?->toIso8601String(),
                'expires_at' => $certificate->validityEndsAt()?->toIso8601String(),
                'status' => $certificate->validityStatus(),
                'final_score' => $certificate->final_score,
                'student_name' => trim($certificate->enrollment->user->name.' '.$certificate->enrollment->user->last_name),
                'course_title' => $details['title'], 'course_content' => $details['content'], 'duration_hours' => $details['duration_hours'],
            ] : $inPerson?->publicDetails(),
            'code' => $code,
        ]);
    }
}
