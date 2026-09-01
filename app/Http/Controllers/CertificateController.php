<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Enrollment;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    public function show(Enrollment $enrollment): Response
    {
        abort_unless($enrollment->user_id === Auth::id(), 403);

        $certificate = $enrollment->certificate()->firstOrFail();
        $enrollment->load('course', 'user');

        return Inertia::render('Aula/Certificado', [
            'certificate' => $certificate,
            'enrollment' => $enrollment,
        ]);
    }

    public function verify(string $code): Response
    {
        $certificate = Certificate::where('code', $code)->with('enrollment.course', 'enrollment.user')->first();

        return Inertia::render('Aula/VerificarCertificado', [
            'certificate' => $certificate,
            'code' => $code,
        ]);
    }
}
