<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula\CourseLesson;
use App\Models\Aula\CourseLessonMaterial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourseLessonMaterialController extends Controller
{
    public function store(Request $request, CourseLesson $lesson): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'file' => ['required', 'file', 'max:20480', 'mimes:pdf,ppt,pptx,doc,docx,xls,xlsx,zip'],
        ]);

        $file = $request->file('file');
        $path = $file->store('course-materials', 'public');

        $lesson->materials()->create([
            'title' => $data['title'],
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
        ]);

        return back()->with('success', 'Material agregado.');
    }

    public function destroy(CourseLessonMaterial $material): RedirectResponse
    {
        Storage::disk('public')->delete($material->file_path);
        $material->delete();

        return back()->with('success', 'Material eliminado.');
    }
}
