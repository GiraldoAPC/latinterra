<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula\CourseLesson;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LessonExamController extends Controller
{
    public function storeQuestion(Request $request, CourseLesson $lesson): RedirectResponse
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:1000'],
            'type' => ['required', 'in:multiple_choice,true_false,short_answer'],
            'options' => ['required', 'array', 'min:1'],
            'options.*.option_text' => ['required', 'string', 'max:255'],
            'options.*.is_correct' => ['nullable', 'boolean'],
        ]);

        DB::transaction(function () use ($lesson, $data) {
            $exam = $lesson->exam()->firstOrCreate(
                ['course_lesson_id' => $lesson->id],
                [
                    'course_id' => $lesson->module->course_id,
                    'title' => 'Quiz: ' . $lesson->title,
                ]
            );

            $question = $exam->questions()->create([
                'question' => $data['question'],
                'type' => $data['type'],
                'position' => $exam->questions()->max('position') + 1,
            ]);

            foreach ($data['options'] as $i => $option) {
                $question->options()->create([
                    'option_text' => $option['option_text'],
                    'is_correct' => (bool) ($option['is_correct'] ?? false),
                    'position' => $i,
                ]);
            }
        });

        return back()->with('success', 'Pregunta agregada al quiz de la clase.');
    }
}
