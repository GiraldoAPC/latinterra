<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventario\StockSponsorship;
use App\Models\Ventas\Product;
use App\Services\InventoryOperations;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StockSponsorshipController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Inventario/Auspicios', [
            'products' => Product::active()->orderBy('name')->get(['id', 'name', 'stock', 'stock_warehouse', 'avg_cost']),
            'sponsorships' => StockSponsorship::orderByDesc('id')->paginate(20),
            'totalCost' => StockSponsorship::sum('total_cost'),
        ]);
    }

    public function store(Request $request, InventoryOperations $operations): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'], 'quantity' => ['required', 'integer', 'min:1', 'max:10000'],
            'recipient' => ['required', 'string', 'max:180'], 'notes' => ['required', 'string', 'max:2000'],
            'source' => ['required', 'in:sales,warehouse'], 'request_key' => ['required', 'uuid'],
        ]);
        $operations->sponsor($data, $request->user()->id);
        return back()->with('success', 'Auspicio registrado al costo y stock descontado.');
    }
}
