<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\CourseLesson;
use App\Models\CourseOrder;
use App\Models\Enrollment;
use App\Models\ExamAttempt;
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

        if ($course->is_free || (float) $course->price <= 0) {
            Enrollment::create([
                'user_id' => $userId,
                'course_id' => $course->id,
                'status' => 'active',
            ]);

            return redirect()->route('aula.mis-cursos')->with('success', 'Te inscribiste al curso.');
        }

        // Curso de pago: aun no hay pasarela integrada. Se deja la orden en
        // "pending" para que un admin la confirme manualmente por ahora.
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
                    'status' => $e->status,
                    'course' => $e->course,
                    'progress' => $e->progressPercent(),
                    'has_certificate' => $e->certificate()->exists(),
                ];
            });

        return Inertia::render('Aula/MisCursos', [
            'enrollments' => $enrollments,
        ]);
    }

    public function lesson(Course $course, CourseLesson $lesson): Response
    {
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        $course->load('modules.lessons');
        $completedLessonIds = $enrollment->lessonProgress()
            ->whereNotNull('completed_at')
            ->pluck('course_lesson_id');

        return Inertia::render('Aula/Leccion', [
            'course' => $course,
            'lesson' => $lesson,
            'enrollment' => [
                'id' => $enrollment->id,
                'progress' => $enrollment->progressPercent(),
            ],
            'completedLessonIds' => $completedLessonIds,
            'allCompleted' => $enrollment->allLessonsCompleted(),
        ]);
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
            'lastAttempt' => $enrollment->bestExamAttempt(),
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
