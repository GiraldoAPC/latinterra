<?php

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Aula\Course;
use App\Services\RoleManagement;
use App\Http\Controllers\AcademicController;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureAcademicAccess;
use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

function check(bool $value, string $label): void
{
    if (!$value) throw new RuntimeException($label);
    echo "OK: $label\n";
}
function denied(callable $action, string $label): void
{
    try { $action(); throw new RuntimeException($label.' (accepted unexpectedly)'); }
    catch (HttpException $error) { check($error->getStatusCode() === 403, $label); }
}
function rejected(callable $action, string $field, string $label): void
{
    try { $action(); throw new RuntimeException($label.' (accepted unexpectedly)'); }
    catch (ValidationException $error) { check(isset($error->errors()[$field]), $label); }
}
function actorRequest(User $user, array $data = []): Request
{
    $request = Request::create('/', 'POST', $data);
    $request->setLaravelSession(app('session')->driver());
    $request->headers->set('X-Inertia', 'true');
    app()->instance('request', $request);
    $request->setUserResolver(fn () => $user);
    return $request;
}
function account(string $role, string $email): User
{
    return User::create(['name' => $role, 'email' => $email, 'password' => 'Test-password-2026', 'role' => $role, 'is_active' => true]);
}

config(['database.default' => 'roles_test', 'database.connections.roles_test' => [
    'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true,
], 'session.driver' => 'array', 'cache.default' => 'array']);
$app['session']->start(); $app['redirect']->setSession($app['session']->driver());
Schema::create('users', function (Blueprint $table) {
    $table->id(); $table->string('name'); $table->string('email')->unique(); $table->string('password');
    $table->string('role'); $table->boolean('is_active')->default(true); $table->string('remember_token')->nullable(); $table->timestamps();
});
Schema::create('courses', function (Blueprint $table) { $table->id(); $table->string('title'); $table->string('slug'); $table->text('summary')->nullable(); $table->timestamps(); });
Schema::create('course_modules', function (Blueprint $table) { $table->id(); $table->unsignedBigInteger('course_id'); $table->string('title'); $table->integer('position')->default(0); });
Schema::create('course_lessons', function (Blueprint $table) { $table->id(); $table->unsignedBigInteger('course_module_id'); });
Schema::create('exams', function (Blueprint $table) { $table->id(); $table->unsignedBigInteger('course_module_id'); });
Schema::create('enrollments', function (Blueprint $table) { $table->id(); $table->unsignedBigInteger('user_id'); $table->unsignedBigInteger('course_id'); });
Schema::create('lesson_progress', function (Blueprint $table) { $table->id(); $table->unsignedBigInteger('enrollment_id'); $table->unsignedBigInteger('course_lesson_id'); $table->timestamp('completed_at')->nullable(); });
Schema::create('exam_attempts', function (Blueprint $table) { $table->id(); $table->unsignedBigInteger('enrollment_id'); $table->unsignedBigInteger('exam_id'); $table->decimal('score', 5, 2); });
$migration = require __DIR__.'/../../database/migrations/2026_11_03_000007_add_staff_roles_and_course_assignments.php';
$migration->up();
$failure = null;
try {
    $admin = account('admin', 'admin@example.test'); $manager = account('manager', 'manager@example.test');
    $instructor = account('instructor', 'instructor@example.test'); $coordinator = account('coordinator', 'coordinator@example.test');
    $student = account('student', 'student@example.test');
    check($admin->homePath() === '/admin' && $manager->homePath() === '/admin', 'Administration and management enter admin panel');
    check($instructor->homePath() === '/academico' && $coordinator->homePath() === '/academico', 'Academic roles enter academic panel');
    check($student->homePath() === '/aula-virtual/mis-cursos', 'Student keeps classroom entry');
    $next = fn () => response('ok');
    check((new EnsureUserIsAdmin())->handle(actorRequest($manager), $next)->getContent() === 'ok', 'Management can access administrative actions');
    denied(fn () => (new EnsureUserIsAdmin())->handle(actorRequest($instructor), $next), 'Instructor denied administrative actions');
    denied(fn () => (new EnsureUserIsAdmin())->handle(actorRequest($coordinator), $next), 'Coordinator denied administrative actions');
    denied(fn () => (new EnsureAcademicAccess())->handle(actorRequest($student), $next), 'Student denied academic staff panel');
    $instructor->update(['is_active' => false]);
    denied(fn () => (new EnsureAcademicAccess())->handle(actorRequest($instructor), $next), 'Disabled instructor denied academic panel');
    $instructor->update(['is_active' => true]);

    $roles = new RoleManagement();
    rejected(fn () => $roles->update($admin, $admin, 'student', true), 'role', 'Self-demotion rejected');
    rejected(fn () => $roles->update($manager, $admin, 'student', true), 'role', 'Last active administrator protected from demotion');
    rejected(fn () => $roles->update($manager, $admin, 'admin', false), 'role', 'Last active administrator protected from deactivation');
    denied(fn () => $roles->update($coordinator, $student, 'admin', true), 'Coordinator cannot escalate another account');
    $roles->update($admin, $student, 'coordinator', true);
    check($student->fresh()->role === 'coordinator' && DB::table('user_role_changes')->count() === 1, 'Role change saved with audit record');
    $roles->update($admin, $student->fresh(), 'coordinator', true);
    check(DB::table('user_role_changes')->count() === 1, 'Unchanged role does not duplicate audit records');
    $created = $roles->createStaff($admin, ['name' => 'Nueva instructora', 'email' => 'new@example.test', 'password' => 'Strong-password-2026', 'role' => 'instructor']);
    check(Hash::check('Strong-password-2026', $created->password) && $created->is_active, 'New staff account has hashed password and active state');
    check(DB::table('user_role_changes')->where('user_id', $created->id)->exists(), 'Staff creation is audited');

    $course = Course::create(['title' => 'Asignado', 'slug' => 'asignado']);
    $other = Course::create(['title' => 'Ajeno', 'slug' => 'ajeno']);
    $academic = new AcademicController();
    $academic->assign(actorRequest($coordinator, ['instructor_ids' => [$instructor->id]]), $course);
    check($course->instructors()->whereKey($instructor->id)->exists(), 'Coordinator can assign active instructors');
    denied(fn () => $academic->assign(actorRequest($instructor, ['instructor_ids' => [$created->id]]), $course), 'Instructor cannot assign staff');
    rejected(fn () => $academic->assign(actorRequest($coordinator, ['instructor_ids' => [$manager->id]]), $course), 'instructor_ids.0', 'Only instructor accounts can be assigned');
    $request = actorRequest($instructor);
    $index = $academic->index($request)->toResponse($request)->getData(true)['props'];
    check(count($index['courses']['data']) === 1 && $index['courses']['data'][0]['id'] === $course->id, 'Instructor list contains only assigned courses');
    denied(fn () => $academic->show(actorRequest($instructor), $other), 'Instructor cannot open unassigned course directly');
    $request = actorRequest($coordinator);
    check(count($academic->index($request)->toResponse($request)->getData(true)['props']['courses']['data']) === 2, 'Coordinator sees all courses');

    DB::table('course_modules')->insert(['id' => 1, 'course_id' => $course->id, 'title' => 'Módulo', 'position' => 1]);
    DB::table('course_lessons')->insert(['id' => 1, 'course_module_id' => 1]);
    DB::table('exams')->insert(['id' => 1, 'course_module_id' => 1]);
    DB::table('enrollments')->insert(['id' => 1, 'course_id' => $course->id, 'user_id' => $student->id]);
    DB::table('lesson_progress')->insert(['enrollment_id' => 1, 'course_lesson_id' => 1, 'completed_at' => now()]);
    DB::table('exam_attempts')->insert(['enrollment_id' => 1, 'exam_id' => 1, 'score' => 17]);
    $request = actorRequest($instructor);
    $detail = $academic->show($request, $course)->toResponse($request)->getData(true)['props'];
    $row = $detail['enrollments']['data'][0];
    check($row['progress'] === 100 && (float) $row['module_scores'][0]['score'] === 17.0, 'Academic panel reports progress and module score');
    check(array_keys($row) === ['id', 'name', 'progress', 'module_scores'] && !isset($detail['payments']), 'Academic response excludes financial, contact and medical data');
    $academic->assign(actorRequest($coordinator, ['instructor_ids' => []]), $course);
    denied(fn () => $academic->show(actorRequest($instructor), $course), 'Removing assignment revokes course access');

    $login = LoginRequest::create('/login', 'POST', ['email' => $created->email, 'password' => 'Strong-password-2026']);
    $login->setContainer($app);
    $login->authenticate();
    check(Auth::id() === $created->id, 'Active staff account can log in with configured password');
    Auth::logout();
    $created->update(['is_active' => false]);
    $login = LoginRequest::create('/login', 'POST', ['email' => $created->email, 'password' => 'Strong-password-2026']);
    $login->setContainer($app);
    rejected(fn () => $login->authenticate(), 'email', 'Disabled account cannot log in with valid password');
    Auth::setUser($created);
    $response = (new EnsureAccountIsActive())->handle(actorRequest($created), $next);
    check(str_ends_with($response->getTargetUrl(), '/login') && !Auth::check(), 'Existing session is ended when account is disabled');
    foreach (['admin.roles.update', 'admin.staff.store', 'admin.ventas.otros-pagos.void', 'admin.students.installments.extend'] as $name) {
        $route = app('router')->getRoutes()->getByName($name);
        check($route && in_array('admin', $route->gatherMiddleware(), true), "$name remains restricted to administration/management");
    }
    $migration->down();
    check(!Schema::hasTable('course_instructors') && !Schema::hasTable('user_role_changes'), 'Role migration rollback leaves existing accounts intact');
} catch (Throwable $error) { $failure = $error; }
if ($failure) { fwrite(STDERR, $failure->getMessage().PHP_EOL); exit(1); }
