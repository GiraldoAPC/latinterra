<?php

// Full demo on isolated SQLite memory and temporary storage; never runs against configured MySQL.
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Aula\{Certificate, Course, CourseOrder, Enrollment, InPersonCertificate, InPersonSession};
use App\Models\Inventario\{StockPurchase, StockSponsorship, StockTransfer};
use App\Models\Ventas\{OtherPayment, Product, Quote, SaleItem};
use App\Models\{Setting, User};
use App\Services\{AdminDashboard, MeetingDemo};
use Illuminate\Support\Facades\{DB, Hash, Storage};

config(['database.default' => 'meeting_test', 'database.connections.meeting_test' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true]]);
$testRoot = sys_get_temp_dir().'/latinterra-meeting-'.bin2hex(random_bytes(6)); mkdir($testRoot);
config(['filesystems.disks.public.root' => $testRoot]); Storage::forgetDisk('public');
function checkDemo(bool $ok, string $message): void { if (!$ok) throw new RuntimeException($message); echo 'OK: '.$message.PHP_EOL; }
$failure = null;
try {
    foreach (glob(__DIR__.'/../../database/migrations/*.php') as $file) {
        // Legacy MySQL-specific DROP FOREIGN is irrelevant here: keep the old nullable identity columns in the test DB.
        if (str_contains($file, 'drop_identity_fields_from_users')) continue;
        (require $file)->up();
    }
    $admin = User::create(['name' => 'Existing admin', 'email' => 'existing@example.test', 'password' => 'ExistingPassword123!', 'role' => 'admin', 'is_active' => true]);
    $oldHash = $admin->password;
    $existing = Product::create(['name' => 'Existing product', 'sku' => 'EXISTING', 'price' => 50]);
    $existing->forceFill(['stock' => 7, 'stock_warehouse' => 2, 'avg_cost' => 30])->save();
    Setting::set('warehouse_mode', '0');
    $result = (new MeetingDemo())->prepare($admin);
    checkDemo($result['created'] && $result['counts']['Productos'] >= 15, 'Loads demo inventory and all related modules');
    checkDemo($existing->fresh()->stock === 7 && $existing->fresh()->stock_warehouse === 2 && $existing->fresh()->avg_cost === '30.00', 'Existing inventory remains unchanged');
    checkDemo($admin->fresh()->password === $oldHash && $admin->fresh()->role === 'admin', 'Existing administrator credentials and role remain unchanged');
    checkDemo(!Setting::bool('warehouse_mode'), 'Original warehouse setting is preserved without the explicit option');
    $student = User::where('email', 'alumno01@demo.latinterra.test')->firstOrFail();
    checkDemo(Hash::check($result['password'], $student->password), 'Generated demo password authenticates and is stored hashed');
    checkDemo(!str_contains(Setting::get(MeetingDemo::KEY), $result['password']), 'Manifest does not store plaintext passwords');
    foreach (Product::where('sku', 'like', 'DEMO-%')->get() as $product) {
        $purchased = (int) StockPurchase::where('product_id', $product->id)->sum('quantity');
        $sold = (int) SaleItem::where('product_id', $product->id)->sum('qty');
        $sponsored = (int) StockSponsorship::where('product_id', $product->id)->sum('quantity');
        checkDemo($product->stock >= 0 && $product->stock_warehouse >= 0 && $product->stock + $product->stock_warehouse === $purchased - $sold - $sponsored, 'Inventory reconciles: '.$product->sku);
    }
    $weighted = Product::where('sku', 'DEMO-BMCLBS')->firstOrFail();
    checkDemo(abs((float) $weighted->avg_cost - (32 * 172.5 + 10 * 192.5) / 42) < .01, 'Second purchase produces a weighted average cost');
    checkDemo(Product::where('sku', 'like', 'DEMO-%')->lowStock()->exists(), 'Demo includes low stock alerts');
    foreach (Quote::where('status', 'sold')->get() as $quote) checkDemo($quote->payment && (float) $quote->amount === (float) $quote->payment->amount, 'Converted quotation matches its payment');
    $dashboard = (new AdminDashboard())->build(30);
    checkDemo($dashboard['cash']['total'] > 0 && $dashboard['cash']['previous'] > 0, 'Dashboard has current and previous period income');
    checkDemo(count(array_filter($dashboard['cash']['daily'], fn ($d) => $d['total'] > 0)) >= 6, 'Dashboard chart has activity on multiple dates');
    checkDemo(Course::where('slug', 'like', 'demo-reunion-%')->count() === 4 && Enrollment::count() >= 16, 'Four courses have enrolled students');
    checkDemo(Certificate::where('code', 'like', 'LT-DEMO-%')->count() === 4 && InPersonCertificate::where('code', 'like', 'LT-P-DEMO-%')->count() === 3, 'Virtual and in-person demonstration certificates exist');
    checkDemo((new App\Http\Controllers\Admin\CertificateController())->index() instanceof Inertia\Response, 'Certificate administration accepts the demo signatories');
    $full = InPersonSession::where('title', 'like', '%cupo completo')->firstOrFail();
    checkDemo($full->participants()->count() === $full->capacity, 'One upcoming in-person group is full');
    checkDemo(CourseOrder::where('status', 'pending')->where('source', 'online')->exists(), 'Online course orders include a pending payment case');
    $before = [User::count(), Product::count(), StockPurchase::count(), StockTransfer::count(), OtherPayment::count(), Enrollment::count(), Quote::count()];
    $again = (new MeetingDemo())->prepare($admin);
    checkDemo(!$again['created'] && $again['password'] === null && $before === [User::count(), Product::count(), StockPurchase::count(), StockTransfer::count(), OtherPayment::count(), Enrollment::count(), Quote::count()], 'Repeat load does not duplicate records or reset passwords/progress');
    (new MeetingDemo())->prepare($admin, true);
    checkDemo(Setting::bool('warehouse_mode'), 'Explicit warehouse option also works after the first load');
    foreach (App\Models\Aula\ExamAttempt::all() as $attempt) {
        $score = 20 * $attempt->answers()->where('is_correct', true)->count() / $attempt->answers()->count();
        if (abs($score - (float) $attempt->score) > .01) throw new RuntimeException('Answer score does not reconcile');
    }
    checkDemo(true, 'Stored evaluation scores reconcile with their answers');
    $failedStudent = User::where('email', 'alumno09@demo.latinterra.test')->firstOrFail();
    $failedEntry = Enrollment::where('user_id', $failedStudent->id)->firstOrFail();
    checkDemo($failedEntry->lessonProgress()->count() === 0 && !$failedEntry->examAttempts()->where('passed', true)->exists(), 'Failed module example has reset progress and no contradictory approval');
    foreach (Certificate::all() as $certificate) if ($certificate->issued_at < $certificate->enrollment->created_at) throw new RuntimeException('Certificate predates enrollment');
    checkDemo(true, 'Certificates are dated after enrollment');
    $paidOrder = CourseOrder::where('status', 'paid')->firstOrFail();
    $paidEntry = Enrollment::where('user_id', $paidOrder->user_id)->where('course_id', $paidOrder->course_id)->firstOrFail();
    checkDemo($paidEntry->installments()->count() === 0, 'Fully paid course order does not duplicate income with installment payments');
    checkDemo(!str_contains(json_encode($result['counts']), '@'), 'Summary contains counts, not contact data');
} catch (Throwable $error) { $failure = $error; }
finally {
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($testRoot, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($iterator as $path) { $path->isDir() ? rmdir($path->getPathname()) : unlink($path->getPathname()); }
    rmdir($testRoot);
}
if ($failure) { fwrite(STDERR, $failure->getMessage().PHP_EOL); exit(1); }
