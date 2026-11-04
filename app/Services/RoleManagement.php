<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RoleManagement
{
    public function update(User $actor, User $target, string $role, bool $active): void
    {
        abort_unless($actor->isAdmin() && $actor->is_active, 403);
        if (!array_key_exists($role, User::ROLES)) {
            throw ValidationException::withMessages(['role' => 'Selecciona un rol válido.']);
        }
        DB::transaction(function () use ($actor, $target, $role, $active) {
            // Serialize privileged account changes, including concurrent demotions.
            User::whereIn('role', ['admin', 'manager'])->orderBy('id')->lockForUpdate()->get(['id']);
            $freshActor = User::findOrFail($actor->id);
            abort_unless($freshActor->isAdmin() && $freshActor->is_active, 403);
            $locked = User::whereKey($target->id)->lockForUpdate()->firstOrFail();
            if ($locked->id === $actor->id) {
                throw ValidationException::withMessages(['role' => 'Solicita a otro administrador cambiar tu rol o estado.']);
            }
            if ($locked->role === 'admin' && $locked->is_active && ($role !== 'admin' || !$active)
                && User::where('role', 'admin')->where('is_active', true)->count() <= 1) {
                throw ValidationException::withMessages(['role' => 'Debe mantenerse al menos una cuenta de administración activa.']);
            }
            if ($locked->role === $role && $locked->is_active === $active) return;
            DB::table('user_role_changes')->insert([
                'user_id' => $locked->id, 'changed_by' => $actor->id, 'previous_role' => $locked->role,
                'new_role' => $role, 'previous_active' => $locked->is_active, 'new_active' => $active,
                'created_at' => now(), 'updated_at' => now(),
            ]);
            $locked->update(['role' => $role, 'is_active' => $active]);
        });
    }

    public function createStaff(User $actor, array $data): User
    {
        abort_unless($actor->isAdmin() && $actor->is_active, 403);
        if (!in_array($data['role'], ['admin', 'manager', 'instructor', 'coordinator'], true)) {
            throw ValidationException::withMessages(['role' => 'Selecciona un rol de personal.']);
        }
        return DB::transaction(function () use ($actor, $data) {
            $user = User::create(['name' => $data['name'], 'email' => $data['email'],
                'password' => Hash::make($data['password']), 'role' => $data['role'], 'is_active' => true]);
            DB::table('user_role_changes')->insert(['user_id' => $user->id, 'changed_by' => $actor->id,
                'previous_role' => null, 'new_role' => $user->role, 'previous_active' => null, 'new_active' => true,
                'created_at' => now(), 'updated_at' => now()]);
            return $user;
        });
    }
}
