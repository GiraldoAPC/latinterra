<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Settings/Index', [
            'warehouseMode' => Setting::bool('warehouse_mode'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'warehouse_mode' => ['required', 'boolean'],
        ]);

        Setting::set('warehouse_mode', $data['warehouse_mode'] ? '1' : '0');

        return back()->with('success', 'Configuracion actualizada.');
    }
}
