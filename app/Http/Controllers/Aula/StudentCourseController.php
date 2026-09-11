<?php

namespace App\Http\Controllers\Aula;

use App\Http\Controllers\Controller;
use App\Models\Aula\Certificate;
use App\Models\Aula\Course;
use App\Models\Aula\CourseLesson;
use App\Models\Aula\CourseModule;
use App\Models\Aula\CourseOrder;
use App\Models\Aula\Enrollment;
use App\Models\Aula\ExamAttempt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StudentCourseController extends Controller
{
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

        $course->load('modules.lessons');

        $enrollment = null;
        $pendingOrder = null;

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
        }

        return Inertia::render('Aula/CursoDetalle', [
            'course' => $course,
            'enrollment' => $enrollment,
            'pendingOrder' => $pendingOrder,
        ]);
    }

    public function enroll(Course $course): RedirectResponse
    {
        abort_unless($course->is_published, 404);

        $userId = Auth::id();

        $existing = Enrollment::where('user_id', $userId)->where('course_id', $course->id)->first();
        if ($existing) {
            return redirect()->route('aula.mis-cursos');
        }

        $birthDate = Auth::user()->birth_date;
        if ($course->min_age && $birthDate && $birthDate->age < $course->min_age) {
            return back()->with('error', "Este curso requiere que tengas al menos {$course->min_age} años.");
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
        ]);

        return back()->with('success', 'Tu solicitud fue registrada. Nos contactaremos para coordinar el pago y activar tu acceso.');
    }

    public function myCourses(): Response
    {
        $enrollments = Enrollment::with('course')
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

        $course->load('modules.lessons');

        $completedIds = $enrollment->lessonProgress()
            ->whereNotNull('completed_at')
            ->pluck('course_lesson_id')
            ->all();

        $allLessons = $course->modules->flatMap->lessons;
        $target = $allLessons->first(fn ($l) => !in_array($l->id, $completedIds))
            ?? $allLessons->first();

        abort_unless($target, 404, 'Este curso aun no tiene clases.');

        return redirect()->route('aula.leccion', [$course, $target]);
    }

    public function lesson(Course $course, CourseLesson $lesson): Response|RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        if ($enrollment->hasBlockingDebt()) {
            return redirect()->route('aula.mis-cursos')
                ->with('error', 'Tienes una cuota vencida en este curso. Ponte al dia con tus pagos para seguir avanzando.');
        }

        $course->load('modules.lessons.materials', 'modules.exam.questions');
        $lesson->load('materials');
        $completedLessonIds = $enrollment->lessonProgress()
            ->whereNotNull('completed_at')
            ->pluck('course_lesson_id');

        $orderedLessons = $course->modules->flatMap->lessons->values();
        $index = $orderedLessons->search(fn ($l) => $l->id === $lesson->id);

        if ($index > 0) {
            $previous = $orderedLessons[$index - 1];
            if (!$completedLessonIds->contains($previous->id)) {
                return redirect()
                    ->route('aula.leccion', [$course, $previous])
                    ->with('error', 'Completa la clase anterior antes de continuar.');
            }
        }

        // Si algun modulo anterior tiene un quiz configurado y aun no fue
        // aprobado, no se puede avanzar a este modulo: se redirige al quiz.
        $moduleIndex = $course->modules->search(fn ($m) => $m->id === $lesson->course_module_id);
        foreach ($course->modules->slice(0, $moduleIndex) as $priorModule) {
            if ($priorModule->exam && $priorModule->exam->questions->count() > 0
                && !$enrollment->hasPassedExam($priorModule->exam->id)) {
                return redirect()
                    ->route('aula.modulo.quiz', [$course, $priorModule])
                    ->with('error', 'Debes aprobar el quiz del modulo anterior para continuar.');
            }
        }

        $passedModuleQuizIds = $course->modules
            ->filter(fn ($m) => $m->exam && $m->exam->questions->count() > 0)
            ->filter(fn ($m) => $enrollment->hasPassedExam($m->exam->id))
            ->pluck('id')
            ->values();

        return Inertia::render('Aula/Leccion', [
            'course' => $course,
            'lesson' => $lesson,
            'enrollment' => [
                'id' => $enrollment->id,
                'progress' => $enrollment->progressPercent(),
            ],
            'completedLessonIds' => $completedLessonIds,
            'allCompleted' => $enrollment->allLessonsCompleted(),
            'passedModuleQuizIds' => $passedModuleQuizIds,
        ]);
    }

    public function moduleQuizShow(Course $course, CourseModule $module): Response
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        $module->load('exam.questions.options', 'lessons');

        $completedLessonIds = $enrollment->lessonProgress()
            ->whereNotNull('completed_at')
            ->pluck('course_lesson_id');
        $moduleLessonsCompleted = $module->lessons->every(fn ($l) => $completedLessonIds->contains($l->id));

        abort_unless($moduleLessonsCompleted, 403, 'Debes completar todas las clases del modulo antes de rendir el quiz.');
        abort_unless($module->exam && $module->exam->questions->count() > 0, 404, 'Este modulo no tiene quiz configurado.');

        return Inertia::render('Aula/ModuloQuiz', [
            'course' => $course,
            'module' => $module,
            'lastAttempt' => $enrollment->bestExamAttempt($module->exam->id),
        ]);
    }

    public function moduleQuizSubmit(Request $request, Course $course, CourseModule $module): RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        $exam = $module->exam;
        abort_unless($exam, 404, 'Este modulo no tiene quiz configurado.');

        $data = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*' => ['required', 'integer'],
        ]);

        $questions = $exam->questions()->with('options')->get();

        $result = DB::transaction(function () use ($enrollment, $exam, $questions, $data) {
            $attempt = ExamAttempt::create([
                'enrollment_id' => $enrollment->id,
                'exam_id' => $exam->id,
                'submitted_at' => now(),
            ]);

            $correctCount = 0;

            foreach ($questions as $question) {
                $selectedOptionId = $data['answers'][$question->id] ?? null;
                $selectedOption = $question->options->firstWhere('id', $selectedOptionId);
                $isCorrect = (bool) ($selectedOption?->is_correct);

                if ($isCorrect) {
                    $correctCount++;
                }

                $attempt->answers()->create([
                    'exam_question_id' => $question->id,
                    'exam_question_option_id' => $selectedOptionId,
                    'is_correct' => $isCorrect,
                ]);
            }

            $total = max($questions->count(), 1);
            $score = round(($correctCount / $total) * 100, 2);
            $passed = $score >= (float) ($exam->passing_score ?? 60);

            $attempt->update(['score' => $score, 'passed' => $passed]);

            return $attempt;
        });

        return redirect()
            ->route('aula.modulo.quiz', [$course, $module])
            ->with('success', $result->passed
                ? '¡Aprobaste el quiz! Ya puedes continuar con el siguiente modulo.'
                : 'No alcanzaste el puntaje minimo. Puedes volver a intentarlo.');
    }

    public function completeLesson(Course $course, CourseLesson $lesson): RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        $enrollment->lessonProgress()->firstOrCreate(
            ['course_lesson_id' => $lesson->id],
            ['completed_at' => now()]
        )->update(['completed_at' => now()]);

        return back()->with('success', 'Clase completada.');
    }

    public function examShow(Course $course): Response
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        abort_unless($enrollment->allLessonsCompleted(), 403, 'Debes completar todas las clases antes de rendir el examen.');

        $course->load('exam.questions.options');

        return Inertia::render('Aula/Examen', [
            'course' => $course,
            'enrollment' => $enrollment,
            'lastAttempt' => $course->exam ? $enrollment->bestExamAttempt($course->exam->id) : null,
        ]);
    }

    public function examSubmit(Request $request, Course $course): RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        abort_unless($enrollment->allLessonsCompleted(), 403);

        $exam = $course->exam;
        abort_unless($exam, 404, 'Este curso no tiene examen configurado.');

        $data = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*' => ['required', 'integer'],
        ]);

        $questions = $exam->questions()->with('options')->get();

        $result = DB::transaction(function () use ($enrollment, $exam, $questions, $data, $course) {
            $attempt = ExamAttempt::create([
                'enrollment_id' => $enrollment->id,
                'exam_id' => $exam->id,
                'submitted_at' => now(),
            ]);

            $correctCount = 0;

            foreach ($questions as $question) {
                $selectedOptionId = $data['answers'][$question->id] ?? null;
                $selectedOption = $question->options->firstWhere('id', $selectedOptionId);
                $isCorrect = (bool) ($selectedOption?->is_correct);

                if ($isCorrect) {
                    $correctCount++;
                }

                $attempt->answers()->create([
                    'exam_question_id' => $question->id,
                    'exam_question_option_id' => $selectedOptionId,
                    'is_correct' => $isCorrect,
                ]);
            }

            $total = max($questions->count(), 1);
            $score = round(($correctCount / $total) * 100, 2);
            $passed = $score >= (float) $course->passing_score;

            $attempt->update(['score' => $score, 'passed' => $passed]);

            if ($passed) {
                $enrollment->update(['status' => 'completed', 'completed_at' => now()]);

                $certificate = $enrollment->certificate()->first();
                if (!$certificate) {
                    $enrollment->certificate()->create([
                        'code' => Certificate::generateUniqueCode(),
                        'issued_at' => now(),
                    ]);
                }
            }

            return $attempt;
        });

        return redirect()
            ->route('aula.examen', $course)
            ->with('success', $result->passed
                ? '¡Aprobaste el examen! Tu certificado ya esta disponible.'
                : 'No alcanzaste el puntaje minimo. Puedes volver a intentarlo.');
    }
}
