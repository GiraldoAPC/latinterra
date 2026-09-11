<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula\Course;
use App\Models\Aula\CourseModule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CourseModuleController extends Controller
{
    public function store(Request $request, Course $course): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:180'],
        ]);

        $data['position'] = $course->modules()->max('position') + 1;

        $course->modules()->create($data);

        return back()->with('success', 'Modulo agregado.');
    }

    public function update(Request $request, CourseModule $module): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);

        $module->update($data);

        return back()->with('success', 'Modulo actualizado.');
    }

    public function destroy(CourseModule $module): RedirectResponse
    {
        $module->delete();

        return back()->with('success', 'Modulo eliminado.');
    }
}
