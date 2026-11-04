<?php

namespace App\Http\Controllers\Aula;

use App\Http\Controllers\Controller;
use App\Models\Aula\Certificate;
use App\Models\Aula\Course;
use App\Models\Aula\CourseLesson;
use App\Models\Aula\CourseLessonMaterial;
use App\Models\Aula\CourseModule;
use App\Models\Aula\CourseOrder;
use App\Models\Aula\Enrollment;
use App\Models\Aula\ExamAttempt;
use App\Models\Aula\LessonMaterialView;
use App\Models\Aula\LessonProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Models\Aula\ExamQuestion;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\StudentLearningPayload;
use Illuminate\Validation\ValidationException;
use App\Services\ModuleExamRunner;

class StudentCourseController extends Controller
{
    private const MATERIAL_MIN_DWELL_SECONDS = 12;
    // Nota minima vigesimal (0-20), fija para todos los cursos - ver
    // checklist de requerimientos, Examenes, audio 11.
    private const PASSING_SCORE = 13;

    /**
     * Chequeo de deuda vencida y de vencimiento de acceso al curso, usado
     * antes de cualquier accion dentro de un curso (clase, quiz, examen).
     * Devuelve un redirect si hay que bloquear, o null si puede continuar.
     *
     * Criterio del cliente para la deuda (segun el checklist de
     * requerimientos): el estudiante avanza con lo que ya curso/pago con
     * normalidad - la cuota vencida solo traba el ULTIMO modulo del curso
     * (y el examen final, que viene despues de ese modulo) hasta que se
     * ponga al dia. Los modulos anteriores quedan disponibles igual.
     * Si $lesson ya esta completada, tampoco se bloquea (se deja repasar).
     */
    private function accessBlockRedirect(
        Enrollment $enrollment,
        Course $course,
        ?CourseLesson $lesson = null,
        ?CourseModule $module = null
    ): ?RedirectResponse {
        if ($enrollment->isTrulyCompleted()) {
            return redirect()->route('aula.mis-cursos')->with('course_locked', [
                'reason' => 'completed',
                'course' => $course->title,
                'message' => 'Ya completaste este curso. El contenido está cerrado; puedes consultar tu certificado en Mis cursos.',
            ]);
        }

        $reviewingCompletedLesson = $lesson && $enrollment->lessonProgress()
            ->where('course_lesson_id', $lesson->id)
            ->whereNotNull('completed_at')
            ->exists();

        $targetModuleId = $module?->id ?? $lesson?->course_module_id;
        // Se ignoran modulos vacios (sin clases, p.ej. un modulo recien
        // creado todavia sin contenido) para que no "corran" el tramo final
        // a un lugar donde nunca va a haber nada que bloquear.
        $lastModuleId = CourseModule::where('course_id', $course->id)
            ->whereHas('lessons')
            ->orderByDesc('position')
            ->value('id');
        // Sin modulo/clase especifica (p.ej. el examen final del curso) se
        // trata como el tramo final, porque viene despues de todos los
        // modulos.
        $inFinalSegment = $targetModuleId === null || $targetModuleId === $lastModuleId;

        if (!$reviewingCompletedLesson && $inFinalSegment && $enrollment->hasBlockingDebt()) {
            return redirect()->route('aula.mis-cursos')->with('debt_block', [
                'course' => $course->title,
                'message' => 'Tienes una cuota vencida en este curso. Ponte al dia con tus pagos para seguir avanzando.',
            ]);
        }

        if ($enrollment->isAccessExpired()) {
            return redirect()->route('aula.mis-cursos')->with('course_locked', [
                'reason' => 'expired',
                'course' => $course->title,
                'message' => 'Se vencio tu plazo de acceso a este curso. Contactanos para coordinar como continuar.',
            ]);
        }

        // Sin bloqueo: si quedaba un aviso de un intento bloqueado anterior
        // (el flash de sesion de Laravel sobrevive una vista extra), lo
        // limpiamos para que no reaparezca el modal en esta pagina que si
        // carga bien.
        session()->forget(['debt_block', 'course_locked']);

        return null;
    }

    public function catalog(): Response
    {
        $courses = Course::where('is_published', true)
            ->withCount('enrollments')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Course $c) => [
                'id' => $c->id,
                'title' => $c->title,
                'slug' => $c->slug,
                'summary' => $c->summary,
                'thumbnail' => $c->thumbnail,
                'price' => $c->price,
                'is_free' => $c->is_free,
                'total_lessons' => $c->totalLessons(),
                'enrollments_count' => $c->enrollments_count,
            ]);

        return Inertia::render('Aula/Catalogo', [
            'courses' => $courses,
        ]);
    }

    /**
     * Catalog rendered inside the student panel (StudentLayout) instead of
     * the public marketing page, so a logged-in student never has to leave
     * the "system" to browse other available courses. Shows enrolled /
     * pending / locked state per course.
     */
    public function catalogSystem(): Response
    {
        $userId = Auth::id();

        $enrolledIds = Enrollment::where('user_id', $userId)->pluck('course_id');
        $pendingIds = CourseOrder::where('user_id', $userId)->where('status', 'pending')->pluck('course_id');

        $courses = Course::where('is_published', true)
            ->withCount('enrollments')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Course $c) => [
                'id' => $c->id,
                'title' => $c->title,
                'slug' => $c->slug,
                'summary' => $c->summary,
                'thumbnail' => $c->thumbnail,
                'price' => $c->price,
                'is_free' => $c->is_free,
                'total_lessons' => $c->totalLessons(),
                'enrollments_count' => $c->enrollments_count,
                'enrolled' => $enrolledIds->contains($c->id),
                'pending' => $pendingIds->contains($c->id),
            ]);

        return Inertia::render('Aula/CatalogoSistema', [
            'courses' => $courses,
        ]);
    }

    public function show(Course $course): Response
    {
        abort_unless($course->is_published, 404);

        $course->load('modules.lessons', 'prerequisiteCourse');

        $enrollment = null;
        $pendingOrder = null;
        $prerequisiteSatisfied = true;

        if (Auth::check()) {
            $enrollment = Enrollment::where('user_id', Auth::id())
                ->where('course_id', $course->id)
                ->first();

            if (!$enrollment) {
                $pendingOrder = CourseOrder::where('user_id', Auth::id())
                    ->where('course_id', $course->id)
                    ->where('status', 'pending')
                    ->latest()
                    ->first();
            }

            $prerequisiteSatisfied = $course->prerequisiteSatisfiedBy(Auth::id());
        }

        return Inertia::render('Aula/CursoDetalle', [
            'course' => app(StudentLearningPayload::class)->publicCourse($course),
            'enrollment' => $enrollment,
            'pendingOrder' => $pendingOrder,
            'prerequisiteSatisfied' => $prerequisiteSatisfied,
        ]);
    }

    public function enroll(Course $course): RedirectResponse
    {
        abort_unless($course->is_published, 404);

        $userId = Auth::id();

        $existing = Enrollment::where('user_id', $userId)->where('course_id', $course->id)->first();
        if ($existing) {
            return redirect()->route('aula.mis-cursos')->with(
                'success',
                $existing->isTrulyCompleted()
                    ? 'Ya completaste este curso y obtuviste tu certificado. No se puede repetir.'
                    : 'Ya estas inscrito en este curso.'
            );
        }

        $birthDate = Auth::user()->birth_date;
        if ($course->min_age && $birthDate && $birthDate->age < $course->min_age) {
            return back()->with('error', "Este curso requiere que tengas al menos {$course->min_age} años.");
        }

        if (!$course->prerequisiteSatisfiedBy($userId)) {
            return back()->with('error', "Este curso requiere haber completado \"{$course->prerequisiteCourse->title}\" antes de inscribirte. Si lo hiciste en otra institucion, acercate para validar tu certificado.");
        }

        // Curso con matricula + mensualidades: se inscribe de una vez y se
        // generan las cuotas; si el curso exige pago al dia, el acceso a
        // las clases queda bloqueado hasta que se pague la matricula (ver
        // Enrollment::hasBlockingDebt()). Va antes del chequeo de gratis
        // porque este tipo de curso no usa el campo "price" (usa
        // enrollment_fee/monthly_fee), asi que price queda en 0.
        if ($course->billing_type === 'matricula_mensualidad') {
            $enrollment = Enrollment::create([
                'user_id' => $userId,
                'course_id' => $course->id,
                'status' => 'active',
            ]);
            $course->generateInstallmentsFor($enrollment);

            return redirect()->route('aula.mis-cursos')->with('success', 'Te inscribiste al curso. Revisa tus cuotas pendientes en "Mis pagos".');
        }

        if ($course->is_free || (float) $course->price <= 0) {
            Enrollment::create([
                'user_id' => $userId,
                'course_id' => $course->id,
                'status' => 'active',
            ]);

            return redirect()->route('aula.mis-cursos')->with('success', 'Te inscribiste al curso.');
        }

        // Curso de pago unico: aun no hay pasarela integrada. Se deja la
        // orden en "pending" para que un admin la confirme manualmente.
        CourseOrder::create([
            'user_id' => $userId,
            'course_id' => $course->id,
            'amount' => $course->price,
            'status' => 'pending',
            'source' => 'online',
        ]);

        return back()->with('success', 'Tu solicitud fue registrada. Nos contactaremos para coordinar el pago y activar tu acceso.');
    }

    public function myCourses(): Response
    {
        $enrollments = Enrollment::with('course', 'certificate')
            ->where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Enrollment $e) {
                return [
                    'id' => $e->id,
                    'status' => $e->isTrulyCompleted() ? 'completed' : 'active',
                    'course' => $e->course,
                    'progress' => $e->progressPercent(),
                    'has_certificate' => $e->isTrulyCompleted() && $e->certificate()->exists(),
                    'certificate_notice' => $e->certificate?->renewalNotice(),
                ];
            });

        return Inertia::render('Aula/MisCursos', [
            'enrollments' => $enrollments,
        ]);
    }

    public function continueCourse(Course $course): RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        abort_unless(in_array($enrollment->status, ['active', 'completed'], true), 403);
        // Check closure before the fallback that allows reviewing earlier lessons.
        if ($enrollment->isTrulyCompleted() || $enrollment->isAccessExpired()) {
            return $this->accessBlockRedirect($enrollment, $course);
        }

        $course->load('modules.lessons');

        $completedIds = $enrollment->lessonProgress()
            ->whereNotNull('completed_at')
            ->pluck('course_lesson_id')
            ->all();

        $allLessons = $course->modules->flatMap->lessons;
        $target = $allLessons->first(fn ($l) => !in_array($l->id, $completedIds))
            ?? $allLessons->first();

        abort_unless($target, 404, 'Este curso aun no tiene clases.');

        // El chequeo de bloqueo va con el destino real: si va a repasar una
        // clase ya completada, la deuda no la bloquea (ver accessBlockRedirect).
        if ($redirect = $this->accessBlockRedirect($enrollment, $course, $target)) {
            // La proxima clase pendiente esta bloqueada, pero si ya completo
            // alguna antes, lo dejamos entrar igual a repasarla - "Continuar"
            // no debe tirarlo afuera del curso entero, solo frenarlo en lo
            // nuevo. Si nunca completo nada, no hay nada que repasar.
            $lastCompleted = $allLessons->last(fn ($l) => in_array($l->id, $completedIds));
            if ($lastCompleted) {
                return redirect()->route('aula.leccion', [$course, $lastCompleted]);
            }

            return $redirect;
        }

        return redirect()->route('aula.leccion', [$course, $target]);
    }

    public function lesson(Course $course, CourseLesson $lesson): Response|RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        if ($redirect = $this->lessonAccessRedirect($enrollment, $course, $lesson)) {
            return $redirect;
        }

        $course->load('modules.lessons.materials', 'modules.lessons.exam.questions', 'modules.exam.questions');
        $lesson->load('materials', 'exam.questions.options');
        $completedLessonIds = $enrollment->lessonProgress()
            ->whereNotNull('completed_at')
            ->pluck('course_lesson_id');
        $videoWatchedLessonIds = $enrollment->lessonProgress()
            ->whereNotNull('video_watched_at')
            ->pluck('course_lesson_id');
        $confirmedMaterialIds = LessonMaterialView::where('enrollment_id', $enrollment->id)
            ->whereNotNull('confirmed_at')
            ->pluck('course_lesson_material_id');

        $passedModuleQuizIds = $course->modules
            ->filter(fn ($m) => $m->exam && $m->exam->questions->count() > 0)
            ->filter(fn ($m) => $enrollment->hasPassedExam($m->exam->id))
            ->pluck('id')
            ->values();

        $lessonHasQuiz = $lesson->exam && $lesson->exam->questions->count() > 0;
        $lessonQuizPassed = $lessonHasQuiz && $enrollment->hasPassedExam($lesson->exam->id);

        return Inertia::render('Aula/Leccion', [
            'course' => app(StudentLearningPayload::class)->course($course),
            'lesson' => app(StudentLearningPayload::class)->lesson($lesson),
            'enrollment' => [
                'id' => $enrollment->id,
                'progress' => $enrollment->progressPercent(),
            ],
            'completedLessonIds' => $completedLessonIds,
            'videoWatchedLessonIds' => $videoWatchedLessonIds,
            'confirmedMaterialIds' => $confirmedMaterialIds,
            'materialMinDwellSeconds' => self::MATERIAL_MIN_DWELL_SECONDS,
            'lessonQuizPassed' => $lessonQuizPassed,
            'passedModuleQuizIds' => $passedModuleQuizIds,
        ]);
    }

    /**
     * Records the player's end event after validating course access/sequence.
     * Measuring actual watched duration requires a separate server-side protocol.
     */
    public function markVideoWatched(Course $course, CourseLesson $lesson): RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        if ($redirect = $this->lessonAccessRedirect($enrollment, $course, $lesson)) return $redirect;
        abort_unless($lesson->youtube_video_id, 404);
        $enrollment->lessonProgress()->updateOrCreate(
            ['course_lesson_id' => $lesson->id],
            ['video_watched_at' => now()]
        );

        return back();
    }

    public function openMaterial(CourseLessonMaterial $material): RedirectResponse
    {
        $lesson = $material->lesson;
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $lesson->module->course_id)
            ->firstOrFail();

        if ($redirect = $this->lessonAccessRedirect($enrollment, $lesson->module->course, $lesson)) return $redirect;
        LessonMaterialView::firstOrCreate(
            ['enrollment_id' => $enrollment->id, 'course_lesson_material_id' => $material->id],
            ['opened_at' => now()]
        );

        return back();
    }

    public function confirmMaterialViewed(CourseLessonMaterial $material): RedirectResponse
    {
        $lesson = $material->lesson;
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $lesson->module->course_id)
            ->firstOrFail();

        if ($redirect = $this->lessonAccessRedirect($enrollment, $lesson->module->course, $lesson)) return $redirect;
        $view = LessonMaterialView::where('enrollment_id', $enrollment->id)
            ->where('course_lesson_material_id', $material->id)
            ->first();

        if (!$view || now()->diffInSeconds($view->opened_at) < self::MATERIAL_MIN_DWELL_SECONDS) {
            return back()->with('error', 'Todavia no paso el tiempo minimo para marcar este material como visto.');
        }

        $view->update(['confirmed_at' => now()]);

        return back();
    }

    /**
     * Quiz del "tema" (la clase individual) - ver checklist de
     * requerimientos, Examenes audio 10: unas pocas preguntas por tema,
     * hay que acertar todas (no hay nota minima parcial aca) e intentos
     * ilimitados. Requiere haber visto el video y los materiales, igual
     * que completar la clase.
     */
    public function lessonQuizShow(Course $course, CourseLesson $lesson): Response|RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        if ($redirect = $this->lessonAccessRedirect($enrollment, $course, $lesson)) return $redirect;
        $lesson->load('exam.questions.options', 'materials');
        $this->assertLessonContentReady($enrollment, $lesson);

        abort_unless($lesson->exam && $lesson->exam->questions->count() > 0, 404, 'Esta clase no tiene quiz configurado.');

        return Inertia::render('Aula/LeccionQuiz', [
            'course' => app(StudentLearningPayload::class)->course($course),
            'lesson' => app(StudentLearningPayload::class)->lesson($lesson, true),
            'lastAttempt' => $enrollment->bestExamAttempt($lesson->exam->id),
        ]);
    }

    public function lessonQuizSubmit(Request $request, Course $course, CourseLesson $lesson): RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        if ($redirect = $this->lessonAccessRedirect($enrollment, $course, $lesson)) return $redirect;
        $this->assertLessonContentReady($enrollment, $lesson);
        $exam = $lesson->exam;
        abort_unless($exam, 404, 'Esta clase no tiene quiz configurado.');
        if ($enrollment->hasPassedExam($exam->id)) {
            return redirect()->route('aula.leccion.quiz', [$course, $lesson])->with('success', 'Ya aprobaste este quiz.');
        }

        $data = $request->validate([
            'answers' => ['present', 'array', 'max:500'],
        ]);

        $questions = $exam->questions()->with('options')->get();
        $this->assertExamAnswers($questions, $data['answers']);

        $result = DB::transaction(function () use ($enrollment, $exam, $questions, $data) {
            $attempt = ExamAttempt::create([
                'enrollment_id' => $enrollment->id,
                'exam_id' => $exam->id,
                'submitted_at' => now(),
            ]);

            $correctCount = 0;

            foreach ($questions as $question) {
                $graded = $this->gradeQuestion($question, $data['answers'][$question->id] ?? null);

                if ($graded['is_correct']) {
                    $correctCount++;
                }

                $attempt->answers()->create([
                    'exam_question_id' => $question->id,
                    'exam_question_option_id' => $graded['option_id'],
                    'answer_text' => $graded['answer_text'],
                    'is_correct' => $graded['is_correct'],
                ]);
            }

            $total = max($questions->count(), 1);
            $score = round(($correctCount / $total) * 20, 1);
            // Quiz de tema: si falla una sola pregunta, no aprueba - no hay
            // nota minima parcial como en el examen de modulo/final.
            $passed = $correctCount === $total;

            $attempt->update(['score' => $score, 'passed' => $passed]);

            return $attempt;
        });

        return redirect()
            ->route('aula.leccion.quiz', [$course, $lesson])
            ->with('success', $result->passed
                ? '¡Aprobaste el quiz de la clase!'
                : 'Fallaste al menos una pregunta. Repasa el tema y vuelve a intentarlo.');
    }

    public function moduleQuizShow(Course $course, CourseModule $module): Response|RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        if ($redirect = $this->moduleAccessRedirect($enrollment, $course, $module)) {
            return $redirect;
        }

        $module->load('exam.questions.options', 'lessons');

        $completedLessonIds = $enrollment->lessonProgress()
            ->whereNotNull('completed_at')
            ->pluck('course_lesson_id');
        $moduleLessonsCompleted = $module->lessons->every(fn ($l) => $completedLessonIds->contains($l->id));

        abort_unless($moduleLessonsCompleted, 403, 'Debes completar todas las clases del modulo antes de rendir el quiz.');
        abort_unless($module->exam && $module->exam->questions->count() > 0, 404, 'Este modulo no tiene quiz configurado.');

        $runner = app(ModuleExamRunner::class);
        $session = $runner->pending($enrollment, $module->exam);
        if ($session && now()->greaterThanOrEqualTo($session->expires_at)) {
            $attempt = $runner->finish($enrollment, $module->exam, $session->token, []);
            if ($attempt->passed) {
                $this->certifyIfReady($enrollment);
                return redirect()->route('aula.modulo.quiz', [$course, $module]);
            }
            return $this->failedModuleRedirect($enrollment, $course, $module, true);
        }
        $count = $enrollment->examAttempts()->where('exam_id', $module->exam->id)->count();
        $payload = app(StudentLearningPayload::class)->module($module);
        $payload['exam']['questions'] = $session ? $session->publicQuestions() : [];
        return Inertia::render('Aula/ModuloQuiz', [
            'course' => app(StudentLearningPayload::class)->course($course),
            'module' => $payload,
            'lastAttempt' => $enrollment->bestExamAttempt($module->exam->id),
            'attemptCount' => $count + ($session ? 1 : 0),
            'maxAttempts' => $module->exam->max_attempts ?? 6,
            'durationMinutes' => $module->exam->duration_minutes ?? 20,
            'questionLimit' => min($module->exam->question_limit ?? 20, $module->exam->questions->count()),
            'attempt' => $session ? ['token' => $session->token, 'expires_at' => $session->expires_at->toIso8601String(),
                'server_now' => now()->toIso8601String(), 'answers' => $session->saved_answers ?? []] : null,
        ]);
    }

    public function moduleQuizStart(Course $course, CourseModule $module): RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', Auth::id())->where('course_id', $course->id)->firstOrFail();
        if ($redirect = $this->moduleAccessRedirect($enrollment, $course, $module)) return $redirect;
        abort_unless($module->exam, 404);
        $session = app(ModuleExamRunner::class)->start($enrollment, $module->exam);
        if ($session->completed_at) {
            $result = ExamAttempt::findOrFail($session->exam_attempt_id);
            if (!$result->passed) return $this->failedModuleRedirect($enrollment, $course, $module, true);
            $this->certifyIfReady($enrollment);
        }
        return redirect()->route('aula.modulo.quiz', [$course, $module]);
    }

    public function moduleQuizSave(Request $request, Course $course, CourseModule $module): \Illuminate\Http\JsonResponse|RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', Auth::id())->where('course_id', $course->id)->firstOrFail();
        if ($redirect = $this->moduleAccessRedirect($enrollment, $course, $module)) return $redirect;
        abort_unless($module->exam, 404);
        $data = $request->validate(['attempt_token' => ['required', 'uuid'], 'answers' => ['present', 'array', 'max:500']]);
        $saved = app(ModuleExamRunner::class)->save($enrollment, $module->exam, $data['attempt_token'], $data['answers']);
        return response()->json(['saved' => $saved]);
    }

    public function moduleQuizSubmit(Request $request, Course $course, CourseModule $module): RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        if ($redirect = $this->moduleAccessRedirect($enrollment, $course, $module)) {
            return $redirect;
        }

        $exam = $module->exam;
        abort_unless($exam, 404, 'Este modulo no tiene quiz configurado.');
        if ($enrollment->hasPassedExam($exam->id)) {
            return redirect()->route('aula.modulo.quiz', [$course, $module])->with('success', 'Ya aprobaste este examen.');
        }

        $data = $request->validate([
            'attempt_token' => ['required', 'uuid'],
            'answers' => ['present', 'array', 'max:500'],
        ]);

        $module->load('lessons.materials', 'lessons.exam');
        $result = app(ModuleExamRunner::class)->finish($enrollment, $exam, $data['attempt_token'], $data['answers']);

        if (!$result->passed) {
            return $this->failedModuleRedirect($enrollment, $course, $module);
        }

        $this->certifyIfReady($enrollment);

        return redirect()
            ->route('aula.modulo.quiz', [$course, $module])
            ->with('success', '¡Aprobaste el quiz! Ya puedes continuar con el siguiente modulo.');
    }

    private function failedModuleRedirect(Enrollment $enrollment, Course $course, CourseModule $module, bool $expired = false): RedirectResponse
    {
        $limit = $module->exam->max_attempts ?? 6;
        if ($enrollment->examAttempts()->where('exam_id', $module->exam->id)->count() >= $limit) {
            return redirect()->route('aula.mis-cursos')->with('error', "Agotaste los {$limit} intentos del examen de {$module->title}. Contacta con administración.");
        }
        return redirect()->route('aula.leccion', [$course, $module->lessons()->first()])
            ->with('error', $expired ? 'El tiempo terminó. Repasa el módulo antes de volver a intentar el examen.'
                : 'No alcanzaste 13/20. Repasa el módulo antes de volver a intentar el examen.');
    }

    /**
     * Corrige una pregunta segun su tipo (opcion multiple / verdadero-falso
     * comparten la misma forma - una opcion elegida por id; respuesta corta
     * compara texto libre contra la respuesta guardada, sin distinguir
     * mayusculas/acentos para no ser excesivamente estricto).
     *
     * @return array{option_id: ?int, answer_text: ?string, is_correct: bool}
     */
    private function gradeQuestion(ExamQuestion $question, mixed $submitted): array
    {
        if ($question->isShortAnswer()) {
            $correctOption = $question->options->firstWhere('is_correct', true);
            $submittedText = is_string($submitted) ? trim($submitted) : '';
            $normalize = fn (string $s) => Str::of($s)->lower()->ascii()->trim()->toString();
            $isCorrect = $correctOption
                && $submittedText !== ''
                && $normalize($submittedText) === $normalize($correctOption->option_text);

            return ['option_id' => null, 'answer_text' => $submittedText ?: null, 'is_correct' => (bool) $isCorrect];
        }

        $selectedOptionId = is_numeric($submitted) ? (int) $submitted : null;
        $selectedOption = $question->options->firstWhere('id', $selectedOptionId);
        if ($submitted !== null && $submitted !== '' && !$selectedOption) {
            throw ValidationException::withMessages(['answers' => 'La opción seleccionada no pertenece a la pregunta.']);
        }

        return [
            'option_id' => $selectedOption?->id,
            'answer_text' => null,
            'is_correct' => (bool) ($selectedOption?->is_correct),
        ];
    }

    public function completeLesson(Course $course, CourseLesson $lesson): RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        if ($redirect = $this->lessonAccessRedirect($enrollment, $course, $lesson)) return $redirect;
        $this->assertLessonContentReady($enrollment, $lesson);
        if ($lesson->exam && $lesson->exam->questions()->count() > 0 && !$enrollment->hasPassedExam($lesson->exam->id)) {
            return back()->with('error', 'Tienes que aprobar el quiz de la clase antes de completarla.');
        }

        $enrollment->lessonProgress()->firstOrCreate(
            ['course_lesson_id' => $lesson->id],
            ['completed_at' => now()]
        )->update(['completed_at' => now()]);

        $this->certifyIfReady($enrollment);

        return back()->with('success', 'Clase completada.');
    }

    private function lessonAccessRedirect(Enrollment $enrollment, Course $course, CourseLesson $lesson): ?RedirectResponse
    {
        abort_unless($lesson->module && (int) $lesson->module->course_id === (int) $course->id, 404);
        abort_unless(in_array($enrollment->status, ['active', 'completed'], true), 403);
        if ($redirect = $this->accessBlockRedirect($enrollment, $course, $lesson)) return $redirect;
        $course->load('modules.lessons.exam.questions', 'modules.exam.questions');
        $done = $enrollment->lessonProgress()->whereNotNull('completed_at')->pluck('course_lesson_id');
        foreach ($course->modules as $module) {
            if ($module->id === $lesson->course_module_id) {
                foreach ($module->lessons as $previous) {
                    if ($previous->id === $lesson->id) return null;
                    if (!$done->contains($previous->id)) {
                        return redirect()->route('aula.leccion', [$course, $previous])->with('error', 'Completa las clases anteriores antes de continuar.');
                    }
                }
                abort(404);
            }
            foreach ($module->lessons as $previous) {
                if (!$done->contains($previous->id)) {
                    return redirect()->route('aula.leccion', [$course, $previous])->with('error', 'Completa las clases anteriores antes de continuar.');
                }
            }
            if ($module->exam && $module->exam->questions->isNotEmpty() && !$enrollment->hasPassedExam($module->exam->id)) {
                return redirect()->route('aula.modulo.quiz', [$course, $module])->with('error', 'Aprueba el examen del módulo anterior antes de continuar.');
            }
        }
        abort(404);
    }

    private function moduleAccessRedirect(Enrollment $enrollment, Course $course, CourseModule $module): ?RedirectResponse
    {
        abort_unless((int) $module->course_id === (int) $course->id, 404);
        abort_unless(in_array($enrollment->status, ['active', 'completed'], true), 403);
        if ($redirect = $this->accessBlockRedirect($enrollment, $course, module: $module)) return $redirect;
        $course->load('modules.lessons.exam.questions', 'modules.exam.questions');
        $done = $enrollment->lessonProgress()->whereNotNull('completed_at')->pluck('course_lesson_id');
        foreach ($course->modules as $prior) {
            foreach ($prior->lessons as $lesson) {
                if (!$done->contains($lesson->id)) {
                    return redirect()->route('aula.leccion', [$course, $lesson])->with('error', 'Completa las clases del módulo antes de rendir el examen.');
                }
            }
            if ($prior->id === $module->id) return null;
            if ($prior->exam && $prior->exam->questions->isNotEmpty() && !$enrollment->hasPassedExam($prior->exam->id)) {
                return redirect()->route('aula.modulo.quiz', [$course, $prior])->with('error', 'Aprueba el examen del módulo anterior antes de continuar.');
            }
        }
        abort(404);
    }

    private function assertLessonContentReady(Enrollment $enrollment, CourseLesson $lesson): void
    {
        if ($lesson->youtube_video_id) {
            abort_unless($enrollment->lessonProgress()->where('course_lesson_id', $lesson->id)->whereNotNull('video_watched_at')->exists(),
                403, 'Termina de ver el video antes de continuar.');
        }
        $materials = $lesson->materials()->pluck('id');
        if ($materials->isNotEmpty()) {
            $count = LessonMaterialView::where('enrollment_id', $enrollment->id)->whereIn('course_lesson_material_id', $materials)->whereNotNull('confirmed_at')->count();
            abort_unless($count >= $materials->count(), 403, 'Revisa todos los materiales antes de continuar.');
        }
    }

    private function assertExamAnswers(\Illuminate\Support\Collection $questions, array $answers): void
    {
        abort_if($questions->isEmpty(), 404, 'Este examen no tiene preguntas.');
        $ids = $questions->pluck('id')->map(fn ($id) => (string) $id)->all();
        foreach ($answers as $id => $answer) {
            if (!in_array((string) $id, $ids, true) || ($answer !== null && !is_string($answer) && !is_int($answer))
                || (is_string($answer) && mb_strlen($answer) > 2000)) {
                throw ValidationException::withMessages(['answers' => 'Las respuestas contienen una pregunta o un valor no válido.']);
            }
        }
    }

    /**
     * No hay examen final de curso aparte - el estudiante se certifica
     * apenas completa todas las clases y aprueba el examen de cada modulo
     * que tenga uno configurado. Se llama despues de completar una clase y
     * despues de aprobar un quiz de modulo, que son los dos unicos lugares
     * donde ese estado puede volverse true.
     */
    private function certifyIfReady(Enrollment $enrollment): void
    {
        if ($enrollment->isTrulyCompleted() || !$enrollment->isReadyToCertify()) {
            return;
        }

        $enrollment->update(['status' => 'completed', 'completed_at' => now()]);

        if (!$enrollment->certificate()->exists()) {
            // Each evaluated module has equal weight; topic quizzes are excluded.
            $examIds = $enrollment->course->modules
                ->filter(fn ($module) => $module->exam && $module->exam->questions->isNotEmpty())
                ->map(fn ($module) => $module->exam->id);
            $scores = $enrollment->examAttempts()
                ->whereIn('exam_id', $examIds)->where('passed', true)
                ->get()->groupBy('exam_id')->map(fn ($attempts) => $attempts->max('score'));
            $issuedAt = now();
            $enrollment->certificate()->create([
                'code' => Certificate::generateUniqueCode(),
                'issued_at' => $issuedAt,
                'expires_at' => $issuedAt->copy()->addYearNoOverflow(),
                'final_score' => $scores->isEmpty() ? null : round($scores->avg(), 2),
                'signatories' => $enrollment->course->certificate_signatories,
            ]);
        }
    }
}
