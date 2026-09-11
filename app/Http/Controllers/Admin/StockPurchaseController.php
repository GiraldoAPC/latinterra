<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventario\StockPurchase;
use App\Models\Inventario\StockTransfer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/** Registro de compras: unico mecanismo que aumenta el stock de un producto (ver Product::registerPurchase). */
class StockPurchaseController extends Controller
{
    public function index(): Response
    {
        $purchases = StockPurchase::with(['product:id,name,sku', 'supplier:id,name'])
            ->orderByDesc('purchased_at')
            ->orderByDesc('id')
            ->get();

        $transfers = StockTransfer::with('product:id,name,sku')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Admin/Inventario/Movimientos', [
            'purchases' => $purchases,
            'transfers' => $transfers,
            'stats' => [
                'total' => StockPurchase::sum('total'),
                'count' => StockPurchase::count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'document_type' => ['nullable', 'in:factura,boleta,guia_remision,ticket,otro'],
            'document_number' => ['nullable', 'string', 'max:60'],
            'payment_method' => ['nullable', 'in:efectivo,transferencia,yape,tarjeta,otro'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:1'],
            'purchased_at' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        StockPurchase::register($data + ['registered_by' => Auth::id()]);

        return back()->with('success', 'Compra registrada.');
    }
}
