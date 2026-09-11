<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventario\Brand;
use App\Models\Inventario\Category;
use App\Models\Ventas\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Products/Index', [
            'products' => Product::with(['category:id,name', 'brand:id,name'])->orderBy('name')->get(),
            'categories' => Category::active()->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::active()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        Product::create($data);

        return back()->with('success', 'Producto creado.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $this->validated($request, $product);
        $product->update($data);

        return back()->with('success', 'Producto actualizado.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->stockPurchases()->exists()) {
            return back()->withErrors(['product' => 'No se puede eliminar: tiene compras registradas. Desactivalo en su lugar.']);
        }

        $product->delete();

        return back()->with('success', 'Producto eliminado.');
    }

    /** Buscador para el carrito de venta y el alta de compras - por texto o codigo de barras exacto (escaneo). */
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $products = Product::active()
            ->when($q !== '', fn ($query) => $query->where(
                fn ($w) => $w->where('name', 'like', "%{$q}%")->orWhere('sku', 'like', "%{$q}%")->orWhere('barcode', $q)
            ))
            ->orderBy('name')
            ->limit(15)
            ->get(['id', 'name', 'sku', 'barcode', 'price', 'stock', 'stock_warehouse', 'min_stock', 'avg_cost'])
            ->map(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'barcode' => $p->barcode,
                'price' => $p->price,
                'stock' => $p->stock,
                'stock_warehouse' => $p->stock_warehouse,
                'avg_cost' => $p->avg_cost,
                'low_stock' => $p->isLowStock(),
            ]);

        return response()->json($products);
    }

    private function validated(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'name' => ['required', 'string', 'max:180'],
            'sku' => ['nullable', 'string', 'max:60'],
            'barcode' => ['nullable', 'string', 'max:64', 'unique:products,barcode' . ($product ? ",{$product->id}" : '')],
            'color' => ['nullable', 'string', 'max:60'],
            'size' => ['nullable', 'string', 'max:60'],
            'price' => ['required', 'numeric', 'min:0'],
            'min_stock' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);
    }
}
