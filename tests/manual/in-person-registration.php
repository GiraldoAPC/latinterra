<?php

// Standalone checks with an isolated in-memory database; no production/local data is changed.
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\Admin\InPersonSessionController;
use App\Http\Controllers\InPersonRegistrationController;
use App\Models\Aula\Course;
use App\Models\Aula\InPersonSession;
use App\Services\InPersonRegistration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

function check(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
    echo "OK: $message\n";
}
function rejected(callable $action, string $field, string $message): void
{
    try { $action(); throw new RuntimeException($message.' (accepted unexpectedly)'); }
    catch (ValidationException $error) { check(isset($error->errors()[$field]), $message); }
}
function requestFor(array $data = []): Request
{
    $request = Request::create('/', 'POST', $data);
    $request->setLaravelSession(app('session')->driver());
    app()->instance('request', $request);
    return $request;
}

config(['database.default' => 'in_person_test', 'database.connections.in_person_test' => [
    'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true,
], 'session.driver' => 'array']);
$app['session']->start();
$app['redirect']->setSession($app['session']->driver());
Schema::create('courses', function (Blueprint $table) { $table->id(); $table->string('title'); $table->string('slug'); $table->timestamps(); });
$migration = require __DIR__.'/../../database/migrations/2026_11_03_000003_create_in_person_sessions.php';
$migration->up();
Carbon::setTestNow('2026-11-03 12:00:00');

try {
    $course = Course::create(['title' => 'Presencial', 'slug' => 'presencial']);
    $groupData = ['course_id' => $course->id, 'title' => 'Grupo 1', 'location' => 'Lima', 'starts_at' => '2026-11-05T09:00', 'registration_closes_at' => '2026-11-04T18:00', 'capacity' => 2];
    (new InPersonSessionController())->store(requestFor($groupData));
    $group = InPersonSession::firstOrFail();
    check($group->starts_at->toDateTimeString() === '2026-11-05 14:00:00', 'Peru time stored correctly in UTC');
    check(strlen($group->registration_token) === 48, 'Share token generated');
    $service = new InPersonRegistration();
    $participant = ['document_type' => 'pasaporte', 'document_number' => ' ab12345 ', 'name' => 'Ana', 'last_name' => 'Pérez'];
    $registered = $service->register($group, $participant);
    check($registered->document_number === 'AB12345', 'Documents normalized before duplicate check');
    rejected(fn () => $service->register($group, $participant), 'document_number', 'Duplicate rejected within group');
    check($group->participants()->count() === 1, 'Duplicate does not consume capacity');
    $service->register($group, array_replace($participant, ['document_number' => 'CD67890']));
    rejected(fn () => $service->register($group, array_replace($participant, ['document_number' => 'EF67890'])), 'registration', 'Capacity cannot be exceeded');
    check($group->participants()->count() === 2, 'Full group retains exact capacity');

    $other = InPersonSession::create(array_replace($groupData, ['starts_at' => now(), 'registration_closes_at' => now()->addDay(), 'registration_token' => Str::random(48), 'registration_open' => true]));
    $service->register($other, $participant);
    check($other->participants()->count() === 1, 'Same participant can register in another group');
    $other->update(['registration_open' => false]);
    rejected(fn () => $service->register($other, array_replace($participant, ['document_number' => 'GH12345'])), 'registration', 'Manual closure blocks registration');
    $other->update(['registration_open' => true, 'registration_closes_at' => now()]);
    rejected(fn () => $service->register($other, array_replace($participant, ['document_number' => 'GH12345'])), 'registration', 'Deadline blocks at exact boundary');

    $public = new InPersonRegistrationController();
    rejected(fn () => $public->store(requestFor(['document_type' => 'dni', 'document_number' => '123', 'name' => 'A', 'last_name' => 'B', 'confirmed' => true]), $other->registration_token, $service), 'document_number', 'Invalid DNI rejected');
    rejected(fn () => $public->store(requestFor(['document_type' => 'dni', 'document_number' => '12345678', 'name' => 'A', 'last_name' => 'B']), $other->registration_token, $service), 'confirmed', 'Participant must confirm identity data');
    rejected(fn () => $public->store(requestFor(['document_type' => 'ce', 'document_number' => '12345', 'name' => 'A', 'last_name' => 'B', 'confirmed' => true]), $other->registration_token, $service), 'document_number', 'Foreign resident document requires at least six characters');
    $third = InPersonSession::create(array_replace($groupData, ['starts_at' => now(), 'registration_closes_at' => null, 'registration_token' => Str::random(48), 'registration_open' => true]));
    $response = $public->store(requestFor(['document_type' => 'dni', 'document_number' => '12345678', 'name' => 'Nora', 'last_name' => 'Ríos', 'confirmed' => true]), $third->registration_token, $service);
    check($third->participants()->count() === 1 && str_ends_with($response->getTargetUrl(), $third->registration_token), 'Public submission saves participant and redirects to own group');
    check(app('session')->get('registered_session') === $third->id, 'Success receipt scoped to the submitted group');

    $admin = new InPersonSessionController();
    $correction = array_replace($participant, ['document_number' => 'AB12345', 'name' => 'Ana María']);
    $admin->updateParticipant(requestFor($correction), $group, $registered);
    check($registered->fresh()->name === 'Ana María', 'Administrator can correct participant data');
    rejected(fn () => $admin->updateParticipant(requestFor(array_replace($correction, ['document_number' => 'CD67890'])), $group, $registered), 'document_number', 'Corrections cannot duplicate another participant');
    try { $admin->updateParticipant(requestFor($correction), $other, $registered); throw new RuntimeException('Cross-group correction accepted'); }
    catch (Symfony\Component\HttpKernel\Exception\HttpException $error) { check($error->getStatusCode() === 404, 'Cross-group corrections rejected'); }
    $request = requestFor();
    $request->headers->set('X-Inertia', 'true');
    $payload = $public->show($group->registration_token)->toResponse($request)->getData(true)['props'];
    check(array_keys($payload['session']) === ['title', 'course', 'location', 'starts_at', 'token', 'available'] && !isset($payload['participants']), 'Public response contains only group information');
    check($payload['session']['available'] === false, 'Public page reflects full group');
    $adminRoute = app('router')->getRoutes()->getByName('admin.in-person.show');
    check(in_array('admin', $adminRoute->gatherMiddleware(), true) && in_array('auth', $adminRoute->gatherMiddleware(), true), 'Participant list restricted to administrators');
    $publicRoute = app('router')->getRoutes()->getByName('in-person.register.store');
    check(in_array('throttle:120,1', $publicRoute->gatherMiddleware(), true), 'Public submission rate limited for shared group access');
    $migration->down();
    check(!Schema::hasTable('in_person_sessions') && !Schema::hasTable('in_person_participants'), 'Migration rollback removes only new tables');
} finally {
    Carbon::setTestNow();
}
