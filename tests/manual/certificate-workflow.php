<?php

// Standalone regression checks; uses only an isolated SQLite memory database
// and a newly created temporary upload directory. No PHPUnit dependency needed.
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\Admin\CertificateController;
use App\Models\Aula\Certificate;
use App\Models\Aula\Course;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

function check(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
    echo "OK: $message\n";
}

config(['database.default' => 'certificate_test', 'database.connections.certificate_test' => [
    'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true,
], 'session.driver' => 'array']);
$uploadRoot = sys_get_temp_dir().'/latinterra-certificate-test-'.Str::uuid();
config(['filesystems.disks.public' => ['driver' => 'local', 'root' => $uploadRoot, 'url' => '/storage']]);
Schema::create('courses', function (Blueprint $table) {
    $table->id(); $table->string('title'); $table->string('slug'); $table->json('certificate_signatories')->nullable(); $table->timestamps();
});
$app['session']->start();
$app['redirect']->setSession($app['session']->driver());

function submitSigners(Course $course, array $rows, array $files = []): void
{
    $request = Request::create('/admin/cursos/'.$course->id.'/firmas', 'POST', ['signatories' => $rows], [], $files);
    $request->setLaravelSession(app('session')->driver());
    app()->instance('request', $request);
    (new CertificateController())->updateSignatories($request, $course);
}

try {
    Carbon::setTestNow('2026-11-03 12:00:00');
    check((new Certificate(['expires_at' => now()->copy()->addDays(31)]))->renewalNotice() === null, 'No alert before 30-day window');
    check((new Certificate(['expires_at' => now()->copy()->addDays(30)]))->renewalNotice()['status'] === 'valid', 'Alert starts at 30 days');
    check((new Certificate(['expires_at' => now()]))->renewalNotice()['status'] === 'expired', 'Expired alert at exact boundary');
    check((new Certificate())->renewalNotice() === null, 'Missing date does not invent expiry');

    $course = Course::create(['title' => 'Test', 'slug' => 'test']);
    $rows = [
        ['id' => (string) Str::uuid(), 'name' => 'Company', 'role' => 'company'],
        ['id' => (string) Str::uuid(), 'name' => 'Instructor', 'role' => 'instructor'],
    ];
    $files = ['signatories' => [
        ['image' => UploadedFile::fake()->image('company.png')],
        ['image' => UploadedFile::fake()->image('instructor.png')],
    ]];
    submitSigners($course, $rows, $files);
    $saved = $course->fresh()->certificate_signatories;
    check(count($saved) === 2 && Storage::disk('public')->exists($saved[0]['path']), 'Signature images and configuration saved');

    $certificate = new Certificate(['signatories' => $saved]);
    $rows[1]['name'] = 'New instructor name';
    submitSigners($course->fresh(), $rows);
    check($course->fresh()->certificate_signatories[1]['name'] === 'New instructor name', 'Names can change without reupload');
    check($certificate->signatureImages()[1]['name'] === 'Instructor', 'Issued signature snapshot remains unchanged');

    $invalid = $rows;
    $invalid[0]['role'] = 'instructor';
    try { submitSigners($course->fresh(), $invalid); throw new RuntimeException('Missing company accepted'); }
    catch (ValidationException $error) { check(isset($error->errors()['signatories']), 'Company representative required'); }

    $invalid = $rows;
    $invalid[1]['id'] = (string) Str::uuid();
    try { submitSigners($course->fresh(), $invalid); throw new RuntimeException('Missing image accepted'); }
    catch (ValidationException $error) { check(isset($error->errors()['signatories.1.image']), 'New signer requires own uploaded image'); }

    $invalid = ['signatories' => [1 => ['image' => UploadedFile::fake()->create('invalid.svg', 1, 'image/svg+xml')]]];
    try { submitSigners($course->fresh(), $rows, $invalid); throw new RuntimeException('SVG accepted'); }
    catch (ValidationException $error) { check(isset($error->errors()['signatories.1.image']), 'SVG uploads rejected'); }

    $invalid = ['signatories' => [1 => ['image' => UploadedFile::fake()->create('large.png', 2049, 'image/png')]]];
    try { submitSigners($course->fresh(), $rows, $invalid); throw new RuntimeException('Oversize upload accepted'); }
    catch (ValidationException $error) { check(isset($error->errors()['signatories.1.image']), 'Oversize uploads rejected'); }

    $invalid = $rows;
    $invalid[1]['id'] = $invalid[0]['id'];
    try { submitSigners($course->fresh(), $invalid); throw new RuntimeException('Duplicate signer accepted'); }
    catch (ValidationException $error) { check(isset($error->errors()['signatories.1.id']), 'Duplicate signer IDs rejected'); }

    $route = app('router')->getRoutes()->getByName('admin.courses.signatories');
    check(in_array('auth', $route->gatherMiddleware(), true) && in_array('admin', $route->gatherMiddleware(), true), 'Upload route protected by auth and admin middleware');
} finally {
    Carbon::setTestNow();
    // Only remove files in the unique directory created by this test.
    foreach (Storage::disk('public')->allFiles() as $file) {
        Storage::disk('public')->delete($file);
    }
    foreach (array_reverse(Storage::disk('public')->allDirectories()) as $directory) {
        @rmdir($uploadRoot.'/'.$directory);
    }
    @rmdir($uploadRoot);
    DB::disconnect('certificate_test');
}
