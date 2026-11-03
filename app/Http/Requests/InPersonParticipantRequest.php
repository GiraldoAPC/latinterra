<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InPersonParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Administrator endpoints additionally require auth + admin middleware.
    }

    public static function participantRules(string $type): array
    {
        $pattern = match ($type) {
            'dni' => '/^\d{8}$/',
            'ce' => '/^[A-Za-z0-9]{6,20}$/',
            default => '/^[A-Za-z0-9]{5,20}$/',
        };

        return [
            'document_type' => ['required', Rule::in(['dni', 'ce', 'pasaporte'])],
            'document_number' => ['required', 'string', 'max:20', 'regex:'.$pattern],
            'name' => ['required', 'string', 'max:150'],
            'last_name' => ['required', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
        ];
    }

    public function rules(): array
    {
        return self::participantRules((string) $this->input('document_type')) + ['confirmed' => ['accepted']];
    }
}
