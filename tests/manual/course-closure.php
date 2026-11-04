<?php

// In-memory regressions; includes the 31 existing learning access checks.
require __DIR__.'/learning-access.php';

use App\Http\Controllers\Aula\CertificateController;
use App\Models\Aula\Certificate;
use App\Models\Aula\CourseLesson;
use App\Models\Aula\Enrollment;
use App\Models\Aula\ExamAttempt;
use App\Models\Aula\LessonMaterialView;
use App\Models\Aula\LessonProgress;
use App\Services\ModuleExamRunner;
use Illuminate\Support\Carbon;

$failure = null;
try {
    Carbon::setTestNow('2026-11-03 12:00:00');
    $enrollment->update(['status' => 'completed', 'completed_at' => now()]);
    $certificate = Certificate::create(['enrollment_id' => $enrollment->id, 'code' => 'LT-CLOSURE', 'issued_at' => now()->subYears(2)]);
    CourseLesson::create(['course_module_id' => $module->id, 'title' => 'Contenido nuevo', 'youtube_video_id' => '', 'position' => 3]);
    check($enrollment->fresh()->isTrulyCompleted() && $enrollment->fresh()->progressPercent() === 100, 'Adding content preserves completion and 100% progress');
    $counts = [LessonProgress::count(), LessonMaterialView::count(), ExamAttempt::count()];
    foreach ([
        'continue' => fn () => $controller->continueCourse($course->fresh()),
        'lesson GET' => fn () => $controller->lesson($course->fresh(), $lesson->fresh()),
        'video POST' => fn () => $controller->markVideoWatched($course->fresh(), $lesson->fresh()),
        'material open' => fn () => $controller->openMaterial($material->fresh()),
        'material confirm' => fn () => $controller->confirmMaterialViewed($material->fresh()),
        'lesson completion' => fn () => $controller->completeLesson($course->fresh(), $lesson->fresh()),
        'topic GET' => fn () => $controller->lessonQuizShow($course->fresh(), $lesson->fresh()),
        'topic POST' => fn () => $controller->lessonQuizSubmit(testRequest(), $course->fresh(), $lesson->fresh()),
        'module GET' => fn () => $controller->moduleQuizShow($course->fresh(), $module->fresh()),
        'module start' => fn () => $controller->moduleQuizStart($course->fresh(), $module->fresh()),
        'module save' => fn () => $controller->moduleQuizSave(testRequest(), $course->fresh(), $module->fresh()),
        'module submit' => fn () => $controller->moduleQuizSubmit(testRequest(), $course->fresh(), $module->fresh()),
    ] as $name => $action) {
        $redirect = $action();
        check(str_contains($redirect->getTargetUrl(), '/mis-cursos') && session('course_locked.reason') === 'completed', 'Certified course blocks '.$name);
    }
    check($counts === [LessonProgress::count(), LessonMaterialView::count(), ExamAttempt::count()], 'Blocked actions leave progress, materials and attempts unchanged');
    $display = props((new CertificateController())->show($enrollment->fresh()));
    check($display['certificate']['code'] === 'LT-CLOSURE' && $display['validity']['status'] === 'expired', 'Expired certificate remains accessible after course closure and content edits');
    $cards = props($controller->myCourses())['enrollments'];
    check($cards[0]['status'] === 'completed' && $cards[0]['has_certificate'] && $cards[0]['progress'] === 100, 'My courses retains the certificate and completed state');
    $enrollment->update(['status' => 'active']);
    check($enrollment->fresh()->isTrulyCompleted(), 'Changing status alone cannot reopen an issued certificate');
    blocked(fn () => app(ModuleExamRunner::class)->start($enrollment->fresh(), $exam->fresh()), 403, 'Exam service also rejects a certified enrollment');
    $before = Enrollment::count();
    $controller->enroll($course->fresh());
    check(Enrollment::count() === $before && str_contains(session('success'), 'No se puede repetir'), 'Certified course cannot be enrolled again');
    $certificate->delete();
    $course->update(['access_duration_days' => 1]);
    $enrollment->created_at = now()->subDays(2); $enrollment->save();
    $redirect = $controller->continueCourse($course->fresh());
    check(str_contains($redirect->getTargetUrl(), '/mis-cursos') && session('course_locked.reason') === 'expired', 'Expired course cannot use the completed-lesson fallback');
} catch (Throwable $error) { $failure = $error; }
finally { Carbon::setTestNow(); }
if ($failure) { fwrite(STDERR, $failure->getMessage().PHP_EOL); exit(1); }
