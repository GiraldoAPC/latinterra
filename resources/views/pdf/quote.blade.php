<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Cotización {{ $quote->code }}</title>
    <style>
        @page { margin: 35px 38px 45px; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10px; color: #273d4c; }
        h1 { color: #024a7d; font-size: 22px; margin: 18px 0; }
        .logo { max-width: 175px; max-height: 65px; }
        p { margin: 6px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 22px; table-layout: fixed; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
        th { background: #024a7d; color: white; }
        td, th { padding: 9px 6px; border-bottom: 1px solid #dbe5eb; text-align: left; overflow-wrap: break-word; }
        .product { width: 49%; } .number { text-align: right; }
        .total { text-align: right; font-size: 16px; font-weight: bold; margin-top: 18px; }
        .notes { white-space: pre-wrap; margin-top: 20px; }
        .footer { position: fixed; bottom: -25px; font-size: 8px; color: #64748b; }
    </style>
</head>
<body>
    @if($logo)<img class="logo" src="{{ $logo }}" alt="Latin Terra">@endif
    <h1>Cotización {{ $quote->code }}</h1>
    <p><strong>Cliente:</strong> {{ $quote->buyer_name }}</p>
    @if($quote->buyer_document)<p><strong>Documento:</strong> {{ $quote->buyer_document }}</p>@endif
    @if($quote->buyer_email)<p><strong>Correo:</strong> {{ $quote->buyer_email }}</p>@endif
    <p><strong>Emisión:</strong> {{ $quote->created_at->copy()->timezone('America/Lima')->format('d/m/Y') }}</p>
    <p><strong>Vigencia:</strong> {{ $quote->valid_until?->format('d/m/Y') ?? 'Sin fecha límite' }}</p>
    <p><strong>Estado:</strong> {{ ['draft' => 'Pendiente de aprobación', 'approved' => 'Aprobada', 'sold' => 'Convertida en venta', 'cancelled' => 'Cancelada'][$quote->status] ?? $quote->status }}{{ $quote->isExpired() && !in_array($quote->status, ['sold', 'cancelled']) ? ' · Vencida' : '' }}</p>
    <table>
        <thead><tr><th class="product">Producto</th><th class="number">Cantidad</th><th class="number">Precio S/</th><th class="number">Total S/</th></tr></thead>
        <tbody>
            @foreach($quote->items as $item)
                <tr><td class="product">{{ $item['name'] }}</td><td class="number">{{ $item['qty'] }}</td><td class="number">{{ number_format($item['unit_price'], 2) }}</td><td class="number">{{ number_format($item['qty'] * $item['unit_price'], 2) }}</td></tr>
            @endforeach
        </tbody>
    </table>
    <p class="total">Total: S/ {{ number_format($quote->amount, 2) }}</p>
    @if($quote->notes)<div class="notes">{{ $quote->notes }}</div>@endif
    <div class="footer">Latin Terra · {{ $quote->code }}</div>
</body>
</html>
