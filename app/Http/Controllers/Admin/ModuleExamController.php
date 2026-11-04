<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula\CourseModule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ModuleExamController extends Controller
{
    public function settings(Request $request, CourseModule $module): RedirectResponse
    {
        $data = $request->validate(['max_attempts' => ['required', 'integer', 'min:1', 'max:20'],
            'question_limit' => ['required', 'integer', 'in:10,15,20'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:180']]);
        $exam = $module->exam()->firstOrCreate(['course_module_id' => $module->id],
            ['course_id' => $module->course_id, 'title' => 'Quiz: '.$module->title, 'passing_score' => 13]);
        $exam->update($data);
        return back()->with('success', 'Configuración guardada. Los intentos en curso conservan sus preguntas y vencimiento.');
    }

    public function storeQuestion(Request $request, CourseModule $module): RedirectResponse
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:1000'],
            'type' => ['required', 'in:multiple_choice,true_false,short_answer'],
            'options' => ['required', 'array', 'min:1'],
            'options.*.option_text' => ['required', 'string', 'max:255'],
            'options.*.is_correct' => ['nullable', 'boolean'],
        ]);

        DB::transaction(function () use ($module, $data) {
            $exam = $module->exam()->firstOrCreate(
                ['course_module_id' => $module->id],
                [
                    'course_id' => $module->course_id,
                    'title' => 'Quiz: ' . $module->title,
                    'passing_score' => 60,
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

        return back()->with('success', 'Pregunta agregada al quiz del modulo.');
    }
}
