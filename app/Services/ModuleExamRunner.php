<?php

namespace App\Services;

use App\Models\Aula\Enrollment;
use App\Models\Aula\Exam;
use App\Models\Aula\ExamAttempt;
use App\Models\Aula\ExamQuestion;
use App\Models\Aula\ExamQuestionOption;
use App\Models\Aula\ModuleExamSession;
use App\Models\Aula\LessonProgress;
use App\Models\Aula\LessonMaterialView;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ModuleExamRunner
{
    public function pending(Enrollment $enrollment, Exam $exam): ?ModuleExamSession
    {
        return ModuleExamSession::where('enrollment_id', $enrollment->id)->where('exam_id', $exam->id)->whereNull('completed_at')->first();
    }

    public function start(Enrollment $enrollment, Exam $exam): ModuleExamSession
    {
        return DB::transaction(function () use ($enrollment, $exam) {
            $this->lockEnrollment($enrollment, $exam);
            if ($pending = $this->pending($enrollment, $exam)) {
                if (now()->greaterThanOrEqualTo($pending->expires_at)) $this->finish($enrollment, $exam, $pending->token, []);
                return $pending->fresh();
            }
            if ($enrollment->hasPassedExam($exam->id)) {
                throw ValidationException::withMessages(['exam' => 'Ya aprobaste este examen.']);
            }
            if ($enrollment->examAttempts()->where('exam_id', $exam->id)->count() >= ($exam->max_attempts ?? 6)) {
                throw ValidationException::withMessages(['exam' => 'Agotaste los intentos de este examen. Contacta con administración.']);
            }
            $questions = $exam->questions()->with('options')->reorder()->inRandomOrder()->limit($exam->question_limit ?? 20)->get();
            abort_if($questions->isEmpty(), 404, 'Este examen no tiene preguntas.');
            $snapshot = $questions->map(fn ($q) => [
                'id' => $q->id, 'question' => $q->question, 'type' => $q->type,
                'options' => $q->options->shuffle()->map(fn ($o) => ['id' => $o->id, 'option_text' => $o->option_text, 'is_correct' => $o->is_correct])->all(),
            ])->all();
            return ModuleExamSession::create(['token' => (string) Str::uuid(), 'enrollment_id' => $enrollment->id,
                'exam_id' => $exam->id, 'questions' => $snapshot, 'saved_answers' => [],
                'started_at' => now(), 'expires_at' => now()->addMinutes($exam->duration_minutes ?? 20)]);
        });
    }

    public function save(Enrollment $enrollment, Exam $exam, string $token, array $answers): bool
    {
        return DB::transaction(function () use ($enrollment, $exam, $token, $answers) {
            $this->lockEnrollment($enrollment, $exam);
            $session = $this->session($enrollment, $exam, $token);
            if ($session->completed_at || now()->greaterThanOrEqualTo($session->expires_at)) return false;
            $this->validateAnswers($session, $answers);
            $session->update(['saved_answers' => $answers]);
            return true;
        });
    }

    public function finish(Enrollment $enrollment, Exam $exam, string $token, array $answers): ExamAttempt
    {
        return DB::transaction(function () use ($enrollment, $exam, $token, $answers) {
            $this->lockEnrollment($enrollment, $exam);
            $session = $this->session($enrollment, $exam, $token);
            if ($session->completed_at) return ExamAttempt::findOrFail($session->exam_attempt_id);
            // Late requests cannot replace answers already received before the deadline.
            if (now()->greaterThanOrEqualTo($session->expires_at)) $answers = $session->saved_answers ?? [];
            $this->validateAnswers($session, $answers);
            $attempt = ExamAttempt::create(['enrollment_id' => $enrollment->id, 'exam_id' => $exam->id, 'submitted_at' => now()]);
            $correct = 0;
            foreach ($session->questions as $question) {
                $answer = $answers[$question['id']] ?? null;
                $options = collect($question['options']); $selected = null; $text = null;
                if ($question['type'] === 'short_answer') {
                    $expected = $options->firstWhere('is_correct', true);
                    $text = is_string($answer) ? trim($answer) : '';
                    $normalize = fn ($s) => Str::of($s)->lower()->ascii()->trim()->toString();
                    $passed = $expected && $text !== '' && $normalize($text) === $normalize($expected['option_text']);
                } else {
                    $selected = $options->firstWhere('id', $answer === null || $answer === '' ? null : (int) $answer);
                    $passed = $selected && $selected['is_correct'];
                }
                if ($passed) $correct++;
                // The stored snapshot still permits grading if an administrator removed a bank question.
                if (ExamQuestion::whereKey($question['id'])->where('exam_id', $exam->id)->exists()) {
                    $optionId = $selected && ExamQuestionOption::whereKey($selected['id'])->where('exam_question_id', $question['id'])->exists() ? $selected['id'] : null;
                    $attempt->answers()->create(['exam_question_id' => $question['id'], 'exam_question_option_id' => $optionId,
                        'answer_text' => $text ?: null, 'is_correct' => (bool) $passed]);
                }
            }
            $score = round($correct / count($session->questions) * 20, 1);
            $attempt->update(['score' => $score, 'passed' => $score >= 13]);
            $session->update(['saved_answers' => $answers, 'completed_at' => now(), 'exam_attempt_id' => $attempt->id]);
            if (!$attempt->passed) $this->resetModule($enrollment, $exam);
            return $attempt;
        });
    }

    private function lockEnrollment(Enrollment $enrollment, Exam $exam): void
    {
        $locked = Enrollment::whereKey($enrollment->id)->lockForUpdate()->firstOrFail();
        abort_unless((int) $locked->course_id === (int) $exam->course_id && in_array($locked->status, ['active', 'completed'], true) && $exam->isModuleQuiz(), 403);
    }

    private function session(Enrollment $enrollment, Exam $exam, string $token): ModuleExamSession
    {
        return ModuleExamSession::where('enrollment_id', $enrollment->id)->where('exam_id', $exam->id)->where('token', $token)->lockForUpdate()->firstOrFail();
    }

    private function validateAnswers(ModuleExamSession $session, array $answers): void
    {
        $questions = collect($session->questions)->keyBy('id');
        foreach ($answers as $id => $answer) {
            $question = $questions->get($id);
            if (!$question || ($answer !== null && !is_int($answer) && !is_string($answer)) || (is_string($answer) && mb_strlen($answer) > 2000)) {
                throw ValidationException::withMessages(['answers' => 'Las respuestas no pertenecen a este intento.']);
            }
            if ($question['type'] !== 'short_answer' && $answer !== null && $answer !== ''
                && (!is_numeric($answer) || !collect($question['options'])->contains('id', (int) $answer))) {
                throw ValidationException::withMessages(['answers' => 'La opción no pertenece a la pregunta de este intento.']);
            }
        }
    }

    private function resetModule(Enrollment $enrollment, Exam $exam): void
    {
        $module = $exam->courseModule()->with('lessons.materials', 'lessons.exam')->firstOrFail();
        $lessonIds = $module->lessons->pluck('id');
        $materialIds = $module->lessons->flatMap->materials->pluck('id');
        $topicIds = $module->lessons->pluck('exam.id')->filter();
        LessonProgress::where('enrollment_id', $enrollment->id)->whereIn('course_lesson_id', $lessonIds)->delete();
        LessonMaterialView::where('enrollment_id', $enrollment->id)->whereIn('course_lesson_material_id', $materialIds)->delete();
        ExamAttempt::where('enrollment_id', $enrollment->id)->whereIn('exam_id', $topicIds)->delete();
    }
}
