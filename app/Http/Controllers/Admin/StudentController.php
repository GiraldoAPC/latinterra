<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula\Course;
use App\Models\Aula\CourseInstallment;
use App\Models\Aula\CourseOrder;
use App\Models\Aula\Enrollment;
use App\Models\Distrito;
use App\Models\Pais;
use App\Models\Persona;
use App\Models\SelectOption;
use App\Models\User;
use App\Models\Ventas\OtherPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Los campos de identidad (documento, nombre, apellido, fecha de
 * nacimiento, telefono, direccion, ubicacion, foto) viven en Persona - ver
 * App\Models\Persona - compartida con Docentes/Personal. Este controller
 * crea/actualiza la Persona y el User (cuenta) juntos, en una transaccion.
 */
class StudentController extends Controller
{
    private const PERSONA_FIELDS = [
        'document_type', 'dni', 'name', 'last_name', 'gender', 'birth_date',
        'phone', 'address', 'distrito_id', 'pais_id', 'ciudad_extranjero',
    ];

    public function index(Request $request): Response
    {
        $students = User::where('role', 'student')
            ->withCount('enrollments')
            ->with(['enrollments.course:id,title', 'persona.distrito.provincia'])
            ->when($request->search, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('dni', 'like', "%{$search}%")
                        ->orWhere('company', 'like', "%{$search}%")
                        ->orWhereHas('persona', fn ($q) => $q->where('last_name', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(function (User $s) {
                $s->course_titles = $s->enrollments->pluck('course.title')->filter()->values();
                $s->course_id = optional($s->enrollments->first())->course_id;
                $distrito = $s->persona?->distrito;
                $s->provincia_id = $distrito?->provincia_id;
                $s->departamento_id = $distrito?->provincia?->departamento_id;
                unset($s->enrollments, $s->persona);
                return $s;
            });

        $allStudents = User::where('role', 'student')->get(['is_active', 'company', 'sctr_status']);

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'filters' => ['search' => $request->search],
            'stats' => [
                'total' => $allStudents->count(),
                'active' => $allStudents->where('is_active', true)->count(),
                'sctr_vigente' => $allStudents->where('sctr_status', 'vigente')->count(),
                'companies' => $allStudents->pluck('company')->filter()->unique()->count(),
            ],
            'courses' => Course::where('is_published', true)
                ->orderBy('title')
                ->get(['id', 'title', 'is_free', 'price', 'min_age']),
            'documentTypes' => SelectOption::optionsFor('document_type'),
            'genderOptions' => SelectOption::optionsFor('gender'),
            'sctrOptions' => SelectOption::optionsFor('sctr_status'),
        ]);
    }

    /**
     * Busqueda global (barra superior del panel admin). Por ahora solo
     * busca estudiantes; si en el futuro se agregan otras entidades
     * buscables, esto puede devolver mas grupos ademas de "students".
     */
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        if ($q === '') {
            return response()->json(['students' => []]);
        }

        $students = User::where('role', 'student')
            ->with(['enrollments.course:id,title', 'persona'])
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('dni', 'like', "%{$q}%")
                    ->orWhereHas('persona', fn ($q2) => $q2->where('last_name', 'like', "%{$q}%"));
            })
            ->orderBy('name')
            ->limit(8)
            ->get()
            ->map(fn (User $s) => [
                'id' => $s->id,
                'name' => $s->persona?->full_name ?? $s->name,
                'dni' => $s->dni,
                'avatar_url' => $s->avatar_url,
                'course_title' => optional($s->enrollments->first())->course->title,
            ]);

        return response()->json(['students' => $students]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Students/Create');
    }

    /**
     * Reporte en CSV de todos los estudiantes, para llevar control externo
     * (Excel) de datos administrativos y de seguridad (SCTR, emergencia).
     */
    public function export(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $students = User::where('role', 'student')->withCount('enrollments')->with('persona')->orderBy('name')->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="estudiantes.csv"',
        ];

        $columns = [
            'Nombres', 'Apellidos', 'Email', 'Telefono', 'Tipo doc', 'Numero doc', 'Empresa', 'Cargo', 'Estado',
            'Cursos inscritos', 'Contacto emergencia', 'Telefono emergencia',
            'Tipo de sangre', 'SCTR', 'Vencimiento SCTR', 'Registrado',
        ];

        return response()->streamDownload(function () use ($students, $columns) {
            $out = fopen('php://output', 'w');
            fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF)); // BOM para Excel
            fputcsv($out, $columns);

            foreach ($students as $s) {
                fputcsv($out, [
                    $s->name,
                    $s->last_name,
                    $s->email,
                    $s->phone,
                    $s->document_type,
                    $s->dni,
                    $s->company,
                    $s->position,
                    $s->is_active ? 'Activo' : 'Suspendido',
                    $s->enrollments_count,
                    $s->emergency_contact_name,
                    $s->emergency_contact_phone,
                    $s->blood_type,
                    $s->sctr_status,
                    optional($s->sctr_expires_at)->format('Y-m-d'),
                    $s->created_at->format('Y-m-d'),
                ]);
            }

            fclose($out);
        }, 'estudiantes.csv', $headers);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request, null);
        $courseId = $data['course_id'] ?? null;
        unset($data['course_id']);

        [$personaData, $userData] = $this->splitPersonaData($data);

        if ($request->hasFile('avatar')) {
            $personaData['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $student = DB::transaction(function () use ($personaData, $userData, $courseId) {
            $persona = Persona::create($personaData);

            $userData['persona_id'] = $persona->id;
            $userData['role'] = 'student';
            $userData['name'] = $persona->name;
            $userData['dni'] = $persona->dni;
            $userData['district'] = $persona->distrito?->nombre ?? $persona->ciudad_extranjero;
            // Usuario de acceso: DNI o correo (login acepta ambos). Contrasena
            // inicial = numero de documento, para que el estudiante no dependa
            // de recibir un correo de bienvenida antes de poder entrar.
            $userData['password'] = Hash::make($persona->dni);

            $student = User::create($userData);

            if ($courseId) {
                $course = Course::find($courseId);
                if ($course) {
                    $this->enrollInCourse($student, $course);
                }
            }

            return $student;
        });

        return redirect()->route('admin.students.show', $student)->with('success', 'Estudiante registrado.');
    }

    /**
     * Inscribe a un estudiante en un curso desde el panel admin (registro
     * o edicion), respetando como esta configurado el precio del curso:
     * gratis -> inscripcion directa; matricula+mensualidad -> inscripcion
     * directa + genera las cuotas; pago unico -> queda como orden
     * pendiente hasta que se confirme el pago (ver Pedidos de cursos).
     */
    private function enrollInCourse(User $student, Course $course): void
    {
        if ($course->is_free || (float) $course->price <= 0) {
            Enrollment::create([
                'user_id' => $student->id,
                'course_id' => $course->id,
                'status' => 'active',
            ]);
            return;
        }

        if ($course->billing_type === 'matricula_mensualidad') {
            $enrollment = Enrollment::create([
                'user_id' => $student->id,
                'course_id' => $course->id,
                'status' => 'active',
            ]);
            $course->generateInstallmentsFor($enrollment);
            return;
        }

        CourseOrder::create([
            'user_id' => $student->id,
            'course_id' => $course->id,
            'amount' => $course->price,
            'status' => 'pending',
        ]);
    }

    public function show(User $student): Response
    {
        abort_unless($student->role === 'student', 404);

        $enrollments = Enrollment::with('course', 'certificate')
            ->where('user_id', $student->id)
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
            ->where('user_id', $student->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (CourseOrder $o) => [
                'id' => $o->id,
                'course_title' => $o->course->title,
                'amount' => $o->amount,
                'status' => $o->status,
                'created_at' => $o->created_at,
            ]);

        $installments = CourseInstallment::with('enrollment.course')
            ->whereHas('enrollment', fn ($q) => $q->where('user_id', $student->id))
            ->orderBy('due_date')
            ->get()
            ->map(fn (CourseInstallment $i) => [
                'id' => $i->id,
                'course_title' => $i->enrollment->course->title,
                'type' => $i->type,
                'installment_number' => $i->installment_number,
                'amount' => $i->amount,
                'due_date' => $i->due_date,
                'status' => $i->status,
                'overdue' => $i->isOverdue(),
                'paid_at' => $i->paid_at,
                'payment_method' => $i->payment_method,
                'payment_reference' => $i->payment_reference,
                'receipt_code' => $i->receipt_code,
            ]);

        $otherPayments = OtherPayment::where('user_id', $student->id)
            ->orderByDesc('paid_at')
            ->get()
            ->map(fn (OtherPayment $p) => [
                'id' => $p->id,
                'type' => $p->type,
                'document_type' => $p->document_type,
                'concept' => $p->concept,
                'amount' => $p->amount,
                'payment_method' => $p->payment_method,
                'receipt_code' => $p->receipt_code,
                'paid_at' => $p->paid_at,
            ]);

        $student->course_id = optional(
            Enrollment::where('user_id', $student->id)->orderByDesc('created_at')->first()
        )->course_id;

        // El cascade Departamento/Provincia/Distrito necesita la cadena
        // completa para prellenarse al editar (el distrito solo no alcanza).
        if ($student->distrito_id) {
            $distrito = Distrito::with('provincia')->find($student->distrito_id);
            $student->provincia_id = $distrito?->provincia_id;
            $student->departamento_id = $distrito?->provincia?->departamento_id;
        }

        return Inertia::render('Admin/Students/Show', [
            'student' => $student,
            'enrollments' => $enrollments,
            'orders' => $orders,
            'installments' => $installments,
            'otherPayments' => $otherPayments,
            'documentTypes' => SelectOption::optionsFor('document_type'),
            'genderOptions' => SelectOption::optionsFor('gender'),
            'sctrOptions' => SelectOption::optionsFor('sctr_status'),
            'courses' => Course::where('is_published', true)
                ->orderBy('title')
                ->get(['id', 'title', 'is_free', 'price', 'min_age']),
            'stats' => [
                'courses' => $enrollments->count(),
                'completed' => $enrollments->where('status', 'completed')->count(),
                'certificates' => $enrollments->whereNotNull('certificate')->count(),
            ],
        ]);
    }

    public function edit(User $student): Response
    {
        abort_unless($student->role === 'student', 404);

        $student->loadCount('enrollments');
        $student->load(['enrollments.course', 'courseOrders.course']);

        return Inertia::render('Admin/Students/Edit', [
            'student' => $student,
        ]);
    }

    public function update(Request $request, User $student): RedirectResponse
    {
        abort_unless($student->role === 'student', 404);

        $data = $this->validated($request, $student->id);
        $courseId = $data['course_id'] ?? null;
        unset($data['course_id']);

        [$personaData, $userData] = $this->splitPersonaData($data);

        if ($courseId && !Enrollment::where('user_id', $student->id)->where('course_id', $courseId)->exists()) {
            $course = Course::find($courseId);
            if ($course) {
                $this->enrollInCourse($student, $course);
            }
        }

        if ($request->hasFile('avatar')) {
            if ($student->persona?->avatar) {
                Storage::disk('public')->delete($student->persona->avatar);
            }
            $personaData['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        DB::transaction(function () use ($student, $personaData, $userData) {
            if ($student->persona) {
                $student->persona->update($personaData);
            } else {
                $student->persona()->associate(Persona::create($personaData));
            }

            $userData['district'] = $student->persona->distrito?->nombre ?? $student->persona->ciudad_extranjero;
            $student->update($userData);
            $student->syncFromPersona();
            $student->save();
        });

        // Siempre al perfil: si ya estabamos ahi (editando desde el propio
        // perfil) esto simplemente lo recarga con los datos nuevos; si se
        // edito desde la lista de estudiantes, esto lleva a su perfil.
        return redirect()->route('admin.students.show', $student)->with('success', 'Estudiante actualizado.');
    }

    /** Registra el pago de una cuota (matricula o mensualidad) de un estudiante. */
    public function payInstallment(Request $request, User $student, CourseInstallment $installment): RedirectResponse
    {
        abort_unless($student->role === 'student', 404);
        abort_unless($installment->enrollment->user_id === $student->id, 404);

        $data = $request->validate([
            'payment_method' => ['required', 'string', 'max:60'],
            'payment_reference' => ['nullable', 'string', 'max:120'],
        ]);

        $installment->markPaid($data['payment_method'], $data['payment_reference'] ?? null);

        return back()->with('success', 'Pago registrado.');
    }

    /**
     * Subida rapida de foto de perfil desde el circulo del banner del
     * perfil (independiente del modal de editar - se sube al toque).
     */
    public function updateAvatar(Request $request, User $student): RedirectResponse
    {
        abort_unless($student->role === 'student', 404);
        abort_unless($student->persona, 404);

        $request->validate(['avatar' => ['required', 'image', 'max:2048']]);

        if ($student->persona->avatar) {
            Storage::disk('public')->delete($student->persona->avatar);
        }

        $student->persona->update(['avatar' => $request->file('avatar')->store('avatars', 'public')]);

        return back()->with('success', 'Foto de perfil actualizada.');
    }

    public function destroy(User $student): RedirectResponse
    {
        abort_unless($student->role === 'student', 404);

        $persona = $student->persona;
        $student->delete();
        // Solo se borra la persona si nadie mas la usa (evita perder datos
        // de una persona con varios roles/cuentas asociadas).
        if ($persona && $persona->users()->count() === 0) {
            $persona->delete();
        }

        return redirect()->route('admin.students.index')->with('success', 'Estudiante eliminado.');
    }

    public function toggleActive(User $student): RedirectResponse
    {
        abort_unless($student->role === 'student', 404);

        $student->update(['is_active' => !$student->is_active]);

        return back()->with('success', $student->is_active ? 'Estudiante activado.' : 'Estudiante suspendido.');
    }

    public function resetPassword(User $student): RedirectResponse
    {
        abort_unless($student->role === 'student', 404);
        abort_unless($student->dni, 422, 'El estudiante no tiene un numero de documento registrado.');

        $student->update(['password' => Hash::make($student->dni)]);

        return back()->with('success', 'Contrasena restablecida al numero de documento.');
    }

    /** Separa los campos validados entre los que van a Persona y los que se quedan en User. */
    private function splitPersonaData(array $data): array
    {
        $personaData = array_intersect_key($data, array_flip(self::PERSONA_FIELDS));
        $userData = array_diff_key($data, array_flip(self::PERSONA_FIELDS));

        return [$personaData, $userData];
    }

    private function validated(Request $request, ?int $ignoreUserId): array
    {
        $ignorePersonaId = $ignoreUserId ? User::find($ignoreUserId)?->persona_id : null;

        $documentTypeCodes = SelectOption::group('document_type')->active()->pluck('code');
        $genderCodes = SelectOption::group('gender')->active()->pluck('code');
        $sctrCodes = SelectOption::group('sctr_status')->active()->pluck('code');

        return $request->validate([
            'avatar' => ['nullable', 'image', 'max:2048'],
            'document_type' => ['required', Rule::in($documentTypeCodes)],
            'dni' => [
                'required', 'string', 'max:20',
                Rule::unique('personas', 'dni')->ignore($ignorePersonaId),
                function ($attribute, $value, $fail) use ($request) {
                    $type = SelectOption::group('document_type')->where('code', $request->input('document_type'))->first();
                    if ($type && ($error = $type->validateValue($value))) {
                        $fail($error);
                    }
                },
            ],
            'name' => ['required', 'string', 'max:255', 'regex:/^[\pL\'\- ]+$/u'],
            'last_name' => ['nullable', 'string', 'max:255', 'regex:/^[\pL\'\- ]+$/u'],
            'gender' => ['nullable', Rule::in($genderCodes)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($ignoreUserId)],
            'phone' => ['required', 'string', 'max:30'],
            'birth_date' => [
                'required', 'date',
                function ($attribute, $value, $fail) use ($request) {
                    $course = Course::find($request->input('course_id'));
                    if (!$course || !$course->min_age) {
                        return;
                    }
                    $age = \Carbon\Carbon::parse($value)->age;
                    if ($age < $course->min_age) {
                        $fail("El curso \"{$course->title}\" requiere que el estudiante tenga al menos {$course->min_age} años.");
                    }
                },
            ],
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
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'company' => ['nullable', 'string', 'max:180'],
            'position' => ['nullable', 'string', 'max:120'],
            'is_active' => ['boolean'],
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
            return true; // sin pais elegido aun: por defecto se asume Peru
        }
        return (int) $paisId === (int) Pais::where('codigo', 'PE')->value('id');
    }
}
