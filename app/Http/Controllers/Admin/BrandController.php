<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventario\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Brands/Index', [
            'brands' => Brand::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Brand::create($this->validated($request));

        return back()->with('success', 'Marca creada.');
    }

    public function update(Request $request, Brand $brand): RedirectResponse
    {
        $brand->update($this->validated($request, $brand));

        return back()->with('success', 'Marca actualizada.');
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        if ($brand->products()->exists()) {
            return back()->withErrors(['brand' => 'No se puede eliminar: tiene productos asignados. Desactivala en su lugar.']);
        }

        $brand->delete();

        return back()->with('success', 'Marca eliminada.');
    }

    private function validated(Request $request, ?Brand $brand = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:brands,name' . ($brand ? ",{$brand->id}" : '')],
            'is_active' => ['boolean'],
        ]);
    }
}
