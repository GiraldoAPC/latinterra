<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Estos campos ya viven en `personas` (ver migraciones anteriores). Se
 * mantienen en `users` solo "dni" y "name": son copias sincronizadas (ver
 * App\Models\User) que hacen falta para el login por DNI (Auth::attempt
 * necesita una columna real en la tabla del modelo) y para listados/orden
 * rapido sin tener que unir con personas en cada consulta.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Las FK necesitan soltarse antes de poder borrar su columna.
            $table->dropConstrainedForeignId('distrito_id');
            $table->dropConstrainedForeignId('pais_id');
            $table->dropColumn([
                'document_type',
                'last_name',
                'gender',
                'birth_date',
                'phone',
                'address',
                'ciudad_extranjero',
                'avatar',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('document_type', 30)->nullable();
            $table->string('last_name')->nullable();
            $table->string('gender', 10)->nullable();
            $table->date('birth_date')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('address')->nullable();
            $table->foreignId('distrito_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('pais_id')->nullable()->constrained('paises')->nullOnDelete();
            $table->string('ciudad_extranjero', 120)->nullable();
            $table->string('avatar')->nullable();
        });
    }
};
