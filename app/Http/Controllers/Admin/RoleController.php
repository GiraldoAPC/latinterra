<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\RoleManagement;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        return Inertia::render('Admin/Usuarios/Roles', [
            'roles' => User::ROLES, 'search' => $search,
            'users' => User::when($search !== '', fn ($q) => $q->where(fn ($q) => $q->where('name', 'like', "%$search%")
                ->orWhere('email', 'like', "%$search%")))->orderBy('name')->paginate(25)
                ->withQueryString()->through(fn ($user) => ['id' => $user->id, 'name' => $user->name,
                    'email' => $user->email, 'role' => $user->role, 'is_active' => $user->is_active]),
        ]);
    }

    public function update(Request $request, User $user, RoleManagement $management): RedirectResponse
    {
        $data = $request->validate(['role' => ['required', Rule::in(array_keys(User::ROLES))], 'is_active' => ['required', 'boolean']]);
        $management->update($request->user(), $user, $data['role'], (bool) $data['is_active']);
        return back()->with('success', 'Rol y estado actualizados.');
    }

    public function store(Request $request, RoleManagement $management): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'], 'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'role' => ['required', Rule::in(['admin', 'manager', 'instructor', 'coordinator'])],
        ]);
        $management->createStaff($request->user(), $data);
        return back()->with('success', 'Cuenta de personal creada.');
    }
}
