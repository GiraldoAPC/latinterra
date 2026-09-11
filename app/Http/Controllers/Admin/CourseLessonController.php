<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula\CourseLesson;
use App\Models\Aula\CourseModule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CourseLessonController extends Controller
{
    public function store(Request $request, CourseModule $module): RedirectResponse
    {
        $data = $this->validated($request);
        $data['position'] = $module->lessons()->max('position') + 1;

        $module->lessons()->create($data);

        return back()->with('success', 'Clase agregada.');
    }

    public function update(Request $request, CourseLesson $lesson): RedirectResponse
    {
        $lesson->update($this->validated($request));

        return back()->with('success', 'Clase actualizada.');
    }

    public function destroy(CourseLesson $lesson): RedirectResponse
    {
        $lesson->delete();

        return back()->with('success', 'Clase eliminada.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string'],
            'youtube_video_id' => ['required', 'string', 'max:50'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
        ]);
    }
}
