<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula\Course;
use App\Models\Aula\ExamQuestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    public function storeQuestion(Request $request, Course $course): RedirectResponse
    {
        $data = $this->validated($request);

        DB::transaction(function () use ($course, $data) {
            $exam = $course->exam()->firstOrCreate([], ['title' => 'Examen final']);

            $question = $exam->questions()->create([
                'question' => $data['question'],
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

        return back()->with('success', 'Pregunta agregada al examen.');
    }

    public function updateQuestion(Request $request, ExamQuestion $question): RedirectResponse
    {
        $data = $this->validated($request);

        DB::transaction(function () use ($question, $data) {
            $question->update(['question' => $data['question']]);

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
            'options' => ['required', 'array', 'min:2'],
            'options.*.option_text' => ['required', 'string', 'max:255'],
            'options.*.is_correct' => ['nullable', 'boolean'],
        ]);
    }
}
