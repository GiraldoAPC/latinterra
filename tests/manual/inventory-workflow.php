<?php

// Regression checks in SQLite memory; no configured database is modified.
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Setting;
use App\Models\Ventas\Product;
use App\Models\Ventas\Quote;
use App\Models\Ventas\OtherPayment;
use App\Models\Ventas\SaleItem;
use App\Models\Inventario\StockSponsorship;
use App\Services\InventoryOperations;
use App\Services\QuoteOperations;
use App\Http\Controllers\Admin\OtherPaymentController;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

function check(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
    echo "OK: $message\n";
}
function rejected(callable $action, string $field, string $label): void
{
    try { $action(); throw new RuntimeException($label.' (accepted unexpectedly)'); }
    catch (ValidationException $error) { check(isset($error->errors()[$field]), $label); }
}
function product(array $values = []): Product
{
    return Product::forceCreate(array_replace(['name' => 'Casco', 'price' => 90, 'avg_cost' => 10, 'stock' => 8, 'stock_warehouse' => 10, 'min_stock' => 5, 'is_active' => true], $values));
}

config(['database.default' => 'inventory_test', 'database.connections.inventory_test' => [
    'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true,
], 'session.driver' => 'array']);
$app['session']->start();
$app['redirect']->setSession($app['session']->driver());
Schema::create('users', function (Blueprint $table) { $table->id(); $table->string('name'); $table->string('role'); $table->timestamps(); });
Schema::create('products', function (Blueprint $table) {
    $table->id(); $table->string('name'); $table->decimal('price', 10, 2); $table->decimal('avg_cost', 10, 2)->nullable();
    $table->integer('stock')->nullable(); $table->integer('stock_warehouse')->default(0); $table->integer('min_stock')->nullable();
    $table->boolean('is_active')->default(true); $table->timestamps();
});
Schema::create('settings', function (Blueprint $table) { $table->id(); $table->string('key')->unique(); $table->string('value')->nullable(); $table->timestamps(); });
Schema::create('receipt_sequence', function (Blueprint $table) { $table->id(); $table->timestamp('created_at')->nullable(); });
Schema::create('other_payments', function (Blueprint $table) {
    $table->id(); $table->string('type'); $table->string('document_type'); $table->string('concept'); $table->text('description')->nullable();
    $table->decimal('amount', 10, 2); $table->unsignedBigInteger('user_id')->nullable(); $table->string('buyer_name')->nullable();
    $table->string('buyer_ruc')->nullable(); $table->string('buyer_business_name')->nullable(); $table->unsignedBigInteger('client_id')->nullable();
    $table->string('payment_method'); $table->string('payment_reference')->nullable(); $table->string('receipt_code')->unique();
    $table->unsignedBigInteger('registered_by'); $table->dateTime('paid_at'); $table->dateTime('voided_at')->nullable(); $table->timestamps();
});
Schema::create('sale_items', function (Blueprint $table) {
    $table->id(); $table->unsignedBigInteger('other_payment_id'); $table->unsignedBigInteger('product_id')->nullable();
    $table->string('name'); $table->decimal('unit_price', 10, 2); $table->decimal('unit_cost', 10, 2)->nullable();
    $table->unsignedInteger('qty'); $table->string('serial')->nullable(); $table->timestamps();
});
$migration = require __DIR__.'/../../database/migrations/2026_11_03_000005_add_quotes_and_sponsorships.php';
$migration->up();
$failure = null;
try {
    Carbon::setTestNow('2026-11-03 12:00:00');
    $admin = User::create(['name' => 'Admin', 'role' => 'admin']);
    Auth::setUser($admin);
    $p = product();
    $inventory = new InventoryOperations();
    $data = ['product_id' => $p->id, 'quantity' => 2, 'recipient' => 'Equipo local', 'source' => 'sales', 'notes' => 'Auspicio deportivo', 'request_key' => (string) Str::uuid()];
    $record = $inventory->sponsor($data, $admin->id);
    check($p->fresh()->stock === 6 && $record->total_cost === '20.00', 'Sponsorship reduces sales stock and uses purchase cost');
    check(OtherPayment::count() === 0, 'Sponsorship creates no sale or income');
    check($inventory->sponsor($data, $admin->id)->id === $record->id && $p->fresh()->stock === 6, 'Repeated sponsorship request does not consume stock twice');
    rejected(fn () => $inventory->sponsor(array_replace($data, ['quantity' => 1]), $admin->id), 'request_key', 'Reusing request key with changed payload is rejected');
    rejected(fn () => $inventory->sponsor(array_replace($data, ['quantity' => 7, 'request_key' => (string) Str::uuid()]), $admin->id), 'quantity', 'Sponsorship cannot exceed available stock');
    rejected(fn () => $inventory->sponsor(array_replace($data, ['source' => 'warehouse', 'request_key' => (string) Str::uuid()]), $admin->id), 'source', 'Warehouse sponsorship requires warehouse mode');
    Setting::set('warehouse_mode', '1');
    $inventory->sponsor(array_replace($data, ['source' => 'warehouse', 'request_key' => (string) Str::uuid()]), $admin->id);
    check($p->fresh()->stock_warehouse === 8 && $p->fresh()->stock === 6, 'Warehouse sponsorship affects only selected location');
    $warehouseOnly = product(['stock' => null, 'stock_warehouse' => 5]);
    $inventory->sponsor(array_replace($data, ['product_id' => $warehouseOnly->id, 'source' => 'warehouse', 'request_key' => (string) Str::uuid()]), $admin->id);
    check($warehouseOnly->fresh()->stock_warehouse === 3, 'Newly purchased warehouse inventory can be sponsored before transfer');
    $unknown = product(['avg_cost' => null]);
    rejected(fn () => $inventory->sponsor(array_replace($data, ['product_id' => $unknown->id, 'request_key' => (string) Str::uuid()]), $admin->id), 'product_id', 'Unknown purchase cost cannot be treated as zero');
    $untracked = product(['stock' => null]);
    rejected(fn () => $inventory->sponsor(array_replace($data, ['product_id' => $untracked->id, 'request_key' => (string) Str::uuid()]), $admin->id), 'product_id', 'Untracked sales stock cannot be sponsored');
    $p->avg_cost = 20; $p->save();
    check($record->fresh()->unit_cost === '10.00', 'Later cost changes preserve sponsorship cost snapshot');

    $quotes = new QuoteOperations();
    $quoteData = ['buyer_name' => 'Cliente', 'valid_until' => '2026-11-03', 'items' => [['product_id' => $p->id, 'name' => 'Forged name', 'qty' => 2, 'unit_price' => '100.10']], 'amount' => 1];
    $quote = $quotes->create($quoteData, $admin->id);
    check($quote->amount === '200.20' && $quote->items[0]['name'] === 'Casco', 'Server calculates quote total and product names');
    check($p->fresh()->stock === 6 && OtherPayment::count() === 0, 'Creating quote does not reserve stock or register payment');
    rejected(fn () => $quotes->sell($quote, ['payment_method' => 'efectivo'], $admin->id), 'quote', 'Unapproved quote cannot be sold');
    rejected(fn () => $quotes->create(array_replace($quoteData, ['items' => [$quoteData['items'][0], $quoteData['items'][0]]]), $admin->id), 'items', 'Duplicate product rows rejected');
    $quotes->approve($quote, $admin->id);
    check($quote->fresh()->status === 'approved' && $p->fresh()->stock === 6, 'Approval records status without reducing inventory');
    $p->name = 'New product name'; $p->price = 999; $p->save();
    $payment = $quotes->sell($quote, ['payment_method' => 'transferencia', 'payment_reference' => 'REF-1'], $admin->id);
    check($payment->amount === '200.20' && $p->fresh()->stock === 4, 'Sale uses approved prices and reduces stock once');
    check(SaleItem::first()->name === 'Casco' && SaleItem::first()->unit_cost === '20.00', 'Sale preserves quoted names and current cost snapshot');
    check($quotes->sell($quote, ['payment_method' => 'efectivo'], $admin->id)->id === $payment->id && OtherPayment::count() === 1 && $p->fresh()->stock === 4, 'Repeated conversion returns same sale');
    rejected(fn () => $quotes->cancel($quote), 'quote', 'Sold quote cannot be cancelled as a draft');

    $large = $quotes->create(array_replace($quoteData, ['items' => [['product_id' => $p->id, 'qty' => 100, 'unit_price' => 2]]]), $admin->id);
    $quotes->approve($large, $admin->id);
    rejected(fn () => $quotes->sell($large, ['payment_method' => 'efectivo'], $admin->id), 'quote', 'Conversion rechecks current inventory under lock');
    check(OtherPayment::count() === 1 && SaleItem::count() === 1 && $p->fresh()->stock === 4, 'Failed conversion leaves payment, lines and stock unchanged');
    $cancelled = $quotes->create($quoteData, $admin->id); $quotes->cancel($cancelled);
    rejected(fn () => $quotes->approve($cancelled, $admin->id), 'quote', 'Cancelled quote cannot be approved');
    Carbon::setTestNow('2026-11-04 04:59:59');
    check(!$large->fresh()->isExpired(), 'Quote remains valid through stated date in Peru');
    Carbon::setTestNow('2026-11-04 05:00:00');
    check($large->fresh()->isExpired(), 'Quote expires at following midnight in Peru');
    rejected(fn () => $quotes->sell($large, ['payment_method' => 'efectivo'], $admin->id), 'quote', 'Expired approved quote cannot be sold');

    $request = Request::create('/', 'POST', ['items' => [
        ['product_id' => $p->id, 'name' => 'Casco', 'unit_price' => 7, 'qty' => 3],
        ['product_id' => $p->id, 'name' => 'Casco', 'unit_price' => 7, 'qty' => 3],
    ], 'payment_method' => 'efectivo', 'buyer_type' => 'none']);
    $request->setLaravelSession($app['session']->driver()); $app->instance('request', $request);
    rejected(fn () => (new OtherPaymentController())->sell($request), 'items', 'Ordinary sale rechecks aggregate repeated lines under lock');
    check(OtherPayment::count() === 1 && SaleItem::count() === 1 && $p->fresh()->stock === 4, 'Ordinary sale failure rolls back stock and payment');
    $request = Request::create('/', 'POST', ['items' => [
        ['product_id' => $p->id, 'name' => 'Casco', 'unit_price' => 7, 'qty' => 1],
    ], 'payment_method' => 'efectivo', 'buyer_type' => 'none']);
    $request->setLaravelSession($app['session']->driver()); $app->instance('request', $request);
    (new OtherPaymentController())->sell($request);
    check(OtherPayment::count() === 2 && SaleItem::count() === 2 && $p->fresh()->stock === 3, 'Ordinary sale remains functional with available stock');

    $atLimit = product(['stock' => 5, 'min_stock' => 5]);
    $inactive = product(['stock' => 0, 'is_active' => false]);
    $ids = Product::active()->lowStock()->pluck('id');
    check($ids->contains($atLimit->id), 'Alert includes stock at minimum');
    check(!$ids->contains($inactive->id) && !$ids->contains($untracked->id), 'Alert excludes inactive and untracked products');
    $request->setUserResolver(fn () => $admin);
    $shared = (new HandleInertiaRequests())->share($request);
    check($shared['inventoryAlerts']()['count'] === $ids->count(), 'Admin receives global inventory alerts');
    $request->setUserResolver(fn () => null);
    check((new HandleInertiaRequests())->share($request)['inventoryAlerts']() === null, 'Public visitors do not receive inventory data');
    foreach (['admin.quotes.store', 'admin.quotes.approve', 'admin.quotes.sell', 'admin.sponsorships.store'] as $name) {
        $middleware = app('router')->getRoutes()->getByName($name)->gatherMiddleware();
        check(in_array('auth', $middleware, true) && in_array('admin', $middleware, true), "$name requires administrator");
    }
    $migration->down();
    check(!Schema::hasTable('quotes') && !Schema::hasTable('stock_sponsorships'), 'Inventory migration rollback removes only new tables');
} catch (Throwable $error) {
    $failure = $error;
} finally {
    Carbon::setTestNow();
}
if ($failure) { fwrite(STDERR, $failure->getMessage().PHP_EOL); exit(1); }
