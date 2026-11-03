<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula\Certificate;
use App\Models\Aula\Course;
use App\Models\Aula\InPersonCertificate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Cursos/Certificados', [
            'courses' => Course::orderBy('title')->get(['id', 'title', 'certificate_signatories'])->map(fn ($course) => [
                'id' => $course->id,
                'title' => $course->title,
                'signatories' => collect($course->certificate_signatories ?? [])->map(fn ($signer) => [
                    'id' => $signer['id'], 'name' => $signer['name'], 'role' => $signer['role'],
                    'url' => Storage::disk('public')->url($signer['path']),
                ]),
            ]),
            'certificates' => Certificate::with('enrollment.user', 'enrollment.course')->orderByDesc('issued_at')
                ->paginate(15)->withQueryString()->through(fn ($certificate) => [
                    'code' => $certificate->code,
                    'student' => $certificate->enrollment->user->name,
                    'course' => $certificate->enrollment->course->title,
                    'expires_at' => $certificate->validityEndsAt()?->toIso8601String(),
                    'status' => $certificate->validityStatus(),
                    'notice' => $certificate->renewalNotice(),
                ]),
            'inPersonCertificates' => InPersonCertificate::with('participant')->orderByDesc('issued_at')
                ->paginate(15, ['*'], 'presencial_page')->withQueryString()->through(fn ($certificate) => $certificate->publicDetails() + [
                    'print_url' => route('admin.in-person.certificate', [$certificate->participant->in_person_session_id, $certificate->in_person_participant_id]),
                    'expiring' => $certificate->expires_at->lessThanOrEqualTo(now()->addDays(30)),
                ]),
        ]);
    }

    public function updateSignatories(Request $request, Course $course): RedirectResponse
    {
        $data = $request->validate([
            'signatories' => ['required', 'array', 'min:2', 'max:6'],
            'signatories.*.id' => ['required', 'uuid', 'distinct'],
            'signatories.*.name' => ['required', 'string', 'max:150'],
            'signatories.*.role' => ['required', Rule::in(['company', 'instructor'])],
            'signatories.*.image' => ['nullable', 'file', 'image', 'mimes:png,jpg,jpeg', 'max:2048'],
        ]);
        $rows = collect($data['signatories']);
        if ($rows->where('role', 'company')->count() !== 1 || $rows->where('role', 'instructor')->isEmpty()) {
            throw ValidationException::withMessages(['signatories' => 'Incluye un representante de la empresa y al menos un instructor.']);
        }

        $existing = collect($course->certificate_signatories ?? [])->keyBy('id');
        foreach ($data['signatories'] as $i => $signer) {
            if (!$request->hasFile("signatories.$i.image") && !$existing->has($signer['id'])) {
                throw ValidationException::withMessages(["signatories.$i.image" => 'Adjunta la imagen de la firma.']);
            }
        }

        $uploaded = [];
        try {
            $signatories = [];
            foreach ($data['signatories'] as $i => $signer) {
                $path = $existing->get($signer['id'])['path'] ?? null;
                if ($request->hasFile("signatories.$i.image")) {
                    $path = $request->file("signatories.$i.image")->store('certificates/signatures', 'public');
                    if (!$path) {
                        throw ValidationException::withMessages(["signatories.$i.image" => 'No se pudo guardar la firma. Inténtalo nuevamente.']);
                    }
                    $uploaded[] = $path;
                }
                $signatories[] = ['id' => $signer['id'], 'name' => $signer['name'], 'role' => $signer['role'], 'path' => $path];
            }
            $course->update(['certificate_signatories' => $signatories]);
        } catch (\Throwable $error) {
            Storage::disk('public')->delete($uploaded);
            throw $error;
        }

        // Keep old images: certificates already issued retain their original signatures.
        return back()->with('success', 'Firmas guardadas. Se aplicarán a los nuevos certificados de este curso.');
    }
}
