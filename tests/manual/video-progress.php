<?php

// Includes the existing learning-access checks and uses SQLite memory only.
require __DIR__.'/learning-access.php';

use App\Models\Aula\Course;
use App\Models\Aula\CourseModule;
use App\Models\Aula\CourseLesson;
use App\Models\Aula\Enrollment;
use App\Models\Aula\LessonProgress;
use App\Services\LessonVideoTracker;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

(require __DIR__.'/../../database/migrations/2026_11_05_000009_add_video_tracking_to_lesson_progress.php')->up();
function videoFixture(int $duration = 10): array {
    static $index = 0; $index++;
    $course = Course::create(['title' => 'Video '.$index, 'slug' => 'video-'.$index, 'is_published' => true]);
    $module = CourseModule::create(['course_id' => $course->id, 'title' => 'Módulo', 'position' => 1]);
    $lesson = CourseLesson::create(['course_module_id' => $module->id, 'title' => 'Clase', 'youtube_video_id' => 'video-'.$index, 'duration_seconds' => $duration, 'position' => 1]);
    $enrollment = Enrollment::create(['user_id' => Illuminate\Support\Facades\Auth::id(), 'course_id' => $course->id, 'status' => 'active']);
    return [$course, $module, $lesson, $enrollment];
}
function tick(int $milliseconds): void { Carbon::setTestNow(now()->addMilliseconds($milliseconds)); }
function invalidVideo(callable $action, string $message): void {
    try { $action(); throw new RuntimeException($message.' (accepted)'); }
    catch (ValidationException $error) { check(isset($error->errors()['video']), $message); }
}
$failure = null;
try {
    Carbon::setTestNow('2026-11-05 12:00:00 UTC');
    $tracker = new LessonVideoTracker();
    [$c, $m, $l, $e] = videoFixture();
    blocked(fn () => $controller->markVideoWatched($c, $l), 403, 'Raw end event cannot mark an unwatched video');
    $started = $controller->startVideo($c, $l)->getData(true); $token = $started['token'];
    check($started['position'] === 0 && $started['duration'] === 10 && !$started['complete'], 'Start binds configured duration and a fresh session');
    check(!str_contains(json_encode(LessonProgress::where('enrollment_id', $e->id)->first()), $token), 'Ordinary model serialization hides session token');
    $tracker->heartbeat($e, $l, $token, 0, true, false);
    $early = $tracker->heartbeat($e, $l, $token, 10, false, true);
    check(!$early['complete'] && $early['resync'] && $early['position'] === 0, 'Instant end and time seeking earn no credit');
    tick(1000); $tracker->heartbeat($e, $l, $token, 0, true, false);
    tick(5000); $middle = $tracker->heartbeat($e, $l, $token, 5, true, false);
    check($middle['position'] === 5 && !$middle['complete'], 'Sequential playback credits only elapsed time');
    tick(5000); $finished = $tracker->heartbeat($e, $l, $token, 10, false, true);
    check($finished['complete'] && $finished['position'] === 10, 'Full validated duration plus end event completes video');
    $watchedAt = LessonProgress::where('enrollment_id', $e->id)->first()->video_watched_at->toIso8601String();
    tick(3000); $tracker->heartbeat($e, $l, $token, 10, false, true); $controller->markVideoWatched($c, $l);
    check(LessonProgress::where('enrollment_id', $e->id)->first()->video_watched_at->toIso8601String() === $watchedAt, 'Repeated ending is idempotent');
    [$c2, $m2, $l2, $e2] = videoFixture(20); $t2 = $tracker->start($e2, $l2)['token'];
    invalidVideo(fn () => $tracker->heartbeat($e2, $l2, $token, 0, true, false), 'Token cannot cross enrollments or lessons');
    $tracker->heartbeat($e2, $l2, $t2, 0, true, false); tick(5000);
    $tracker->heartbeat($e2, $l2, $t2, 5, false, false); tick(60000);
    $paused = $tracker->heartbeat($e2, $l2, $t2, 5, true, false);
    check($paused['position'] === 5 && !$paused['resync'], 'Long pause earns no credit and resumes without unnecessary resynchronization');
    tick(5000); $back = $tracker->heartbeat($e2, $l2, $t2, 1, true, false);
    check($back['resync'] && $back['position'] === 5, 'Rewinding cannot duplicate credited progress');
    $resumed = $tracker->start($e2, $l2);
    check($resumed['position'] === 5 && $resumed['token'] !== $t2, 'Reopening resumes saved position and rotates the token');
    invalidVideo(fn () => $tracker->heartbeat($e2, $l2, $t2, 5, true, false), 'Old browser tab is rejected after another start');
    $t2 = $resumed['token']; $tracker->heartbeat($e2, $l2, $t2, 5, true, false); tick(5000);
    $fast = $tracker->heartbeat($e2, $l2, $t2, 15, true, false);
    check($fast['resync'] && $fast['position'] === 5, 'Double-speed progress cannot outrun server time');
    $tracker->heartbeat($e2, $l2, $t2, 5, true, false); tick(16000);
    $gap = $tracker->heartbeat($e2, $l2, $t2, 20, false, true);
    check($gap['resync'] && !$gap['complete'] && $gap['position'] === 5, 'Long heartbeat gap earns no offline credit');
    tick(100000); $new = $tracker->start($e2, $l2);
    check($new['position'] === 5, 'A later session does not credit the time spent away');
    $t2 = $new['token']; $tracker->heartbeat($e2, $l2, $t2, 5, true, false); tick(5000);
    $short = $tracker->heartbeat($e2, $l2, $t2, 10, false, true);
    check(!$short['complete'] && $short['resync'] && $short['position'] === 10, 'End flag before required duration cannot complete a video');
    $l2->update(['youtube_video_id' => 'changed-video']);
    invalidVideo(fn () => $tracker->heartbeat($e2, $l2->fresh(), $t2, 10, true, false), 'Changed media invalidates the existing session');
    check($tracker->start($e2, $l2->fresh())['position'] === 0, 'Changed media restarts unapproved video progress');
    $l2->update(['duration_seconds' => 30]);
    check($tracker->start($e2, $l2->fresh())['duration'] === 30, 'New session uses updated administrative duration');
    [$c3, $m3, $l3, $e3] = videoFixture(0);
    invalidVideo(fn () => $tracker->start($e3, $l3), 'Missing duration requires administrative configuration');
    LessonProgress::create(['enrollment_id' => $e3->id, 'course_lesson_id' => $l3->id, 'video_watched_at' => now()]);
    check($tracker->start($e3, $l3)['complete'], 'Legacy approved videos remain approved without inventing a duration');
    blocked(fn () => $controller->startVideo($c, $l2), 404, 'Start endpoint rejects a lesson from another course');
    blocked(fn () => $tracker->start($e, $l2), 404, 'Service independently checks lesson membership');
    [$c4, $m4, $l4, $e4] = videoFixture(10);
    $e4->update(['status' => 'completed']);
    check($controller->startVideo($c4, $l4)->getStatusCode() === 403, 'Certified-course closure also protects video initialization');
    blocked(fn () => $tracker->start($e4->fresh(), $l4), 403, 'Service cannot reopen a completed enrollment');
    [$c5, $m5, $l5, $e5] = videoFixture(10); $c5->update(['access_duration_days' => 1]); $e5->created_at = now()->subDays(2); $e5->save();
    check($controller->startVideo($c5->fresh(), $l5)->getStatusCode() === 403 && !LessonProgress::where('enrollment_id', $e5->id)->exists(), 'Expired access rejects tracking before creating progress');
    [$c6, $m6, $l6, $e6] = videoFixture(10);
    $req = Request::create('/', 'POST', ['token' => 'not-a-uuid', 'position' => -1, 'playing' => true, 'ended' => false]);
    try { $controller->videoHeartbeat($req, $c6, $l6); throw new RuntimeException('Invalid heartbeat accepted'); }
    catch (ValidationException $error) { check(isset($error->errors()['token'], $error->errors()['position']), 'Heartbeat validates session identity and position bounds'); }
    $req = Request::create('/', 'POST', ['title' => 'Video', 'youtube_video_id' => 'id', 'duration_seconds' => 0]);
    try { (new App\Http\Controllers\Admin\CourseLessonController())->store($req, $m6); throw new RuntimeException('Zero duration accepted'); }
    catch (ValidationException $error) { check(isset($error->errors()['duration_seconds']), 'Administrative save requires positive video duration'); }
    LessonProgress::where('enrollment_id', $e2->id)->delete();
    invalidVideo(fn () => $tracker->heartbeat($e2, $l2->fresh(), $t2, 0, true, false), 'Progress reset invalidates previous tokens');
    [$cs, $ms, $ls, $es] = videoFixture(1); $ts = $tracker->start($es, $ls)['token'];
    $tracker->heartbeat($es, $ls, $ts, 0, true, false);
    check(!$tracker->heartbeat($es, $ls, $ts, 1, false, true)['complete'], 'Rounding tolerance never waives an entire short video');
    $ts = $tracker->start($es, $ls)['token']; $tracker->heartbeat($es, $ls, $ts, 0, true, false); tick(1000);
    check(!$tracker->heartbeat($es, $ls, $ts, 1, true, false)['complete'], 'Elapsed duration without the end event is not an approval');
    blocked(fn () => $controller->markVideoWatched($cs, $ls), 403, 'Raw endpoint cannot replace the final validated end event');
    check($tracker->heartbeat($es, $ls, $ts, 1, false, true)['complete'], 'Final event approves a fully validated short video');
} catch (Throwable $error) { $failure = $error; }
finally { Carbon::setTestNow(); }
if ($failure) { fwrite(STDERR, $failure->getMessage().PHP_EOL); exit(1); }
