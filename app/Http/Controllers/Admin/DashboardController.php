<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminDashboard;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request, AdminDashboard $dashboard): Response
    {
        $data = $request->validate(['period' => ['sometimes', 'required', 'integer', Rule::in([7, 30, 90])]]);
        return Inertia::render('Admin/Dashboard', ['dashboard' => $dashboard->build((int) ($data['period'] ?? 30))]);
    }
}
