<?php

// Isolated SQLite + temporary files. Does not modify the configured database.
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\Admin\InPersonSessionController;
use App\Http\Controllers\Aula\CertificateController;
use App\Models\Aula\Course;
use App\Models\Aula\InPersonSession;
use App\Models\Aula\InPersonCertificate;
use App\Models\User;
use App\Services\InPersonCertification;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

function check(bool $value, string $label): void
{
    if (!$value) throw new RuntimeException($label);
    echo "OK: $label\n";
}
function rejected(callable $action, string $field, string $label): void
{
    try { $action(); throw new RuntimeException($label.' (accepted unexpectedly)'); }
    catch (ValidationException $error) { check(isset($error->errors()[$field]), $label); }
}
function testRequest(array $data = []): Request
{
    $request = Request::create('/', 'POST', $data);
    $request->setLaravelSession(app('session')->driver());
    $request->setUserResolver(fn () => User::firstOrFail());
    app()->instance('request', $request);
    return $request;
}

config(['database.default' => 'certification_test', 'database.connections.certification_test' => [
    'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true,
], 'session.driver' => 'array']);
$root = sys_get_temp_dir().'/latinterra-presencial-'.Str::uuid();
config(['filesystems.disks.public' => ['driver' => 'local', 'root' => $root, 'url' => '/storage']]);
$app['session']->start();
$app['redirect']->setSession($app['session']->driver());
Schema::create('users', function (Blueprint $table) { $table->id(); $table->string('name'); $table->timestamps(); });
Schema::create('courses', function (Blueprint $table) { $table->id(); $table->string('title'); $table->string('slug'); $table->json('certificate_signatories')->nullable(); $table->timestamps(); });
$registrationMigration = require __DIR__.'/../../database/migrations/2026_11_03_000003_create_in_person_sessions.php';
$registrationMigration->up();
$migration = require __DIR__.'/../../database/migrations/2026_11_03_000004_add_in_person_certification.php';
$migration->up();
Schema::create('enrollments', function (Blueprint $table) { $table->id(); $table->unsignedBigInteger('user_id'); $table->unsignedBigInteger('course_id'); });
Schema::create('certificates', function (Blueprint $table) {
    $table->id(); $table->unsignedBigInteger('enrollment_id'); $table->string('code');
    $table->timestamp('issued_at'); $table->timestamp('expires_at')->nullable(); $table->decimal('final_score', 5, 2)->nullable();
});

(require __DIR__.'/../../database/migrations/2026_11_05_000011_add_certificate_course_details.php')->up();
$failure = null;
try {
    Carbon::setTestNow('2026-11-03 12:00:00');
    $admin = User::create(['name' => 'Test administrator']);
    $course = Course::create(['title' => 'Trabajos en altura', 'slug' => 'altura']);
    $group = InPersonSession::create(['course_id' => $course->id, 'title' => 'Grupo', 'location' => 'Lima', 'starts_at' => now()->subDay(), 'capacity' => 30, 'registration_token' => Str::random(48)]);
    $participant = $group->participants()->create(['document_type' => 'dni', 'document_number' => '12345678', 'name' => 'Ana', 'last_name' => 'Pérez', 'email' => 'private@example.test']);
    $service = new InPersonCertification();
    rejected(fn () => $service->issue($group, $participant, $admin->id), 'certificate', 'Missing assessment cannot certify');
    $service->assess($group, $participant, 12.99, true, $admin->id);
    rejected(fn () => $service->issue($group, $participant, $admin->id), 'certificate', 'Score below 13 cannot certify');
    $service->assess($group, $participant, 13, false, $admin->id);
    rejected(fn () => $service->issue($group, $participant, $admin->id), 'certificate', 'Attendance required even with passing score');
    $service->assess($group, $participant, 13, true, $admin->id);
    rejected(fn () => $service->issue($group, $participant, $admin->id), 'certificate', 'Missing signatories cannot certify');
    $signers = [['id' => (string) Str::uuid(), 'name' => 'Empresa', 'role' => 'company', 'path' => 'company.png'], ['id' => (string) Str::uuid(), 'name' => 'Instructor', 'role' => 'instructor', 'path' => 'instructor.png']];
    $course->update(['certificate_signatories' => $signers, 'certificate_content' => "1. Seguridad\n2. Rescate", 'certificate_duration_hours' => 8]);
    rejected(fn () => $service->issue($group, $participant, $admin->id), 'certificate', 'Missing image files cannot certify');
    Storage::disk('public')->put('company.png', 'test');
    Storage::disk('public')->put('instructor.png', 'test');
    $group->update(['starts_at' => now()->addDay()]);
    rejected(fn () => $service->issue($group, $participant, $admin->id), 'certificate', 'Future session cannot certify');
    $group->update(['starts_at' => now()->subDay()]);
    $certificate = $service->issue($group, $participant, $admin->id);
    check($certificate->course_details['content'] === "1. Seguridad\n2. Rescate" && $certificate->course_details['duration_hours'] === '8.00', 'In-person issuance snapshots syllabus and duration');
    check($certificate->final_score === '13.00', 'Minimum passing score can certify');
    check($certificate->issued_by === $admin->id && $participant->fresh()->assessed_by === $admin->id, 'Assessment and issuance administrator recorded');
    check($certificate->expires_at->toDateTimeString() === '2027-11-03 12:00:00', 'Annual validity saved');
    check(str_starts_with($certificate->code, 'LT-P-'), 'In-person certificate has distinct verification prefix');
    check($service->issue($group, $participant, $admin->id)->id === $certificate->id && InPersonCertificate::count() === 1, 'Repeated issue returns same certificate');
    rejected(fn () => $service->assess($group, $participant, 20, true, $admin->id), 'assessment', 'Assessment immutable after issue');
    $controller = new InPersonSessionController();
    rejected(fn () => $controller->updateParticipant(testRequest(['document_type' => 'dni', 'document_number' => '12345678', 'name' => 'Changed', 'last_name' => 'Name']), $group, $participant), 'participant', 'Identity immutable after issue');
    $course->update(['title' => 'Changed title', 'certificate_signatories' => [], 'certificate_content' => 'Changed syllabus', 'certificate_duration_hours' => 16]);
    check($certificate->fresh()->course_title === 'Trabajos en altura' && $certificate->fresh()->signatories[1]['name'] === 'Instructor', 'Course changes preserve issued snapshots');
    $request = testRequest();
    $request->headers->set('X-Inertia', 'true');
    $public = (new CertificateController())->verify($certificate->code)->toResponse($request)->getData(true)['props']['certificate'];
    check($public['student_name'] === 'Ana Pérez' && $public['modality'] === 'Presencial' && $public['status'] === 'valid', 'Public verifier recognizes in-person certificates');
    check($public['course_content'] === "1. Seguridad\n2. Rescate" && $public['duration_hours'] === '8.00', 'In-person QR verification preserves issued course details after edits');
    check(!isset($public['document_number']) && !isset($public['signatories']) && !isset($public['email']) && !isset($public['participant']), 'Public verifier excludes private participant data and signatures');
    Carbon::setTestNow('2027-11-03 12:00:00');
    check($certificate->validityStatus() === 'expired', 'Expiry boundary is enforced');

    DB::table('enrollments')->insert(['id' => 1, 'user_id' => $admin->id, 'course_id' => $course->id]);
    DB::table('certificates')->insert(['enrollment_id' => 1, 'code' => 'LT-LEGACY01', 'issued_at' => '2027-01-01', 'final_score' => 18]);
    $online = (new CertificateController())->verify('LT-LEGACY01')->toResponse($request)->getData(true)['props']['certificate'];
    check($online['student_name'] === 'Test administrator' && $online['status'] === 'valid', 'Existing virtual classroom verification remains functional');
    $missing = (new CertificateController())->verify('UNKNOWN')->toResponse($request)->getData(true)['props']['certificate'];
    check($missing === null, 'Unknown certificate returns not-found state');
    $other = InPersonSession::create(['course_id' => $course->id, 'title' => 'Other group', 'location' => 'Lima', 'starts_at' => now(), 'capacity' => 30, 'registration_token' => Str::random(48)]);
    try { $service->issue($other, $participant, $admin->id); throw new RuntimeException('Cross-group issue accepted'); }
    catch (Illuminate\Database\Eloquent\ModelNotFoundException $error) { check(true, 'Cross-group issue rejected'); }
    $second = $group->participants()->create(['document_type' => 'dni', 'document_number' => '87654321', 'name' => 'B', 'last_name' => 'C']);
    rejected(fn () => $controller->assessParticipant(testRequest(['score' => 21, 'attendance_confirmed' => true]), $group, $second, $service), 'score', 'Controller rejects grades above 20');
    rejected(fn () => $controller->assessParticipant(testRequest(['score' => '12.999', 'attendance_confirmed' => true]), $group, $second, $service), 'score', 'Controller rejects rounding from failing score');
    foreach (['admin.in-person.assessment', 'admin.in-person.issue', 'admin.in-person.certificate'] as $name) {
        $middleware = app('router')->getRoutes()->getByName($name)->gatherMiddleware();
        check(in_array('auth', $middleware, true) && in_array('admin', $middleware, true), "$name requires administrator");
    }
} catch (Throwable $error) {
    $failure = $error;
} finally {
    Carbon::setTestNow();
    Storage::disk('public')->delete(['company.png', 'instructor.png']);
    @rmdir($root);
}
if ($failure) {
    fwrite(STDERR, $failure->getMessage().PHP_EOL);
    exit(1);
}
