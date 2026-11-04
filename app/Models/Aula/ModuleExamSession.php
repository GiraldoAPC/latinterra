<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Model;

class ModuleExamSession extends Model
{
    protected $guarded = [];
    protected $hidden = ['questions', 'saved_answers'];
    protected $casts = ['questions' => 'array', 'saved_answers' => 'array', 'started_at' => 'datetime', 'expires_at' => 'datetime', 'completed_at' => 'datetime'];

    public function publicQuestions(): array
    {
        return collect($this->questions)->map(fn ($question) => [
            'id' => $question['id'], 'question' => $question['question'], 'type' => $question['type'],
            'options' => $question['type'] === 'short_answer' ? [] : collect($question['options'])->map(fn ($option) => [
                'id' => $option['id'], 'option_text' => $option['option_text'],
            ])->all(),
        ])->all();
    }
}
