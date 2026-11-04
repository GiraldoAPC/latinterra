<?php

// SQLite memory + fake mail transport: never sends mail to a real recipient.
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\Admin\QuoteController;
use App\Mail\QuoteMail;
use App\Models\Ventas\Quote;
use App\Services\QuotePdf;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Testing\Fakes\MailFake;
use Illuminate\Validation\ValidationException;

function check(bool $value, string $label): void
{
    if (!$value) throw new RuntimeException($label);
    echo "OK: $label\n";
}
function testRequest(array $data): Request
{
    $request = Request::create('/', 'POST', $data);
    $request->setLaravelSession(app('session')->driver());
    app()->instance('request', $request);
    return $request;
}
function rejected(callable $action, string $field, string $label): void
{
    try { $action(); throw new RuntimeException($label.' (unexpectedly accepted)'); }
    catch (ValidationException $error) { check(isset($error->errors()[$field]), $label); }
}

config(['database.default' => 'quote_delivery_test', 'database.connections.quote_delivery_test' => [
    'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true,
], 'session.driver' => 'array', 'mail.default' => 'smtp']);
$app['session']->start();
$app['redirect']->setSession($app['session']->driver());
Schema::create('quotes', function (Blueprint $table) {
    $table->id(); $table->string('code'); $table->string('buyer_name'); $table->string('buyer_document')->nullable();
    $table->date('valid_until')->nullable(); $table->string('status'); $table->json('items');
    $table->decimal('amount', 10, 2); $table->text('notes')->nullable(); $table->timestamps();
});
$migration = require __DIR__.'/../../database/migrations/2026_11_03_000006_add_quote_email_fields.php';
$migration->up();
$manager = app('mail.manager');
$fake = new MailFake($manager);
Mail::swap($fake);
$failure = null;
try {
    Carbon::setTestNow('2026-11-03 12:00:00');
    $quote = Quote::create([
        'code' => 'COT-MODELO-PDF', 'buyer_name' => 'Ángela Peña · Empresa de ejemplo',
        'buyer_document' => 'Documento de ejemplo', 'buyer_email' => 'cliente@example.test',
        'valid_until' => '2026-11-10', 'status' => 'draft',
        'items' => [['product_id' => 1, 'name' => 'Arnés de seguridad', 'qty' => 2, 'unit_price' => 125.50]],
        'amount' => 251, 'notes' => "Modelo de prueba.\nEntrega sujeta a coordinación.",
    ]);
    $pdf = new QuotePdf();
    $bytes = $pdf->render($quote);
    check(str_starts_with($bytes, '%PDF-') && strlen($bytes) > 1000, 'Server renders a real PDF');
    $directory = storage_path('app/previews');
    File::ensureDirectoryExists($directory);
    file_put_contents($directory.'/cotizacion-modelo.pdf', $bytes);
    $controller = new QuoteController();
    $download = $controller->download($quote, $pdf);
    check($download->headers->get('Content-Type') === 'application/pdf', 'Download has PDF content type');
    check($download->headers->get('Content-Disposition') === 'attachment; filename="COT-MODELO-PDF.pdf"', 'Download uses quote filename');
    check(str_contains($download->headers->get('Cache-Control'), 'private'), 'Download is marked private');
    rejected(fn () => $controller->email(testRequest(['recipient_email' => 'invalid']), $quote, $pdf), 'recipient_email', 'Invalid recipient rejected before send');
    check($fake->sent(QuoteMail::class)->count() === 0 && $quote->fresh()->emailed_at === null, 'Invalid request sends no mail and records no delivery');
    $controller->email(testRequest(['recipient_email' => 'destinatario@example.test', 'message' => 'Gracias por tu interés.']), $quote, $pdf);
    $mail = $fake->sent(QuoteMail::class)->first();
    check($mail && $mail->hasTo('destinatario@example.test'), 'Mail is addressed to chosen recipient');
    $mail->build();
    check($mail->subject === 'Cotización COT-MODELO-PDF · Latin Terra', 'Mail identifies quote in subject');
    check(count($mail->rawAttachments) === 1 && $mail->rawAttachments[0]['name'] === 'COT-MODELO-PDF.pdf'
        && $mail->rawAttachments[0]['options']['mime'] === 'application/pdf' && str_starts_with($mail->rawAttachments[0]['data'], '%PDF-'), 'Mail contains actual PDF attachment');
    check($mail->personalMessage === 'Gracias por tu interés.', 'Optional message passed to mail template');
    check($quote->fresh()->emailed_to === 'destinatario@example.test' && $quote->fresh()->emailed_at !== null, 'Successful send records recipient and time');
    check($quote->fresh()->status === 'draft' && $quote->fresh()->amount === '251.00', 'Sending does not approve quote or create sale');

    config(['mail.default' => 'log']);
    rejected(fn () => $controller->email(testRequest(['recipient_email' => 'otro@example.test']), $quote, $pdf), 'recipient_email', 'Log-only transport is not reported as delivery');
    config(['mail.default' => 'smtp']);
    Mail::swap(new class($manager) extends MailFake {
        public function send($view, array $data = [], $callback = null)
        {
            throw new Symfony\Component\Mailer\Exception\TransportException('Simulated SMTP failure; no network used.');
        }
    });
    $failed = $controller->email(testRequest(['recipient_email' => 'fallo@example.test']), $quote, $pdf);
    check($failed->getSession()->get('errors')->has('recipient_email'), 'SMTP error returned to form');
    check($quote->fresh()->emailed_to === 'destinatario@example.test', 'SMTP failure preserves last successful delivery');
    $quote->buyer_name = '<script>alert(1)</script>';
    $quote->notes = '<img src="https://example.test/private">';
    $html = view('pdf.quote', ['quote' => $quote, 'logo' => null])->render();
    check(!str_contains($html, '<script>') && str_contains($html, '&lt;script&gt;'), 'PDF escapes user-provided HTML');
    $emailHtml = view('emails.quote', ['quote' => $quote, 'personalMessage' => '<script>bad</script>'])->render();
    check(!str_contains($emailHtml, '<script>'), 'Mail template escapes user content');

    $quote->buyer_name = 'Modelo de prueba con 50 productos';
    $quote->items = array_map(fn ($i) => ['product_id' => $i, 'name' => 'Producto de capacitación y seguridad con descripción detallada número '.$i, 'qty' => 1, 'unit_price' => 10], range(1, 50));
    $quote->amount = 500; $quote->notes = 'FIN DE COTIZACIÓN DE PRUEBA';
    $long = $pdf->render($quote);
    file_put_contents($directory.'/cotizacion-multipagina.pdf', $long);
    check(preg_match_all('~/Type\s*/Page\b~', $long) > 1, 'Long quote renders across multiple pages');
    foreach (['admin.quotes.pdf', 'admin.quotes.email'] as $name) {
        $middleware = app('router')->getRoutes()->getByName($name)->gatherMiddleware();
        check(in_array('auth', $middleware, true) && in_array('admin', $middleware, true), "$name requires administrator");
    }
    check(in_array('throttle:10,1', app('router')->getRoutes()->getByName('admin.quotes.email')->gatherMiddleware(), true), 'Mail endpoint has sending rate limit');
    $migration->down();
    check(!Schema::hasColumn('quotes', 'emailed_at'), 'Email migration can roll back');
} catch (Throwable $error) {
    $failure = $error;
} finally {
    Mail::swap($manager); Carbon::setTestNow();
}
if ($failure) { fwrite(STDERR, $failure->getMessage().PHP_EOL); exit(1); }
