<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula\Course;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        $courses = Course::withCount(['enrollments', 'modules'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Courses/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->billingRules() + [
            'title' => ['required', 'string', 'max:180'],
            'summary' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_free' => ['boolean'],
            'passing_score' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $data['slug'] = $this->uniqueSlug($data['title']);

        $course = Course::create($data);

        return redirect()->route('admin.courses.edit', ['course' => $course, 'step' => 2])
            ->with('success', 'Curso creado. Ahora agrega los modulos y clases.');
    }

    public function edit(Course $course): Response
    {
        $course->load([
            'modules.lessons.materials',
            'modules.exam.questions.options',
            'exam.questions.options',
        ]);

        return Inertia::render('Admin/Courses/Edit', [
            'course' => $course,
        ]);
    }

    public function update(Request $request, Course $course): RedirectResponse
    {
        $data = $request->validate($this->billingRules() + [
            'title' => ['required', 'string', 'max:180'],
            'summary' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_free' => ['boolean'],
            'is_published' => ['boolean'],
            'passing_score' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        if ($data['title'] !== $course->title) {
            $data['slug'] = $this->uniqueSlug($data['title'], $course->id);
        }

        $course->update($data);

        return back()->with('success', 'Curso actualizado.');
    }

    public function destroy(Course $course): RedirectResponse
    {
        $course->delete();

        return redirect()->route('admin.courses.index')->with('success', 'Curso eliminado.');
    }

    private function billingRules(): array
    {
        return [
            'billing_type' => ['nullable', 'in:unico,matricula_mensualidad'],
            'enrollment_fee' => ['nullable', 'numeric', 'min:0'],
            'monthly_fee' => ['nullable', 'numeric', 'min:0'],
            'duration_months' => ['nullable', 'integer', 'min:1', 'max:60'],
            'payment_required' => ['boolean'],
            'min_age' => ['nullable', 'integer', 'min:0', 'max:99'],
        ];
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;

        while (
            Course::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base . '-' . (++$i);
        }

        return $slug;
    }
}
