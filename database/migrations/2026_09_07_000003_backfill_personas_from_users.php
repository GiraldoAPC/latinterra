<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Copia los datos de identidad que ya existen en `users` (de cuando todo
 * vivia ahi) hacia `personas`, y enlaza cada usuario con su nueva persona.
 * Corre una sola vez, antes de que la siguiente migracion borre esas
 * columnas de `users`.
 */
return new class extends Migration
{
    public function up(): void
    {
        $users = DB::table('users')->whereNull('persona_id')->get();

        foreach ($users as $user) {
            $personaId = DB::table('personas')->insertGetId([
                'document_type' => $user->document_type,
                'dni' => $user->dni,
                'name' => $user->name,
                'last_name' => $user->last_name,
                'gender' => $user->gender,
                'birth_date' => $user->birth_date,
                'phone' => $user->phone,
                'address' => $user->address,
                'distrito_id' => $user->distrito_id,
                'pais_id' => $user->pais_id,
                'ciudad_extranjero' => $user->ciudad_extranjero,
                'avatar' => $user->avatar,
                'created_at' => $user->created_at,
                'updated_at' => now(),
            ]);

            DB::table('users')->where('id', $user->id)->update(['persona_id' => $personaId]);
        }
    }

    public function down(): void
    {
        // No-op: revertir esto significaria decidir que hacer con las
        // personas ya creadas; se maneja a mano si hace falta.
    }
};
