<!doctype html>
<html lang="es"><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;color:#273d4c;line-height:1.6">
    <h1 style="font-size:22px;color:#024a7d">Cotización {{ $quote->code }}</h1>
    <p>Hola, {{ $quote->buyer_name }}:</p>
    <p>Adjuntamos nuestra cotización en formato PDF por un total de <strong>S/ {{ number_format($quote->amount, 2) }}</strong>.</p>
    @if($quote->valid_until)<p>Vigente hasta el {{ $quote->valid_until->format('d/m/Y') }}.</p>@endif
    @if($personalMessage)<p style="white-space:pre-wrap">{{ $personalMessage }}</p>@endif
    <p>Gracias por tu interés.<br><strong>Latin Terra</strong></p>
</body></html>
