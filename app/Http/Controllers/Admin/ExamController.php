<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula\ExamQuestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Edicion/borrado de preguntas de examen generico - usado por los quices de
 * modulo (ModuleExamController) y de clase (LessonExamController), que solo
 * necesitan crear la pregunta la primera vez; estas dos acciones son
 * identicas sin importar de que exam venga la pregunta.
 */
class ExamController extends Controller
{
    public function updateQuestion(Request $request, ExamQuestion $question): RedirectResponse
    {
        $data = $this->validated($request);

        DB::transaction(function () use ($question, $data) {
            $question->update(['question' => $data['question'], 'type' => $data['type']]);

            $question->options()->delete();
            foreach ($data['options'] as $i => $option) {
                $question->options()->create([
                    'option_text' => $option['option_text'],
                    'is_correct' => (bool) ($option['is_correct'] ?? false),
                    'position' => $i,
                ]);
            }
        });

        return back()->with('success', 'Pregunta actualizada.');
    }

    public function destroyQuestion(ExamQuestion $question): RedirectResponse
    {
        $question->delete();

        return back()->with('success', 'Pregunta eliminada.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'question' => ['required', 'string', 'max:1000'],
            'type' => ['required', 'in:multiple_choice,true_false,short_answer'],
            'options' => ['required', 'array', 'min:1'],
            'options.*.option_text' => ['required', 'string', 'max:255'],
            'options.*.is_correct' => ['nullable', 'boolean'],
        ]);
    }
}
