<?php

namespace App\Http\Controllers;

use App\Models\Aula\InPersonSession;
use App\Services\InPersonRegistration;
use App\Http\Requests\InPersonParticipantRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InPersonRegistrationController extends Controller
{
    public function show(string $token): Response
    {
        $session = InPersonSession::where('registration_token', $token)->with('course:id,title')->withCount('participants')->firstOrFail();

        return Inertia::render('Public/InPersonRegistration', [
            'session' => [
                'title' => $session->title, 'course' => $session->course->title, 'location' => $session->location,
                'starts_at' => $session->starts_at->toIso8601String(), 'token' => $token,
                'available' => $session->registrationAvailable() && $session->participants_count < $session->capacity,
            ],
            'registered' => request()->session()->get('registered_session') === $session->id,
        ]);
    }

    public function store(Request $request, string $token, InPersonRegistration $registration): RedirectResponse
    {
        $session = InPersonSession::where('registration_token', $token)->firstOrFail();
        $data = $request->validate(InPersonParticipantRequest::participantRules((string) $request->input('document_type')) + ['confirmed' => ['accepted']]);
        unset($data['confirmed']);
        $registration->register($session, $data);

        return redirect()->route('in-person.register', $token)->with('registered_session', $session->id);
    }
}
