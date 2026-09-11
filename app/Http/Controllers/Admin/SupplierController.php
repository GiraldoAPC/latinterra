<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventario\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Inventario/Proveedores', [
            'suppliers' => Supplier::orderBy('name')->get(),
        ]);
    }

    /**
     * Devuelve JSON cuando lo llama el alta rapida desde "Registrar compra"
     * (sin salir del modal) - Inertia (pagina de administracion) pide
     * text/html y sigue con el flujo normal de redirect-back.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $supplier = Supplier::create($this->validated($request));

        if ($request->wantsJson()) {
            return response()->json($supplier, 201);
        }

        return back()->with('success', 'Proveedor creado.');
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $supplier->update($this->validated($request, $supplier));

        return back()->with('success', 'Proveedor actualizado.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        if ($supplier->stockPurchases()->exists()) {
            return back()->withErrors(['supplier' => 'No se puede eliminar: tiene compras registradas. Desactivalo en su lugar.']);
        }

        $supplier->delete();

        return back()->with('success', 'Proveedor eliminado.');
    }

    /** Buscador para el alta de compras. */
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $suppliers = Supplier::active()
            ->when($q !== '', fn ($query) => $query->where(fn ($w) => $w->where('name', 'like', "%{$q}%")->orWhere('ruc', 'like', "%{$q}%")))
            ->orderBy('name')
            ->limit(15)
            ->get(['id', 'name', 'ruc']);

        return response()->json($suppliers);
    }

    private function validated(Request $request, ?Supplier $supplier = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'ruc' => ['nullable', 'digits:11', 'unique:suppliers,ruc' . ($supplier ? ",{$supplier->id}" : '')],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:180'],
            'address' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);
    }
}
