<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ventas\Product;
use App\Models\Ventas\Quote;
use App\Services\QuoteOperations;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class QuoteController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Quotes/Index', [
            'quotes' => Quote::orderByDesc('id')->paginate(20),
            'products' => Product::active()->orderBy('name')->get(['id', 'name', 'price', 'stock']),
        ]);
    }

    public function store(Request $request, QuoteOperations $operations): RedirectResponse
    {
        $data = $request->validate([
            'buyer_name' => ['required', 'string', 'max:180'], 'buyer_document' => ['nullable', 'string', 'max:30'],
            'valid_until' => ['nullable', 'date_format:Y-m-d'], 'notes' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1', 'max:50'], 'items.*.product_id' => ['required', 'integer', 'distinct', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:10000'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0', 'max:999999.99', 'decimal:0,2'],
        ]);
        $quote = $operations->create($data, $request->user()->id);

        return redirect()->route('admin.quotes.show', $quote)->with('success', 'Cotización creada.');
    }

    public function show(Quote $quote): Response
    {
        return Inertia::render('Admin/Quotes/Show', ['quote' => $quote->load('payment:id,receipt_code,voided_at'), 'expired' => $quote->isExpired()]);
    }

    public function approve(Request $request, Quote $quote, QuoteOperations $operations): RedirectResponse
    {
        $operations->approve($quote, $request->user()->id);
        return back()->with('success', 'Cotización aprobada. El stock se verificará al registrar el pago.');
    }

    public function cancel(Quote $quote, QuoteOperations $operations): RedirectResponse
    {
        $operations->cancel($quote);
        return back()->with('success', 'Cotización cancelada.');
    }

    public function sell(Request $request, Quote $quote, QuoteOperations $operations): RedirectResponse
    {
        $data = $request->validate([
            'payment_method' => ['required', 'in:efectivo,transferencia,yape,tarjeta,otro'],
            'payment_reference' => ['nullable', 'string', 'max:120'],
        ]);
        $payment = $operations->sell($quote, $data, $request->user()->id);
        return redirect()->route('admin.ventas.otros-pagos.receipt', $payment)->with('success', 'Venta de cotización registrada.');
    }
}
