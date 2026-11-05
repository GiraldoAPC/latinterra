<?php

// Includes access regressions, using only SQLite memory. No application data or files are modified.
require __DIR__.'/learning-access.php';

use App\Models\Aula\{Certificate, Course, CourseLesson, CourseModule, Enrollment, LessonProgress};
use App\Services\CertificateCourseDetails;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

(require __DIR__.'/../../database/migrations/2026_11_03_000001_add_validity_and_score_to_certificates_table.php')->up();
(require __DIR__.'/../../database/migrations/2026_11_03_000002_add_certificate_signatories.php')->up();
$failure = null;
try {
    $c = Course::create(['title' => 'Curso de altura', 'slug' => 'certificado-doble', 'certificate_content' => "1. Seguridad\n2. Maniobras", 'certificate_duration_hours' => 8.5]);
    $m = CourseModule::create(['course_id' => $c->id, 'title' => 'Módulo', 'position' => 1]);
    $l = CourseLesson::create(['course_module_id' => $m->id, 'title' => 'Tema', 'youtube_video_id' => 'demo', 'position' => 1]);
    $e = Enrollment::create(['user_id' => Illuminate\Support\Facades\Auth::id(), 'course_id' => $c->id, 'status' => 'active']);
    LessonProgress::create(['enrollment_id' => $e->id, 'course_lesson_id' => $l->id, 'completed_at' => now()]);
    $method = new ReflectionMethod($controller, 'certifyIfReady'); $method->setAccessible(true); $method->invoke($controller, $e);
    $cert = $e->certificate()->firstOrFail();
    check($cert->course_details['content'] === "1. Seguridad\n2. Maniobras" && $cert->course_details['duration_hours'] === '8.50', 'Automatic virtual issuance snapshots syllabus and fractional hours');
    $c->update(['title' => 'Curso actualizado', 'certificate_content' => 'Temario nuevo', 'certificate_duration_hours' => 16]);
    $details = CertificateCourseDetails::resolve($cert->fresh());
    check($details['title'] === 'Curso de altura' && $details['duration_hours'] === '8.50' && str_contains($details['content'], 'Maniobras'), 'Editing a course cannot rewrite an issued snapshot');
    $request = Request::create('/', 'GET'); $request->setLaravelSession(app('session')->driver()); $request->headers->set('X-Inertia', 'true');
    $public = (new App\Http\Controllers\Aula\CertificateController())->verify($cert->code)->toResponse($request)->getData(true)['props']['certificate'];
    check($public['course_content'] === $details['content'] && $public['duration_hours'] === '8.50' && $public['course_title'] === 'Curso de altura', 'Existing verification URL exposes frozen public course information');
    check(!array_intersect(['signatories', 'document_number', 'email'], array_keys($public)), 'QR verifier does not add private documents or signatures');
    $legacy = new Certificate(['course_details' => null]); $legacy->setRelation('enrollment', $e->fresh());
    check(CertificateCourseDetails::resolve($legacy)['content'] === 'Temario nuevo', 'Legacy certificates can display newly configured course metadata');
    $empty = new Certificate(['course_details' => ['title' => 'Original', 'content' => null, 'duration_hours' => null]]);
    check(CertificateCourseDetails::resolve($empty)['content'] === null, 'An explicitly empty new snapshot never falls back to later course changes');
    $adminController = new App\Http\Controllers\Admin\CourseController();
    $valid = ['title' => 'Curso con reverso', 'price' => 0, 'is_free' => true, 'certificate_content' => '1. Objetivos', 'certificate_duration_hours' => '12.25'];
    $adminController->store(Request::create('/', 'POST', $valid));
    check(Course::where('title', 'Curso con reverso')->firstOrFail()->certificate_duration_hours === '12.25', 'Course form accepts and persists quarter-hour duration');
    foreach ([['certificate_duration_hours' => 0], ['certificate_duration_hours' => '1.333'], ['certificate_duration_hours' => 10000], ['certificate_content' => str_repeat('x', 4001)], ['certificate_content' => implode("\n", array_fill(0, 46, 'Tema'))], ['certificate_content' => ['invalid']]] as $invalid) {
        $field = array_key_first($invalid);
        try { $adminController->store(Request::create('/', 'POST', array_replace($valid, $invalid))); throw new RuntimeException('Invalid course metadata accepted'); }
        catch (ValidationException $error) { check(isset($error->errors()[$field]), 'Invalid certificate metadata rejected: '.$field); }
    }
    check(count(file(resource_path('data/certificate-height-course.txt'))) <= 45 && mb_strlen(file_get_contents(resource_path('data/certificate-height-course.txt'))) <= 4000, 'Provided 23-topic reference fits the supported back-page limits');
} catch (Throwable $error) { $failure = $error; }
if ($failure) { fwrite(STDERR, $failure->getMessage().PHP_EOL); exit(1); }
