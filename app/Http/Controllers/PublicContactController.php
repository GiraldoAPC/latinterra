<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class PublicContactController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:150'],
            'company' => ['nullable', 'string', 'max:150'],
            'segment' => ['nullable', 'string', 'max:100'],
            'topic' => ['nullable', 'string', 'max:120'],
            'message' => ['required', 'string', 'max:4000'],
            'recaptcha_token' => ['nullable', 'string'],
        ]);

        $this->validateRecaptchaIfConfigured($request, $data['recaptcha_token'] ?? null);

        $toEmail = config('services.contact.to', 'ventas@latin-terra.com');

        Mail::send('emails.public-contact', ['data' => $data], function ($mail) use ($toEmail, $data) {
            $mail->to($toEmail)
                ->subject('Nuevo contacto web - ' . ($data['topic'] ?: 'Consulta general'))
                ->replyTo($data['email'] ?: $toEmail, $data['name']);
        });

        return response()->json([
            'message' => 'Tu mensaje fue enviado correctamente al correo de ventas.',
        ]);
    }

    private function validateRecaptchaIfConfigured(Request $request, ?string $token): void
    {
        $secret = (string) config('services.recaptcha.secret', '');

        if ($secret === '') {
            return;
        }

        if (!$token) {
            throw ValidationException::withMessages([
                'recaptcha_token' => 'Completa la verificacion reCAPTCHA.',
            ]);
        }

        $response = Http::asForm()->timeout(10)->post(
            'https://www.google.com/recaptcha/api/siteverify',
            [
                'secret' => $secret,
                'response' => $token,
                'remoteip' => $request->ip(),
            ]
        );

        if (!$response->ok()) {
            throw ValidationException::withMessages([
                'recaptcha_token' => 'No se pudo validar reCAPTCHA.',
            ]);
        }

        $body = $response->json();
        $success = (bool) ($body['success'] ?? false);

        if (!$success) {
            throw ValidationException::withMessages([
                'recaptcha_token' => 'La validacion reCAPTCHA no fue exitosa.',
            ]);
        }

        $minScore = (float) config('services.recaptcha.min_score', 0.5);
        if (array_key_exists('score', $body) && (float) $body['score'] < $minScore) {
            throw ValidationException::withMessages([
                'recaptcha_token' => 'La validacion reCAPTCHA tuvo puntaje bajo. Intenta nuevamente.',
            ]);
        }
    }
}
