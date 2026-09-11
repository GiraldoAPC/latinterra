<?php

namespace App\Http\Controllers\Aula;

use App\Http\Controllers\Controller;
use App\Models\Aula\CourseInstallment;
use App\Models\Aula\CourseOrder;
use App\Models\Aula\Enrollment;
use App\Models\Distrito;
use App\Models\Pais;
use App\Models\Persona;
use App\Models\SelectOption;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentProfileController extends Controller
{
    private const PERSONA_FIELDS = [
        'document_type', 'dni', 'name', 'last_name', 'gender', 'birth_date',
        'phone', 'address', 'distrito_id', 'pais_id', 'ciudad_extranjero',
    ];

    public function show(): Response
    {
        $user = Auth::user();

        $enrollments = Enrollment::with('course', 'certificate')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Enrollment $e) {
                $trulyCompleted = $e->isTrulyCompleted();

                return [
                    'id' => $e->id,
                    'course' => [
                        'title' => $e->course->title,
                        'slug' => $e->course->slug,
                    ],
                    'status' => $trulyCompleted ? 'completed' : 'active',
                    'progress' => $e->progressPercent(),
                    'certificate' => ($trulyCompleted && $e->certificate) ? [
                        'code' => $e->certificate->code,
                        'issued_at' => $e->certificate->issued_at,
                    ] : null,
                    'created_at' => $e->created_at,
                ];
            });

        $orders = CourseOrder::with('course')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (CourseOrder $o) => [
                'id' => $o->id,
                'course_title' => $o->course->title,
                'amount' => $o->amount,
                'status' => $o->status,
                'created_at' => $o->created_at,
            ]);

        $installments = \App\Models\Aula\CourseInstallment::with('enrollment.course')
            ->whereHas('enrollment', fn ($q) => $q->where('user_id', $user->id))
            ->orderBy('due_date')
            ->get()
            ->map(fn (\App\Models\Aula\CourseInstallment $i) => [
                'id' => $i->id,
                'course_title' => $i->enrollment->course->title,
                'type' => $i->type,
                'installment_number' => $i->installment_number,
                'amount' => $i->amount,
                'due_date' => $i->due_date,
                'status' => $i->status,
                'overdue' => $i->isOverdue(),
                'paid_at' => $i->paid_at,
                'receipt_code' => $i->receipt_code,
            ]);

        // El cascade Departamento/Provincia/Distrito necesita la cadena
        // completa para prellenarse al editar (el distrito solo no alcanza).
        $provinciaId = null;
        $departamentoId = null;
        $distritoNombre = null;
        if ($user->distrito_id) {
            $distrito = Distrito::with('provincia')->find($user->distrito_id);
            $provinciaId = $distrito?->provincia_id;
            $departamentoId = $distrito?->provincia?->departamento_id;
            $distritoNombre = $distrito?->nombre;
        }

        return Inertia::render('Aula/Perfil', [
            'profileUser' => array_merge($user->only([
                'id', 'name', 'email', 'company', 'position', 'previous_experience',
                'emergency_contact_name', 'emergency_contact_phone', 'blood_type',
                'medical_conditions', 'sctr_status', 'sctr_expires_at', 'created_at',
                'document_type', 'dni', 'last_name', 'gender', 'birth_date', 'phone',
                'address', 'distrito_id', 'pais_id', 'ciudad_extranjero', 'avatar_url',
            ]), [
                'provincia_id' => $provinciaId,
                'departamento_id' => $departamentoId,
                'distrito_nombre' => $distritoNombre,
                'pais_nombre' => $user->persona?->pais?->nombre,
            ]),
            'enrollments' => $enrollments,
            'orders' => $orders,
            'installments' => $installments,
            'documentTypes' => SelectOption::optionsFor('document_type'),
            'genderOptions' => SelectOption::optionsFor('gender'),
            'sctrOptions' => SelectOption::optionsFor('sctr_status'),
            'stats' => [
                'courses' => $enrollments->count(),
                'completed' => $enrollments->where('status', 'completed')->count(),
                'certificates' => $enrollments->whereNotNull('certificate')->count(),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $data = $this->validated($request, $user);
        [$personaData, $userData] = $this->splitPersonaData($data);

        DB::transaction(function () use ($user, $personaData, $userData) {
            if ($user->persona) {
                $user->persona->update($personaData);
            } else {
                $user->persona()->associate(Persona::create($personaData));
            }

            $userData['district'] = $user->persona->distrito?->nombre ?? $user->persona->ciudad_extranjero;
            $user->update($userData);
            $user->syncFromPersona();
            $user->save();
        });

        return back()->with('success', 'Perfil actualizado.');
    }

    /** Ticket interno (no es comprobante tributario) del pago de una cuota propia. */
    public function reciboPago(CourseInstallment $installment): Response
    {
        [$studentData, $installmentData] = $this->ticketData($installment);

        return Inertia::render('Aula/ReciboPago', [
            'student' => $studentData,
            'installment' => $installmentData,
        ]);
    }

    /** Mismo ticket que reciboPago() pero como JSON, para mostrarlo en un modal sin navegar. */
    public function reciboPagoDatos(CourseInstallment $installment): \Illuminate\Http\JsonResponse
    {
        [$studentData, $installmentData] = $this->ticketData($installment);

        return response()->json(['student' => $studentData, 'installment' => $installmentData]);
    }

    private function ticketData(CourseInstallment $installment): array
    {
        $user = Auth::user();
        abort_unless($installment->enrollment->user_id === $user->id, 404);
        abort_unless($installment->status === 'paid', 404);

        $installment->load('enrollment.course');
        $user->load('persona');

        return [
            $user->only(['id', 'name', 'last_name', 'dni']),
            [
                'id' => $installment->id,
                'type' => $installment->type,
                'installment_number' => $installment->installment_number,
                'amount' => $installment->amount,
                'due_date' => $installment->due_date,
                'paid_at' => $installment->paid_at,
                'payment_method' => $installment->payment_method,
                'payment_reference' => $installment->payment_reference,
                'receipt_code' => $installment->receipt_code,
                'document_type' => $installment->document_type ?? 'ticket',
                'buyer_ruc' => $installment->buyer_ruc,
                'buyer_business_name' => $installment->buyer_business_name,
                'course_title' => $installment->enrollment->course->title,
            ],
        ];
    }

    private function splitPersonaData(array $data): array
    {
        $personaData = array_intersect_key($data, array_flip(self::PERSONA_FIELDS));
        $userData = array_diff_key($data, array_flip(self::PERSONA_FIELDS));

        return [$personaData, $userData];
    }

    private function validated(Request $request, $user): array
    {
        $documentTypeCodes = SelectOption::group('document_type')->active()->pluck('code');
        $genderCodes = SelectOption::group('gender')->active()->pluck('code');
        $sctrCodes = SelectOption::group('sctr_status')->active()->pluck('code');

        return $request->validate([
            'document_type' => ['required', Rule::in($documentTypeCodes)],
            'dni' => [
                'required', 'string', 'max:20',
                Rule::unique('personas', 'dni')->ignore($user->persona_id),
            ],
            'name' => ['required', 'string', 'max:255', 'regex:/^[\pL\'\- ]+$/u'],
            'last_name' => ['nullable', 'string', 'max:255', 'regex:/^[\pL\'\- ]+$/u'],
            'gender' => ['nullable', Rule::in($genderCodes)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['required', 'string', 'max:30'],
            'birth_date' => ['required', 'date'],
            'address' => ['nullable', 'string', 'max:255'],
            'pais_id' => ['required', 'integer', 'exists:paises,id'],
            'distrito_id' => [
                'nullable', 'integer', 'exists:distritos,id',
                function ($attribute, $value, $fail) use ($request) {
                    if ($this->isPeru($request->input('pais_id')) && !$value) {
                        $fail('El distrito es obligatorio para estudiantes de Peru.');
                    }
                },
            ],
            'ciudad_extranjero' => [
                'nullable', 'string', 'max:120',
                function ($attribute, $value, $fail) use ($request) {
                    if (!$this->isPeru($request->input('pais_id')) && !$value) {
                        $fail('La ciudad es obligatoria para estudiantes de otro pais.');
                    }
                },
            ],
            'company' => ['nullable', 'string', 'max:180'],
            'position' => ['nullable', 'string', 'max:120'],
            'emergency_contact_name' => ['nullable', 'string', 'max:120', 'regex:/^[\pL\'\- ]+$/u'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:30'],
            'blood_type' => ['nullable', 'string', 'max:5'],
            'medical_conditions' => ['nullable', 'string', 'max:2000'],
            'sctr_status' => ['nullable', Rule::in($sctrCodes)],
            'sctr_expires_at' => ['nullable', 'date', 'required_if:sctr_status,vigente'],
            'previous_experience' => ['nullable', 'string', 'max:2000'],
        ], [
            'name.regex' => 'Los nombres no deben contener numeros ni simbolos.',
            'last_name.regex' => 'Los apellidos no deben contener numeros ni simbolos.',
            'emergency_contact_name.regex' => 'El nombre de contacto no debe contener numeros ni simbolos.',
            'sctr_expires_at.required_if' => 'La fecha de vencimiento es obligatoria si el SCTR esta vigente.',
        ]);
    }

    private function isPeru(mixed $paisId): bool
    {
        if (!$paisId) {
            return true;
        }
        return (int) $paisId === (int) Pais::where('codigo', 'PE')->value('id');
    }

    /**
     * Subida de foto de perfil del propio estudiante, independiente del
     * formulario de nombre/correo/telefono (se sube al toque al elegir el
     * archivo, sin pasar por "Guardar cambios").
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'],
        ]);

        if ($user->persona?->avatar) {
            Storage::disk('public')->delete($user->persona->avatar);
        }

        $avatarPath = $request->file('avatar')->store('avatars', 'public');

        if ($user->persona) {
            $user->persona->update(['avatar' => $avatarPath]);
        } else {
            $user->persona()->associate(\App\Models\Persona::create(['name' => $user->name, 'dni' => $user->dni, 'avatar' => $avatarPath]));
            $user->save();
        }

        return back()->with('success', 'Foto de perfil actualizada.');
    }
}
