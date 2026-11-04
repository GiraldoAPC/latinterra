<?php

// Reuses the isolated schema and first-stage regression suite (31 checks).
require __DIR__.'/learning-access.php';

use App\Models\User;
use App\Models\Aula\Course;
use App\Models\Aula\CourseModule;
use App\Models\Aula\CourseLesson;
use App\Models\Aula\Enrollment;
use App\Models\Aula\Exam;
use App\Models\Aula\ExamQuestion;
use App\Models\Aula\ExamQuestionOption;
use App\Models\Aula\ExamAttempt;
use App\Models\Aula\ModuleExamSession;
use App\Models\Aula\LessonProgress;
use App\Services\ModuleExamRunner;
use App\Http\Controllers\Aula\StudentCourseController;
use App\Http\Controllers\Admin\ModuleExamController;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

function fixture(string $slug, User $user, int $count = 25): array
{
    $course = Course::create(['title' => $slug, 'slug' => $slug]);
    $module = CourseModule::create(['course_id' => $course->id, 'title' => 'Módulo', 'position' => 1]);
    $lesson = CourseLesson::create(['course_module_id' => $module->id, 'title' => 'Tema', 'youtube_video_id' => 'video', 'position' => 1]);
    $enrollment = Enrollment::create(['course_id' => $course->id, 'user_id' => $user->id, 'status' => 'active']);
    LessonProgress::create(['enrollment_id' => $enrollment->id, 'course_lesson_id' => $lesson->id, 'completed_at' => now(), 'video_watched_at' => now()]);
    $exam = Exam::create(['course_id' => $course->id, 'course_module_id' => $module->id, 'title' => 'Examen', 'question_limit' => 10, 'max_attempts' => 6, 'duration_minutes' => 20]);
    for ($i = 0; $i < $count; $i++) {
        $q = ExamQuestion::create(['exam_id' => $exam->id, 'question' => "Pregunta $i", 'type' => $i === 0 ? 'short_answer' : 'multiple_choice', 'position' => $i]);
        ExamQuestionOption::create(['exam_question_id' => $q->id, 'option_text' => 'CLAVE-PRIVADA-'.$i, 'is_correct' => true]);
        if ($i !== 0) ExamQuestionOption::create(['exam_question_id' => $q->id, 'option_text' => 'Alternativa', 'is_correct' => false]);
    }
    return [$course, $enrollment, $module, $exam, $lesson];
}
function correctAnswers(ModuleExamSession $session): array
{
    $answers = [];
    foreach ($session->questions as $q) {
        $option = collect($q['options'])->firstWhere('is_correct', true);
        $answers[$q['id']] = $q['type'] === 'short_answer' ? $option['option_text'] : $option['id'];
    }
    return $answers;
}
function examRejected(callable $action, string $message): void
{
    try { $action(); throw new RuntimeException($message.' (unexpectedly accepted)'); }
    catch (ValidationException $error) { check(isset($error->errors()['exam']), $message); }
}

$failure = null;
try {
    Carbon::setTestNow('2026-11-03 12:00:00');
    $user = User::create(['name' => 'Alumno de pruebas', 'role' => 'student', 'is_active' => true]); Auth::setUser($user);
    [$course, $enrollment, $module, $exam, $lesson] = fixture('temporizado', $user);
    $runner = new ModuleExamRunner(); $controller = new StudentCourseController(); testRequest();
    $ready = props($controller->moduleQuizShow($course->fresh(), $module->fresh()));
    check($ready['attempt'] === null && $ready['module']['exam']['questions'] === [], 'Opening exam page does not expose bank or consume an attempt');
    $session = $runner->start($enrollment, $exam);
    check(count($session->questions) === 10 && count(array_unique(array_column($session->questions, 'id'))) === 10, 'Attempt contains configured sample without duplicate questions');
    check($session->expires_at->equalTo(now()->addMinutes(20)), 'Deadline stored in server database');
    $again = $runner->start($enrollment, $exam);
    check($again->id === $session->id && $again->questions === $session->questions && $again->expires_at->equalTo($session->expires_at), 'Repeated start resumes same questions and deadline');
    check(!isset($session->toArray()['questions']) && !isset($session->toArray()['saved_answers']), 'Model serialization hides private snapshot');
    check(collect($session->publicQuestions())->every(fn ($q) => collect($q['options'])->every(fn ($o) => !array_key_exists('is_correct', $o))), 'Public options contain no correctness flags');
    $answers = correctAnswers($session);
    check($runner->save($enrollment, $exam, $session->token, $answers), 'Answers saved before deadline');
    $resumed = $runner->pending($enrollment, $exam);
    check($resumed->saved_answers === $answers, 'Reload restores server-saved answers');
    $outside = $exam->questions()->whereNotIn('id', array_column($session->questions, 'id'))->firstOrFail();
    invalid(fn () => $runner->save($enrollment, $exam, $session->token, [$outside->id => 1]), 'Answers outside selected sample rejected');
    $firstChoice = collect($session->questions)->first(fn ($q) => $q['type'] !== 'short_answer');
    $foreignOption = $outside->options()->firstOrFail();
    invalid(fn () => $runner->save($enrollment, $exam, $session->token, [$firstChoice['id'] => $foreignOption->id]), 'Foreign question option rejected by frozen snapshot');
    $exam->update(['duration_minutes' => 1, 'question_limit' => 20]);
    check($runner->start($enrollment, $exam)->expires_at->equalTo($session->expires_at), 'Configuration changes do not shorten active attempt');
    $key = $firstChoice['options'][0];
    ExamQuestionOption::whereKey($key['id'])->update(['is_correct' => !$key['is_correct'], 'option_text' => 'Cambiada']);
    Carbon::setTestNow($session->expires_at);
    check(!$runner->save($enrollment, $exam, $session->token, []), 'Deadline rejects new autosaved changes');
    $result = $runner->finish($enrollment, $exam, $session->token, []);
    check($result->passed && (float) $result->score === 20.0, 'Late submission uses saved answers and original correction snapshot');
    check($runner->finish($enrollment, $exam, $session->token, [99999 => 1])->id === $result->id, 'Repeated submission returns same result without duplicate attempt');
    examRejected(fn () => $runner->start($enrollment, $exam), 'Passed module cannot start another attempt');

    [$limitedCourse, $limited, $limitedModule, $limitedExam, $limitedLesson] = fixture('limitado', $user, 2);
    for ($i = 0; $i < 6; $i++) ExamAttempt::create(['enrollment_id' => $limited->id, 'exam_id' => $limitedExam->id, 'score' => 0, 'passed' => false, 'submitted_at' => now()]);
    examRejected(fn () => $runner->start($limited, $limitedExam), 'Legacy attempts count toward configured maximum');
    $limitedExam->update(['max_attempts' => 7]);
    $last = $runner->start($limited, $limitedExam);
    check(count($last->questions) === 2, 'Small bank uses all available questions');
    check($runner->start($limited, $limitedExam)->id === $last->id, 'Final allowed active attempt can still be resumed');
    try { $runner->save($enrollment, $exam, $last->token, []); throw new RuntimeException('Foreign attempt accepted'); }
    catch (Illuminate\Database\Eloquent\ModelNotFoundException $error) { check(true, 'Attempt token scoped to enrollment and exam'); }
    Carbon::setTestNow($last->expires_at->copy()->addSecond());
    $failed = $runner->finish($limited, $limitedExam, $last->token, correctAnswers($last));
    check(!$failed->passed && (float) $failed->score === 0.0, 'Unsaved answers arriving after deadline receive no credit');
    check(!$limited->lessonProgress()->exists(), 'Expired failed attempt resets module progress');
    examRejected(fn () => $runner->start($limited, $limitedExam), 'Abandoned expired attempt consumes final allowance');

    [$thirdCourse, $third, $thirdModule, $thirdExam] = fixture('envio', $user, 1);
    $thirdRun = $runner->start($third, $thirdExam);
    $safe = $thirdRun->publicQuestions()[0];
    check($safe['options'] === [], 'Single short-answer sample reveals no stored answer');
    $valid = $runner->finish($third, $thirdExam, $thirdRun->token, correctAnswers($thirdRun));
    check($valid->passed, 'On-time submission can include latest answers without waiting for autosave');
    [$expiredCourse, $expiredEnrollment, $expiredModule, $expiredExam] = fixture('pagina-vencida', $user, 2);
    $expiredRun = $runner->start($expiredEnrollment, $expiredExam);
    $saveResponse = $controller->moduleQuizSave(testRequest([], $expiredRun->token), $expiredCourse->fresh(), $expiredModule->fresh());
    check($saveResponse->getData(true)['saved'], 'Autosave controller accepts an authorized active session');
    Carbon::setTestNow($expiredRun->expires_at);
    $expiredResponse = $controller->moduleQuizShow($expiredCourse->fresh(), $expiredModule->fresh());
    check(str_contains($expiredResponse->getTargetUrl(), '/clase/') && $expiredRun->fresh()->completed_at !== null, 'Opening an expired attempt finalizes it and redirects to review');
    $request = testRequest(); $request->merge(['max_attempts' => 0, 'question_limit' => 10, 'duration_minutes' => 20]);
    try { (new ModuleExamController())->settings($request, $thirdModule); throw new RuntimeException('Invalid limit accepted'); }
    catch (ValidationException $error) { check(isset($error->errors()['max_attempts']), 'Admin settings reject invalid attempt limits'); }
    check(in_array('admin', app('router')->getRoutes()->getByName('admin.module-exam.settings')->gatherMiddleware(), true), 'Only administrative roles can change exam conditions');
} catch (Throwable $error) { $failure = $error; }
finally { Carbon::setTestNow(); }
if ($failure) { fwrite(STDERR, $failure->getMessage().PHP_EOL); exit(1); }
