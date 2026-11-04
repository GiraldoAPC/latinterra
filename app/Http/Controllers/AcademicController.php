<?php

namespace App\Http\Controllers;

use App\Models\Aula\Course;
use App\Models\Aula\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AcademicController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        return Inertia::render('Academic/Index', [
            'canCoordinate' => $user->canCoordinate(),
            'courses' => Course::when(!$user->canCoordinate(), fn ($q) => $q->whereHas('instructors', fn ($q) => $q->where('users.id', $user->id)))
                ->withCount('enrollments')->orderBy('title')->paginate(20)->through(fn ($course) => [
                    'id' => $course->id, 'title' => $course->title, 'students' => $course->enrollments_count,
                ]),
        ]);
    }

    public function show(Request $request, Course $course): Response
    {
        $user = $request->user();
        abort_unless($user->canCoordinate() || $course->instructors()->where('users.id', $user->id)->exists(), 403);
        $modules = $course->modules()->with('exam')->get();
        $lessonCount = $course->lessons()->count();
        return Inertia::render('Academic/Show', [
            'course' => ['id' => $course->id, 'title' => $course->title, 'summary' => $course->summary],
            'canCoordinate' => $user->canCoordinate(),
            'assignedIds' => $course->instructors()->pluck('users.id'),
            'instructors' => $user->canCoordinate() ? User::where('role', 'instructor')->where('is_active', true)->orderBy('name')->get(['id', 'name'])
                ->map(fn ($instructor) => ['id' => $instructor->id, 'name' => $instructor->name]) : [],
            'enrollments' => Enrollment::where('course_id', $course->id)->with('user:id,name', 'lessonProgress', 'examAttempts')->orderBy('id')->paginate(30)
                ->through(fn ($enrollment) => [
                    'id' => $enrollment->id, 'name' => $enrollment->user->name,
                    'progress' => $lessonCount ? min(100, (int) round($enrollment->lessonProgress->whereNotNull('completed_at')->count() / $lessonCount * 100)) : 0,
                    'module_scores' => $modules->filter(fn ($module) => $module->exam)->map(fn ($module) => [
                        'title' => $module->title,
                        'score' => $enrollment->examAttempts->where('exam_id', $module->exam->id)->max('score'),
                    ])->values(),
                ]),
        ]);
    }

    public function assign(Request $request, Course $course): RedirectResponse
    {
        abort_unless($request->user()->canCoordinate(), 403);
        $data = $request->validate(['instructor_ids' => ['present', 'array', 'max:20'],
            'instructor_ids.*' => ['integer', 'distinct', Rule::exists('users', 'id')->where('role', 'instructor')->where('is_active', true)]]);
        DB::transaction(function () use ($course, $data) {
            Course::whereKey($course->id)->lockForUpdate()->firstOrFail();
            $instructors = User::whereIn('id', $data['instructor_ids'])->where('role', 'instructor')->where('is_active', true)->orderBy('id')->lockForUpdate()->get();
            if ($instructors->count() !== count($data['instructor_ids'])) {
                throw ValidationException::withMessages(['instructor_ids' => 'Selecciona instructores activos.']);
            }
            $course->instructors()->sync($data['instructor_ids']);
        });
        return back()->with('success', 'Instructores asignados al curso.');
    }
}
