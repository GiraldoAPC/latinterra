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
            'settings' => $request->user()?->role === 'admin'
                ? ['warehouseMode' => Setting::bool('warehouse_mode')]
                : null,
            // Los controladores usan back()->with('success'|'error', ...) /
            // redirect()->with(...) por todo el sistema; sin compartirlo aca
            // esos mensajes nunca llegaban al frontend (Inertia no los pasa
            // automaticamente, a diferencia de "errors" de validacion).
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'debt_block' => $request->session()->get('debt_block'),
            ],
        ];
    }
}
