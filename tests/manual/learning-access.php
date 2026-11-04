<?php

// Uses only an isolated SQLite memory database; no live students or course data.
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\Aula\StudentCourseController;
use App\Models\User;
use App\Models\Aula\Course;
use App\Models\Aula\CourseModule;
use App\Models\Aula\CourseLesson;
use App\Models\Aula\CourseLessonMaterial;
use App\Models\Aula\Enrollment;
use App\Models\Aula\Exam;
use App\Models\Aula\ExamQuestion;
use App\Models\Aula\ExamQuestionOption;
use App\Models\Aula\ExamAttempt;
use App\Models\Aula\LessonProgress;
use App\Models\Aula\LessonMaterialView;
use App\Services\StudentLearningPayload;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

function check(bool $value, string $message): void
{
    if (!$value) throw new RuntimeException($message);
    echo "OK: $message\n";
}
function blocked(callable $action, int $status, string $message): void
{
    try { $action(); throw new RuntimeException($message.' (accepted unexpectedly)'); }
    catch (HttpException $error) { check($error->getStatusCode() === $status, $message); }
}
function invalid(callable $action, string $message): void
{
    try { $action(); throw new RuntimeException($message.' (accepted unexpectedly)'); }
    catch (ValidationException $error) { check(isset($error->errors()['answers']), $message); }
}
function testRequest(array $answers = [], ?string $token = null): Request
{
    $request = Request::create('/', 'POST', ['answers' => $answers]);
    if ($token) $request->merge(['attempt_token' => $token]);
    $request->setLaravelSession(app('session')->driver());
    $request->headers->set('X-Inertia', 'true');
    app()->instance('request', $request);
    return $request;
}
function props($response): array
{
    return $response->toResponse(request())->getData(true)['props'];
}

config(['database.default' => 'learning_test', 'database.connections.learning_test' => [
    'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true,
], 'session.driver' => 'array']);
$app['session']->start(); $app['redirect']->setSession($app['session']->driver());
Schema::create('users', function (Blueprint $table) { $table->id(); $table->string('name'); $table->string('role'); $table->boolean('is_active')->default(true); $table->string('remember_token')->nullable(); $table->timestamps(); });
foreach ([
    '2026_09_01_030002_create_courses_table', '2026_09_01_030003_create_course_modules_table',
    '2026_09_01_030004_create_course_lessons_table', '2026_09_01_030005_create_enrollments_table',
    '2026_09_01_030006_create_lesson_progress_table', '2026_09_01_030007_create_exams_table',
    '2026_09_01_030008_create_exam_questions_table', '2026_09_01_030009_create_exam_question_options_table',
    '2026_09_01_030010_create_exam_attempts_table', '2026_09_01_030011_create_exam_attempt_answers_table',
    '2026_09_01_030012_create_certificates_table',
    '2026_09_01_030014_create_course_lesson_materials_table', '2026_09_01_030015_add_module_exam_support_to_exams_table',
    '2026_09_01_030016_add_description_to_course_modules_table',
    '2026_10_04_030044_add_video_watched_at_to_lesson_progress_table',
    '2026_10_04_030045_add_access_duration_days_to_courses_table',
    '2026_10_04_030045_create_lesson_material_views_table',
    '2026_10_20_054000_add_course_lesson_id_to_exams_table',
    '2026_10_21_033906_add_type_to_exam_questions_table',
    '2026_10_21_033907_add_answer_text_to_exam_attempt_answers_table',
] as $name) {
    (require __DIR__.'/../../database/migrations/'.$name.'.php')->up();
}
Schema::table('courses', fn (Blueprint $table) => $table->boolean('payment_required')->default(false));
Schema::create('course_installments', function (Blueprint $table) { $table->id(); $table->unsignedBigInteger('enrollment_id'); $table->string('status'); $table->date('due_date'); });
(require __DIR__.'/../../database/migrations/2026_11_03_000008_add_module_exam_sessions.php')->up();
$failure = null;
try {
    Carbon::setTestNow('2026-11-03 12:00:00');
    $user = User::create(['name' => 'Alumno', 'role' => 'student', 'is_active' => true]); Auth::setUser($user);
    $course = Course::create(['title' => 'Curso', 'slug' => 'curso', 'is_published' => true]);
    $other = Course::create(['title' => 'Otro curso', 'slug' => 'otro']);
    $module = CourseModule::create(['course_id' => $course->id, 'title' => 'Módulo 1', 'position' => 1]);
    $next = CourseModule::create(['course_id' => $course->id, 'title' => 'Módulo 2', 'position' => 2]);
    $foreign = CourseModule::create(['course_id' => $other->id, 'title' => 'Ajeno', 'position' => 1]);
    $lesson = CourseLesson::create(['course_module_id' => $module->id, 'title' => 'Tema 1', 'youtube_video_id' => 'video-1', 'position' => 1]);
    $second = CourseLesson::create(['course_module_id' => $module->id, 'title' => 'Tema 2', 'youtube_video_id' => '', 'position' => 2]);
    $third = CourseLesson::create(['course_module_id' => $next->id, 'title' => 'Tema 3', 'youtube_video_id' => 'video-futuro', 'position' => 1]);
    $external = CourseLesson::create(['course_module_id' => $foreign->id, 'title' => 'Tema ajeno', 'youtube_video_id' => 'privado', 'position' => 1]);
    $enrollment = Enrollment::create(['course_id' => $course->id, 'user_id' => $user->id, 'status' => 'active']);
    $material = CourseLessonMaterial::create(['course_lesson_id' => $lesson->id, 'title' => 'Material 1', 'file_path' => 'private/example.pdf', 'original_name' => 'example.pdf']);
    $futureMaterial = CourseLessonMaterial::create(['course_lesson_id' => $second->id, 'title' => 'Material 2', 'file_path' => 'private/future.pdf', 'original_name' => 'future.pdf']);
    $topic = Exam::create(['course_id' => $course->id, 'course_lesson_id' => $lesson->id, 'title' => 'Quiz tema']);
    $exam = Exam::create(['course_id' => $course->id, 'course_module_id' => $module->id, 'title' => 'Examen módulo']);
    $q = ExamQuestion::create(['exam_id' => $topic->id, 'question' => 'Opción', 'type' => 'multiple_choice']);
    $short = ExamQuestion::create(['exam_id' => $topic->id, 'question' => 'Escribe', 'type' => 'short_answer']);
    $mq = ExamQuestion::create(['exam_id' => $exam->id, 'question' => 'Módulo', 'type' => 'multiple_choice']);
    $correct = ExamQuestionOption::create(['exam_question_id' => $q->id, 'option_text' => 'Visible', 'is_correct' => true]);
    $secret = ExamQuestionOption::create(['exam_question_id' => $short->id, 'option_text' => 'LLAVE-SOLO-SERVIDOR', 'is_correct' => true]);
    $mc = ExamQuestionOption::create(['exam_question_id' => $mq->id, 'option_text' => 'Módulo sí', 'is_correct' => true]);
    $wrong = ExamQuestionOption::create(['exam_question_id' => $mq->id, 'option_text' => 'Módulo no', 'is_correct' => false]);
    $controller = new StudentCourseController(); testRequest();
    $view = props($controller->lesson($course->fresh(), $lesson->fresh()));
    check(!str_contains(json_encode($view), 'is_correct') && !str_contains(json_encode($view), 'LLAVE-SOLO-SERVIDOR'), 'Lesson payload contains no correction flags or answer keys');
    check(!str_contains(json_encode($view['course']), 'video-futuro') && !str_contains(json_encode($view['course']), 'future.pdf'), 'Sidebar contains no future video or material URLs');
    $public = app(StudentLearningPayload::class)->publicCourse($course->fresh()->load('modules.lessons', 'prerequisiteCourse'));
    check(!str_contains(json_encode($public), 'youtube_video_id') && !isset($public['certificate_signatories']), 'Public course details expose only syllabus metadata');
    blocked(fn () => $controller->lesson($course->fresh(), $external->fresh()), 404, 'Foreign lesson GET rejected');
    blocked(fn () => $controller->completeLesson($course->fresh(), $external->fresh()), 404, 'Foreign lesson completion rejected');
    blocked(fn () => $controller->markVideoWatched($course->fresh(), $external->fresh()), 404, 'Foreign lesson video event rejected');
    blocked(fn () => $controller->moduleQuizSubmit(testRequest(), $course->fresh(), $foreign->fresh()), 404, 'Foreign module submission rejected');
    $redirect = $controller->markVideoWatched($course->fresh(), $third->fresh());
    check(str_ends_with($redirect->getTargetUrl(), '/clase/'.$lesson->id) && !LessonProgress::where('course_lesson_id', $third->id)->exists(), 'Out-of-order video event does not save progress');
    $controller->openMaterial($futureMaterial->fresh());
    check(!LessonMaterialView::where('course_lesson_material_id', $futureMaterial->id)->exists(), 'Out-of-order material opening does not save view');
    blocked(fn () => $controller->lessonQuizSubmit(testRequest([$q->id => $correct->id]), $course->fresh(), $lesson->fresh()), 403, 'Direct topic submission requires video');
    blocked(fn () => $controller->completeLesson($course->fresh(), $lesson->fresh()), 403, 'Direct completion requires video');
    $controller->markVideoWatched($course->fresh(), $lesson->fresh());
    blocked(fn () => $controller->lessonQuizShow($course->fresh(), $lesson->fresh()), 403, 'Topic GET requires confirmed material');
    blocked(fn () => $controller->lessonQuizSubmit(testRequest(), $course->fresh(), $lesson->fresh()), 403, 'Topic POST requires confirmed material');
    $controller->openMaterial($material->fresh()); $controller->confirmMaterialViewed($material->fresh());
    check(LessonMaterialView::first()->confirmed_at === null, 'Material dwell time still enforced on server');
    Carbon::setTestNow(now()->addSeconds(12)); $controller->confirmMaterialViewed($material->fresh()); testRequest();
    $quiz = props($controller->lessonQuizShow($course->fresh(), $lesson->fresh()));
    check($quiz['lesson']['exam']['questions'][1]['options'] === [] && !str_contains(json_encode($quiz), 'is_correct') && !str_contains(json_encode($quiz), 'LLAVE-SOLO-SERVIDOR'), 'Topic quiz hides short-answer key and correctness markers');
    check($correct->fresh()->toArray()['is_correct'] === true, 'Admin/server correction data remains available');
    $controller->moduleQuizSubmit(testRequest([$mq->id => $mc->id]), $course->fresh(), $module->fresh());
    check(ExamAttempt::count() === 0, 'Direct module submission before completing lessons records no attempt');
    invalid(fn () => $controller->lessonQuizSubmit(testRequest([999999 => 1]), $course->fresh(), $lesson->fresh()), 'Question from another exam rejected');
    invalid(fn () => $controller->lessonQuizSubmit(testRequest([$q->id => $mc->id]), $course->fresh(), $lesson->fresh()), 'Option from another question rejected');
    check(ExamAttempt::count() === 0, 'Invalid answers roll back attempt creation');
    $controller->lessonQuizSubmit(testRequest([$q->id => $correct->id, $short->id => 'llave-solo-servidor']), $course->fresh(), $lesson->fresh());
    check(ExamAttempt::first()->passed && (float) ExamAttempt::first()->score === 20.0, 'Valid topic answers graded on server');
    $controller->completeLesson($course->fresh(), $lesson->fresh());
    check(LessonProgress::where('course_lesson_id', $lesson->id)->whereNotNull('completed_at')->exists(), 'Valid completion still succeeds');
    $controller->openMaterial($futureMaterial->fresh()); Carbon::setTestNow(now()->addSeconds(12)); $controller->confirmMaterialViewed($futureMaterial->fresh());
    $controller->completeLesson($course->fresh(), $second->fresh()); testRequest();
    $controller->moduleQuizStart($course->fresh(), $module->fresh());
    $token = App\Models\Aula\ModuleExamSession::whereNull('completed_at')->firstOrFail()->token;
    $moduleView = props($controller->moduleQuizShow($course->fresh(), $module->fresh()));
    check(!str_contains(json_encode($moduleView), 'is_correct') && count($moduleView['module']['exam']['questions'][0]['options']) === 2, 'Module quiz displays choices without correction flags');
    $controller->markVideoWatched($course->fresh(), $third->fresh());
    check(!LessonProgress::where('course_lesson_id', $third->id)->exists(), 'Previous module exam blocks next-module progress');
    $controller->moduleQuizSubmit(testRequest([], $token), $course->fresh(), $module->fresh());
    check((float) ExamAttempt::where('exam_id', $exam->id)->first()->score === 0.0, 'Unanswered exam is graded as zero instead of failing validation');
    check(LessonProgress::whereIn('course_lesson_id', [$lesson->id, $second->id])->count() === 0 && !ExamAttempt::where('exam_id', $topic->id)->exists(), 'Failed module still resets classes and topic approval');
    foreach ([$lesson, $second] as $item) LessonProgress::create(['enrollment_id' => $enrollment->id, 'course_lesson_id' => $item->id, 'video_watched_at' => now(), 'completed_at' => now()]);
    $controller->moduleQuizStart($course->fresh(), $module->fresh());
    $token = App\Models\Aula\ModuleExamSession::whereNull('completed_at')->firstOrFail()->token;
    $controller->moduleQuizSubmit(testRequest([$mq->id => $mc->id], $token), $course->fresh(), $module->fresh());
    check(ExamAttempt::where('exam_id', $exam->id)->where('passed', true)->exists(), 'Valid completed module can pass');
    $before = ExamAttempt::count();
    $controller->moduleQuizSubmit(testRequest([$mq->id => $wrong->id]), $course->fresh(), $module->fresh());
    check(ExamAttempt::count() === $before && LessonProgress::count() === 2, 'Passed exam resubmission does not downgrade or reset progress');
    $course->update(['payment_required' => true]);
    DB::table('course_installments')->insert(['enrollment_id' => $enrollment->id, 'status' => 'pending', 'due_date' => now()->toDateString()]);
    $redirect = $controller->markVideoWatched($course->fresh(), $third->fresh());
    check(str_contains($redirect->getTargetUrl(), '/mis-cursos') && !LessonProgress::where('course_lesson_id', $third->id)->exists(), 'Debt blocks direct mutation in final module');
    $course->update(['payment_required' => false, 'access_duration_days' => 1]);
    $enrollment->created_at = now()->subDays(2); $enrollment->save();
    $redirect = $controller->completeLesson($course->fresh(), $lesson->fresh());
    check(str_contains($redirect->getTargetUrl(), '/mis-cursos'), 'Expired access blocks direct completion');
    $course->update(['access_duration_days' => null]); $enrollment->update(['status' => 'cancelled']);
    blocked(fn () => $controller->markVideoWatched($course->fresh(), $lesson->fresh()), 403, 'Inactive enrollment cannot save video progress');
} catch (Throwable $error) { $failure = $error; }
finally { Carbon::setTestNow(); }
if ($failure) { fwrite(STDERR, $failure->getMessage().PHP_EOL); exit(1); }
