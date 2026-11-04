<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            // Solo para el panel admin - evita una consulta de mas en cada
            // pagina publica, que nunca necesita este dato.
            'settings' => $request->user()?->isAdmin()
                ? ['warehouseMode' => Setting::bool('warehouse_mode')]
                : null,
            'inventoryAlerts' => fn () => $request->user()?->isAdmin() ? [
                'count' => \App\Models\Ventas\Product::active()->lowStock()->count(),
                'products' => \App\Models\Ventas\Product::active()->lowStock()->orderBy('stock')->limit(5)
                    ->get(['id', 'name', 'stock', 'stock_warehouse', 'min_stock']),
            ] : null,
            // Los controladores usan back()->with('success'|'error', ...) /
            // redirect()->with(...) por todo el sistema; sin compartirlo aca
            // esos mensajes nunca llegaban al frontend (Inertia no los pasa
            // automaticamente, a diferencia de "errors" de validacion).
            //
            // Como closures: este metodo share() corre en el middleware,
            // ANTES de que el controlador se ejecute. Si leemos la sesion
            // aca de forma directa, un session()->forget() hecho dentro del
            // controlador (ver StudentCourseController::accessBlockRedirect)
            // llega demasiado tarde y el aviso viejo se muestra una vez mas.
            // Con closures, Inertia recien las resuelve al armar la
            // respuesta, despues del controlador.
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'debt_block' => fn () => $request->session()->get('debt_block'),
                'course_locked' => fn () => $request->session()->get('course_locked'),
            ],
        ];
    }
}
