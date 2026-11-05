<?php

// Isolated SQLite memory DB plus temporary files; no live enrollments or storage files.
require __DIR__.'/learning-access.php';

use App\Models\Aula\Course;
use App\Models\Aula\CourseModule;
use App\Models\Aula\CourseLesson;
use App\Models\Aula\CourseLessonMaterial;
use App\Models\Aula\Enrollment;
use App\Models\Aula\LessonMaterialView;
use App\Services\MaterialPageTracker;
use App\Services\MaterialPdfMetadata;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

(require __DIR__.'/../../database/migrations/2026_11_05_000010_add_material_page_tracking.php')->up();
$testRoot = sys_get_temp_dir().'/latinterra-pdf-'.bin2hex(random_bytes(6));
mkdir($testRoot);
config(['filesystems.disks.public.root' => $testRoot]);
Storage::forgetDisk('public');

function pdfFixture(): array {
    static $i = 0; $i++;
    $course = Course::create(['title' => 'PDF '.$i, 'slug' => 'pdf-'.$i, 'is_published' => true]);
    $module = CourseModule::create(['course_id' => $course->id, 'title' => 'Lectura', 'position' => 1]);
    $lesson = CourseLesson::create(['course_module_id' => $module->id, 'title' => 'Manual', 'youtube_video_id' => 'fixture', 'position' => 1]);
    $enrollment = Enrollment::create(['course_id' => $course->id, 'user_id' => Illuminate\Support\Facades\Auth::id(), 'status' => 'active']);
    $material = CourseLessonMaterial::create(['course_lesson_id' => $lesson->id, 'title' => 'Manual de dos páginas', 'file_path' => 'manual.pdf', 'original_name' => 'manual.pdf', 'mime_type' => 'application/pdf']);
    return [$course, $module, $lesson, $enrollment, $material];
}
function invalidReading(callable $action, string $message): void {
    try { $action(); throw new RuntimeException($message.' (accepted)'); }
    catch (ValidationException $error) { check(isset($error->errors()['material']) || isset($error->errors()['file']), $message); }
}
function readTicks($tracker, $e, $mat, $token, $page, $count = 4): array {
    $result = [];
    for ($i = 0; $i < $count; $i++) { Carbon::setTestNow(now()->addSeconds(3)); $result = $tracker->heartbeat($e, $mat, $token, $page, true); }
    return $result;
}

$failure = null;
try {
    Carbon::setTestNow('2026-11-05 12:00:00 UTC');
    $pdf = new Dompdf\Dompdf();
    $pdf->loadHtml('<html><body><h1>Página uno</h1><p style="page-break-before:always">Página dos</p></body></html>');
    $pdf->render(); Storage::disk('public')->put('manual.pdf', $pdf->output());
    $metadata = new MaterialPdfMetadata();
    check($metadata->inspect($testRoot.'/manual.pdf')['pdf_page_count'] === 2, 'Server parses the actual compressed PDF page tree');
    file_put_contents($testRoot.'/broken.pdf', '%PDF-1.4 invalid');
    invalidReading(fn () => $metadata->inspect($testRoot.'/broken.pdf'), 'Malformed PDF is rejected clearly');
    invalidReading(fn () => $metadata->inspect($testRoot.'/missing.pdf'), 'Missing PDF cannot grant progress');
    $protected = new Dompdf\Dompdf(); $protected->loadHtml('<p>Protegido</p>'); $protected->render();
    $protected->getCanvas()->get_cpdf()->setEncryption('secret', 'owner');
    Storage::disk('public')->put('protected.pdf', $protected->output());
    invalidReading(fn () => $metadata->inspect($testRoot.'/protected.pdf'), 'Password-protected PDF is rejected instead of bypassing page tracking');
    [$c, $m, $l, $e, $mat] = pdfFixture();
    $tracker = new MaterialPageTracker();
    $started = $controller->startMaterialReading($mat)->getData(true); $token = $started['token'];
    $mat->refresh();
    check($started['page_count'] === 2 && $started['completed_pages'] === 0 && !$started['complete'], 'Opening a legacy PDF computes metadata but does not approve it');
    check($mat->pdf_page_count === 2 && strlen($mat->pdf_checksum) === 64, 'Server stores page count and content fingerprint');
    check(!str_contains(json_encode(LessonMaterialView::where('enrollment_id', $e->id)->first()), $token), 'Ordinary model serialization hides reading token');
    Carbon::setTestNow(now()->addMinutes(5));
    blocked(fn () => $controller->confirmMaterialViewed($mat), 403, 'Old whole-file confirmation cannot bypass PDF pages');
    invalidReading(fn () => $tracker->heartbeat($e, $mat, $token, 2, true), 'Next page is locked before first page time');
    $tracker->heartbeat($e, $mat, $token, 1, true);
    check($tracker->heartbeat($e, $mat, $token, 1, true)['elapsed_ms'] === 0, 'Repeated immediate requests earn zero time');
    $partial = readTicks($tracker, $e, $mat, $token, 1, 2);
    check($partial['elapsed_ms'] === 6000 && $partial['completed_pages'] === 0, 'Partial visible time is saved against the current page');
    $tracker->heartbeat($e, $mat, $token, 1, false);
    Carbon::setTestNow(now()->addMinutes(1));
    check($tracker->heartbeat($e, $mat, $token, 1, true)['elapsed_ms'] === 6000, 'Hidden window time cannot count on return');
    $one = readTicks($tracker, $e, $mat, $token, 1, 2);
    check($one['completed_pages'] === 1 && !$one['complete'], 'Twelve validated seconds unlock only the next page');
    readTicks($tracker, $e, $mat, $token, 1, 4);
    check(!LessonMaterialView::where('enrollment_id', $e->id)->first()->confirmed_at, 'Staying on a reviewed page cannot approve unread pages');
    $tracker->heartbeat($e, $mat, $token, 2, true);
    readTicks($tracker, $e, $mat, $token, 2, 1);
    $reopened = $tracker->start($e, $mat);
    check($reopened['page'] === 2 && $reopened['elapsed_ms'] === 3000 && $reopened['token'] !== $token, 'Reopen resumes unread page and partial time, rotating the session');
    invalidReading(fn () => $tracker->heartbeat($e, $mat, $token, 2, true), 'Old tab cannot continue after another session starts');
    $token = $reopened['token'];
    Carbon::setTestNow(now()->addMinutes(1)); $tracker->heartbeat($e, $mat, $token, 2, true);
    Carbon::setTestNow(now()->addSeconds(7));
    check($tracker->heartbeat($e, $mat, $token, 2, true)['elapsed_ms'] === 3000, 'Missing heartbeat gap grants no offline credit');
    $done = readTicks($tracker, $e, $mat, $token, 2, 3);
    check($done['complete'] && $done['completed_pages'] === 2, 'All actual pages approve the material on the server');
    $stamp = LessonMaterialView::where('enrollment_id', $e->id)->first()->confirmed_at->toIso8601String();
    Carbon::setTestNow(now()->addMinute()); $controller->confirmMaterialViewed($mat);
    check($tracker->start($e, $mat)['complete'] && LessonMaterialView::where('enrollment_id', $e->id)->first()->confirmed_at->toIso8601String() === $stamp, 'Repeated opening and confirmation preserve approval timestamp');
    [$c2, $m2, $l2, $e2, $mat2] = pdfFixture();
    $t2 = $tracker->start($e2, $mat2)['token'];
    invalidReading(fn () => $tracker->heartbeat($e2, $mat2, $token, 1, true), 'Token cannot cross material or enrollment');
    blocked(fn () => $tracker->start($e, $mat2), 404, 'Service checks enrollment course membership');
    $tracker->heartbeat($e2, $mat2, $t2, 1, true); readTicks($tracker, $e2, $mat2, $t2, 1, 1);
    $mat2->update(['pdf_checksum' => str_repeat('0', 64)]);
    invalidReading(fn () => $tracker->heartbeat($e2, $mat2, $t2, 1, true), 'Updated material invalidates existing sessions');
    // Change actual file as well, so start must reset the partial reading snapshot.
    $pdf->loadHtml('<html><body><h1>Nuevo manual</h1></body></html>'); $pdf->render();
    Storage::disk('public')->put('manual.pdf', $pdf->output());
    $changed = $tracker->start($e2, $mat2);
    check($changed['completed_pages'] === 0 && $changed['elapsed_ms'] === 0, 'Changed PDF resets unapproved page credit');
    LessonMaterialView::where('enrollment_id', $e2->id)->delete();
    invalidReading(fn () => $tracker->heartbeat($e2, $mat2, $changed['token'], 1, true), 'Module progress reset invalidates reading sessions');
    $e2->update(['status' => 'completed']);
    check($controller->startMaterialReading($mat2)->getStatusCode() === 403, 'Closed course blocks reading initialization');
    $e2->update(['status' => 'active']); $c2->update(['access_duration_days' => 1]); $e2->created_at = now()->subDays(2); $e2->save();
    check($controller->startMaterialReading($mat2)->getStatusCode() === 403, 'Expired access blocks reading initialization');
    $request = Request::create('/', 'POST', ['token' => $changed['token'], 'page' => 1, 'active' => true]);
    check($controller->materialReadingHeartbeat($request, $mat2)->getStatusCode() === 403, 'Expired access also blocks heartbeat updates');
    $c2->update(['access_duration_days' => null]); $e2->created_at = now(); $e2->save();
    $request = Request::create('/', 'POST', ['token' => 'invalid', 'page' => 1001, 'active' => true]);
    try { $controller->materialReadingHeartbeat($request, $mat2); throw new RuntimeException('Invalid payload accepted'); }
    catch (ValidationException $error) { check(isset($error->errors()['token'], $error->errors()['page']), 'Endpoint validates token and page bounds'); }
    LessonMaterialView::create(['enrollment_id' => $e2->id, 'course_lesson_material_id' => $mat2->id, 'opened_at' => now(), 'confirmed_at' => now()]);
    check($tracker->start($e2, $mat2)['complete'], 'Approvals predating page tracking remain approved');
    [$c3, $m3, $l3, $e3, $mat3] = pdfFixture();
    $future = CourseLesson::create(['course_module_id' => $m3->id, 'title' => 'Siguiente', 'youtube_video_id' => 'fixture', 'position' => 2]);
    $futureMat = CourseLessonMaterial::create(['course_lesson_id' => $future->id, 'title' => 'Bloqueado', 'file_path' => 'manual.pdf', 'original_name' => 'manual.pdf']);
    check($controller->startMaterialReading($futureMat)->getStatusCode() === 403 && !LessonMaterialView::where('course_lesson_material_id', $futureMat->id)->exists(), 'Out-of-order reading cannot start or save a view');
    check($controller->materialReadingHeartbeat(Request::create('/', 'POST', ['token' => $token, 'page' => 1, 'active' => true]), $futureMat)->getStatusCode() === 403, 'Out-of-order reading heartbeat is also blocked');
    $c3->update(['payment_required' => true]);
    Illuminate\Support\Facades\DB::table('course_installments')->insert(['enrollment_id' => $e3->id, 'status' => 'pending', 'due_date' => now()->toDateString()]);
    check($controller->startMaterialReading($mat3)->getStatusCode() === 403, 'Debt in the final module blocks reading initialization');
} catch (Throwable $error) { $failure = $error; }
finally {
    Carbon::setTestNow();
    foreach (glob($testRoot.'/*') ?: [] as $file) unlink($file);
    rmdir($testRoot);
}
if ($failure) { fwrite(STDERR, $failure->getMessage().PHP_EOL); exit(1); }
