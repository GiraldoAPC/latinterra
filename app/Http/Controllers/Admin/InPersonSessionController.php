<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula\Course;
use App\Models\Aula\InPersonSession;
use App\Models\Aula\InPersonParticipant;
use App\Http\Requests\InPersonParticipantRequest;
use App\Services\InPersonCertification;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InPersonSessionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Presenciales/Index', [
            'courses' => Course::orderBy('title')->get(['id', 'title']),
            'sessions' => InPersonSession::with('course:id,title')->withCount('participants')->orderByDesc('starts_at')->paginate(15),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'starts_at' => ['required', 'date_format:Y-m-d\TH:i'],
            'capacity' => ['required', 'integer', 'min:1', 'max:1000'],
            'registration_closes_at' => ['nullable', 'date_format:Y-m-d\TH:i'],
        ]);
        // The administration form explicitly uses Peru time, regardless of server timezone.
        $data['starts_at'] = Carbon::createFromFormat('Y-m-d\TH:i', $data['starts_at'], 'America/Lima')->second(0)->utc();
        $data['registration_closes_at'] = empty($data['registration_closes_at']) ? null
            : Carbon::createFromFormat('Y-m-d\TH:i', $data['registration_closes_at'], 'America/Lima')->second(0)->utc();
        if ($data['registration_closes_at'] && $data['registration_closes_at']->lessThanOrEqualTo(now())) {
            throw ValidationException::withMessages(['registration_closes_at' => 'El cierre debe ser posterior a la fecha y hora actuales.']);
        }
        $session = InPersonSession::create($data + ['registration_token' => Str::random(48), 'registration_open' => true]);

        return redirect()->route('admin.in-person.show', $session)->with('success', 'Grupo creado. Comparte el enlace o QR para registrar participantes.');
    }

    public function show(InPersonSession $session): Response
    {
        return Inertia::render('Admin/Presenciales/Show', [
            'session' => $session->load('course:id,title')->loadCount('participants'),
            'participants' => $session->participants()->with('certificate')->orderBy('last_name')->orderBy('name')->paginate(30),
        ]);
    }

    public function updateRegistration(Request $request, InPersonSession $session): RedirectResponse
    {
        $data = $request->validate(['registration_open' => ['required', 'boolean']]);
        $session->update($data);

        return back()->with('success', $data['registration_open'] ? 'Registro habilitado. Se mantienen el cupo y la fecha de cierre.' : 'Registro cerrado.');
    }

    public function updateParticipant(Request $request, InPersonSession $session, InPersonParticipant $participant): RedirectResponse
    {
        abort_unless($participant->in_person_session_id === $session->id, 404);
        $data = $request->validate(InPersonParticipantRequest::participantRules((string) $request->input('document_type')));
        $data['document_number'] = strtoupper(trim($data['document_number']));
        DB::transaction(function () use ($session, $participant, $data) {
            InPersonSession::whereKey($session->id)->lockForUpdate()->firstOrFail();
            if ($participant->certificate()->exists()) {
                throw ValidationException::withMessages(['participant' => 'Este participante ya tiene un certificado. Sus datos no pueden modificarse.']);
            }
            if ($session->participants()->where('document_type', $data['document_type'])
                ->where('document_number', $data['document_number'])->whereKeyNot($participant->id)->exists()) {
                throw ValidationException::withMessages(['document_number' => 'Este documento ya está registrado en el grupo.']);
            }
            $participant->update($data);
        });

        return back()->with('success', 'Datos del participante actualizados.');
    }

    public function assessParticipant(Request $request, InPersonSession $session, InPersonParticipant $participant, InPersonCertification $certification): RedirectResponse
    {
        $data = $request->validate([
            'score' => ['nullable', 'numeric', 'between:0,20', 'decimal:0,2'],
            'attendance_confirmed' => ['required', 'boolean'],
        ]);
        $certification->assess($session, $participant, isset($data['score']) ? (float) $data['score'] : null,
            (bool) $data['attendance_confirmed'], $request->user()->id);

        return back()->with('success', 'Evaluación presencial guardada.');
    }

    public function issueCertificate(Request $request, InPersonSession $session, InPersonParticipant $participant, InPersonCertification $certification): RedirectResponse
    {
        $certification->issue($session, $participant, $request->user()->id);

        return redirect()->route('admin.in-person.certificate', [$session, $participant])->with('success', 'Certificado presencial disponible.');
    }

    public function certificate(InPersonSession $session, InPersonParticipant $participant): Response
    {
        abort_unless($participant->in_person_session_id === $session->id, 404);
        $certificate = $participant->certificate()->firstOrFail();

        return Inertia::render('Admin/Presenciales/Certificate', [
            'sessionId' => $session->id,
            'certificate' => $certificate->publicDetails() + [
                'document_label' => strtoupper($certificate->document_type).' '.$certificate->document_number,
                'signatories' => $certificate->signatureImages(),
            ],
        ]);
    }
}
