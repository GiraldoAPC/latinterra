<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ventas\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Clientes con RUC para facturarles (simulado) desde el carrito de venta. */
class ClientController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Clients/Index', [
            'clients' => Client::orderBy('business_name')->get(),
        ]);
    }

    /**
     * Devuelve JSON cuando lo llama el selector de "Factura" del carrito de
     * venta (agregar cliente al vuelo, sin salir del modal) - Inertia
     * (pagina de administracion) pide text/html y sigue con el flujo normal
     * de redirect-back.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $data = $this->validated($request);
        $client = Client::create($data);

        if ($request->wantsJson()) {
            return response()->json($client, 201);
        }

        return back()->with('success', 'Cliente creado.');
    }

    public function update(Request $request, Client $client): RedirectResponse
    {
        $data = $this->validated($request, $client);
        $client->update($data);

        return back()->with('success', 'Cliente actualizado.');
    }

    public function destroy(Client $client): RedirectResponse
    {
        $client->delete();

        return back()->with('success', 'Cliente eliminado.');
    }

    /** Buscador para el selector de "Factura" y el comprador de una venta - filtrable por tipo (natural/juridica). */
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        $type = $request->query('type');

        $clients = Client::query()
            ->when($q !== '', fn ($query) => $query->where(fn ($w) => $w->where('ruc', 'like', "%{$q}%")->orWhere('business_name', 'like', "%{$q}%")))
            ->when(in_array($type, ['natural', 'juridica'], true), fn ($query) => $query->where('type', $type))
            ->orderBy('business_name')
            ->limit(15)
            ->get(['id', 'type', 'ruc', 'business_name']);

        return response()->json($clients);
    }

    private function validated(Request $request, ?Client $client = null): array
    {
        return $request->validate([
            'type' => ['required', 'in:natural,juridica'],
            'ruc' => ['required', 'digits:11', 'unique:clients,ruc' . ($client ? ",{$client->id}" : '')],
            'dni' => ['nullable', 'digits:8'],
            'business_name' => ['required', 'string', 'max:180'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:180'],
        ]);
    }
}
