<?php

// Isolated reporting regressions. Never reads or writes the configured application database.
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\AdminDashboard;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

config(['database.default' => 'dashboard_test', 'database.connections.dashboard_test' => [
    'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true,
], 'app.timezone' => 'UTC']);

$tables = [
    'users' => fn ($t) => [$t->string('name'), $t->string('role'), $t->boolean('is_active')->default(true)],
    'courses' => fn ($t) => [$t->string('title'), $t->boolean('is_published')->default(true)],
    'enrollments' => fn ($t) => [$t->unsignedBigInteger('user_id'), $t->unsignedBigInteger('course_id'), $t->string('status')],
    'certificates' => fn ($t) => [$t->unsignedBigInteger('enrollment_id'), $t->string('code'), $t->dateTime('issued_at')->nullable(), $t->dateTime('expires_at')->nullable()],
    'in_person_certificates' => fn ($t) => [$t->string('student_name'), $t->string('course_title'), $t->string('code'), $t->dateTime('issued_at'), $t->dateTime('expires_at')],
    'course_installments' => fn ($t) => [$t->unsignedBigInteger('enrollment_id'), $t->string('status'), $t->decimal('amount', 12, 2), $t->date('due_date'), $t->dateTime('paid_at')->nullable()],
    'course_orders' => fn ($t) => [$t->string('status'), $t->string('source'), $t->decimal('amount', 12, 2), $t->dateTime('paid_at')->nullable()],
    'other_payments' => fn ($t) => [$t->decimal('amount', 12, 2), $t->dateTime('paid_at'), $t->dateTime('voided_at')->nullable()],
    'quotes' => fn ($t) => [$t->string('code'), $t->string('buyer_name'), $t->decimal('amount', 12, 2), $t->string('status'), $t->date('valid_until')->nullable(), $t->unsignedBigInteger('other_payment_id')->nullable()],
    'products' => fn ($t) => [$t->string('name'), $t->boolean('is_active')->default(true), $t->integer('stock')->nullable(), $t->integer('stock_warehouse')->default(0), $t->integer('min_stock')->nullable()],
    'stock_purchases' => fn ($t) => [$t->decimal('total', 12, 2), $t->date('purchased_at')],
    'stock_sponsorships' => fn ($t) => [$t->decimal('total_cost', 12, 2)],
    'in_person_sessions' => fn ($t) => [$t->unsignedBigInteger('course_id'), $t->string('title'), $t->string('location'), $t->dateTime('starts_at'), $t->integer('capacity')],
    'in_person_participants' => fn ($t) => [$t->unsignedBigInteger('in_person_session_id')],
];
foreach ($tables as $name => $columns) Schema::create($name, function (Blueprint $table) use ($columns) { $table->id(); $columns($table); $table->timestamps(); });
function check(bool $condition, string $message): void { if (!$condition) throw new RuntimeException($message); echo "OK: $message\n"; }
function row(string $table, array $values): int { return DB::table($table)->insertGetId($values + ['created_at' => '2026-11-01 12:00:00', 'updated_at' => '2026-11-01 12:00:00']); }
$failure = null;
try {
    Carbon::setTestNow('2026-11-04 17:00:00 UTC');
    $service = new AdminDashboard();
    $empty = $service->build(7);
    check($empty['cash']['total'] === 0.0 && count($empty['cash']['daily']) === 7, 'Empty database returns zeros and every calendar day');
    check($empty['cash']['change_percent'] === null && $empty['overdue'] === [], 'No invented comparison or pending rows on empty data');
    row('users', ['name' => 'Alumno', 'role' => 'student', 'is_active' => true]);
    row('users', ['name' => 'Inactivo', 'role' => 'student', 'is_active' => false]);
    row('users', ['name' => 'Instructor', 'role' => 'instructor', 'is_active' => true]);
    row('courses', ['title' => 'Curso A', 'is_published' => true]);
    row('courses', ['title' => 'Borrador', 'is_published' => false]);
    foreach ([['active', '2026-10-30'], ['completed', '2026-11-01'], ['cancelled', '2026-11-02'], ['active', '2026-10-22'], ['active', '2025-01-01']] as [$status, $date]) row('enrollments', ['user_id' => 1, 'course_id' => 1, 'status' => $status, 'created_at' => $date.' 12:00:00']);
    $payment = row('other_payments', ['amount' => 100.10, 'paid_at' => '2026-10-29 05:00:00']);
    row('other_payments', ['amount' => .20, 'paid_at' => '2026-11-04 16:00:00']);
    $void = row('other_payments', ['amount' => 900, 'paid_at' => '2026-11-04 16:00:00', 'voided_at' => '2026-11-04 16:30:00']);
    foreach ([[10, '2026-10-29 04:59:59'], [20, '2026-10-25 12:00:00'], [5, '2026-10-22 04:59:59'], [400, '2026-11-04 18:00:00']] as [$amount, $paid]) row('other_payments', ['amount' => $amount, 'paid_at' => $paid]);
    foreach ([['paid', 50.25, '2026-11-03 12:00:00'], ['pending', 800, '2026-11-03 12:00:00'], ['paid', 70.05, '2026-10-23 12:00:00']] as [$status, $amount, $paid]) row('course_installments', ['enrollment_id' => 1, 'status' => $status, 'amount' => $amount, 'due_date' => '2026-12-01', 'paid_at' => $paid]);
    foreach ([['paid', 200.30, '2026-11-01 12:00:00', 'online'], ['split', 700, '2026-11-01 12:00:00', 'online'], ['pending', 500, null, 'online'], ['rejected', 400, '2026-11-01 12:00:00', 'online'], ['paid', 300, '2026-10-26 12:00:00', 'online'], ['pending', 1100, null, 'admin']] as [$status, $amount, $paid, $source]) row('course_orders', compact('status', 'amount', 'source') + ['paid_at' => $paid]);
    foreach ([['sold', $payment, null], ['sold', $void, null], ['draft', null, null], ['approved', null, '2026-11-04'], ['approved', null, '2026-11-03'], ['approved', null, null], ['cancelled', null, null]] as $index => [$status, $linked, $valid]) row('quotes', ['code' => 'COT-'.$index, 'buyer_name' => 'Empresa', 'amount' => 500, 'status' => $status, 'other_payment_id' => $linked, 'valid_until' => $valid]);
    row('certificates', ['enrollment_id' => 2, 'code' => 'LT-NEW', 'issued_at' => '2026-11-02 12:00:00', 'expires_at' => '2027-11-02 12:00:00']);
    row('certificates', ['enrollment_id' => 5, 'code' => 'LT-LEGACY', 'issued_at' => '2025-11-15 12:00:00']);
    row('certificates', ['enrollment_id' => 2, 'code' => 'LT-EXPIRED', 'issued_at' => '2025-11-04 17:00:00', 'expires_at' => '2026-11-04 17:00:00']);
    row('in_person_certificates', ['student_name' => 'Presencial', 'course_title' => 'Curso P', 'code' => 'LT-P-NEW', 'issued_at' => '2026-11-01 12:00:00', 'expires_at' => '2026-12-04 17:00:00']);
    foreach ([[1, 80, '2026-11-04'], [1, 120, '2026-11-03'], [1, 500, '2026-11-05'], [3, 99, '2026-11-02']] as [$enrollment, $amount, $due]) row('course_installments', ['enrollment_id' => $enrollment, 'status' => 'pending', 'amount' => $amount, 'due_date' => $due]);
    foreach ([[3, null, true], [0, 0, true], [1, 0, true], [null, null, true], [0, 5, false], [6, null, true]] as $i => [$stock, $minimum, $active]) row('products', ['name' => 'Producto '.$i, 'stock' => $stock, 'stock_warehouse' => 10, 'min_stock' => $minimum, 'is_active' => $active]);
    foreach (['2026-11-05 14:00:00', '2026-11-18 17:00:00', '2026-11-19 14:00:00', '2026-11-04 16:59:59'] as $date) row('in_person_sessions', ['course_id' => 1, 'title' => 'Grupo', 'location' => 'Lima', 'starts_at' => $date, 'capacity' => 30]);
    row('in_person_participants', ['in_person_session_id' => 1]); row('in_person_participants', ['in_person_session_id' => 1]);
    foreach ([['2026-11-04', 100], ['2026-10-28', 200], ['2026-11-05', 100]] as [$date, $total]) row('stock_purchases', ['purchased_at' => $date, 'total' => $total]);
    row('stock_sponsorships', ['total_cost' => 12]); row('stock_sponsorships', ['total_cost' => 300, 'created_at' => '2026-11-05 12:00:00']);
    DB::enableQueryLog();
    $report = $service->build(7);
    check(abs($report['cash']['total'] - 350.85) < .001, 'Cobros combine paid sources once and exclude voids, split orders and pending payments');
    check(abs($report['cash']['previous'] - 400.05) < .001, 'Previous period uses its own boundaries and excludes older payments');
    check($report['cash']['change_percent'] === -12.3, 'Comparison percentage uses actual previous cobros');
    check($report['cash']['count'] === 4, 'Payment count counts receipts rather than quotations');
    check($report['period']['start'] === '2026-10-29' && $report['period']['timezone'] === 'America/Lima', 'Period uses calendar dates in Peru');
    check($report['cash']['daily'][0]['sales'] === 100.1 && $report['cash']['daily'][6]['sales'] === .2, 'UTC midnight boundary is grouped into the correct Lima day');
    check(abs(array_sum(array_column($report['cash']['daily'], 'total')) - $report['cash']['total']) < .001, 'Chart daily totals reconcile with KPI');
    check($report['activity']['enrollments'] === 2 && $report['activity']['previous_enrollments'] === 1, 'New enrollments exclude cancelled registrations and compare periods');
    check($report['activity']['certificates'] === 2, 'Issued count includes virtual and presencial certificates');
    check($report['activity']['quotes'] === 7 && $report['activity']['quotes_converted'] === 1, 'Quote conversion excludes linked voided sales');
    check($report['attention']['ready_quotes'] === 2, 'Approved quotes remain valid through the Lima due date and support no expiry');
    check($report['ready_quotes'][0]['valid_until'] === '2026-11-04', 'Quotes expiring soon appear before quotes without an expiry');
    check($report['attention']['overdue_count'] === 2 && $report['attention']['overdue_amount'] === 200.0, 'Due-today and overdue quotas exclude paid, future and cancelled enrollments');
    check($report['overdue'][0]['due_date'] === '2026-11-03' && str_ends_with($report['overdue'][0]['href'], '/1/perfil'), 'Oldest debt links to the correct student profile');
    check($report['attention']['pending_orders'] === 1, 'Confirmation queue matches the online order module');
    check($report['attention']['low_stock'] === 2, 'Stock alerts respect active state, zero minimum and untracked products');
    check($report['attention']['expiring_certificates'] === 2 && $report['expiring_certificates'][0]['code'] === 'LT-LEGACY', 'Renewal window includes legacy annual expiry and exact 30-day horizon, excludes expired certificates');
    check(count($report['upcoming']) === 2 && $report['upcoming'][0]['participants'] === 2, 'Upcoming groups use the 14-day window and real attendance registration count');
    check($report['academic'] === ['active_students' => 1, 'published_courses' => 1, 'active_enrollments' => 2, 'completed_enrollments' => 2], 'Academic snapshot preserves issued certificates and does not count staff as students');
    check($report['cash']['purchases'] === 100.0 && $report['cash']['sponsorships'] === 12.0, 'Purchase and sponsorship costs are period-bound separate figures, not deducted as profit');
    check(collect(DB::getQueryLog())->every(fn ($query) => str_starts_with(strtolower(trim($query['query'])), 'select')), 'Building the dashboard is read-only');
    DB::disableQueryLog();
    foreach ([7, 30, 90] as $days) check(count($service->build($days)['cash']['daily']) === $days, 'Period '.$days.' includes every calendar bucket');
    try { (new DashboardController())->index(Request::create('/admin', 'GET', ['period' => 15]), $service); throw new RuntimeException('Invalid period accepted'); }
    catch (ValidationException $error) { check(isset($error->errors()['period']), 'Controller rejects unsupported periods'); }
    check(in_array('admin', $app['router']->getRoutes()->getByName('admin')->gatherMiddleware(), true), 'Dashboard route remains restricted by administrative middleware');
    if (in_array('--preview', $argv, true)) {
        $path = storage_path('app/previews');
        if (!is_dir($path)) mkdir($path, 0775, true);
        file_put_contents($path.'/dashboard-fixture.json', json_encode([
            '7' => $report, '30' => $service->build(30), '90' => $service->build(90), 'empty' => $empty,
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo "Preview fixture: storage/app/previews/dashboard-fixture.json\n";
    }
    Carbon::setTestNow('2025-02-01 17:00:00 UTC');
    row('certificates', ['enrollment_id' => 2, 'code' => 'LT-LEAP', 'issued_at' => '2024-02-29 12:00:00']);
    check(in_array('LT-LEAP', array_column($service->build(7)['expiring_certificates'], 'code'), true), 'Legacy leap-day certificate follows the existing anniversary rule');
} catch (Throwable $error) { $failure = $error; }
finally { Carbon::setTestNow(); }
if ($failure) { fwrite(STDERR, $failure->getMessage().PHP_EOL); exit(1); }
