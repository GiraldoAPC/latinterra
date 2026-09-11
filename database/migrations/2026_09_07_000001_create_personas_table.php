<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * "Persona" es la identidad compartida entre todos los tipos de gente que
 * gestiona el sistema: Estudiante, Docente/Instructor, Personal,
 * Administrativo. Los datos de cuenta (login, rol, extras propios de cada
 * tipo) se quedan en `users`; lo que es "quien es esta persona" vive aca,
 * una sola vez, aunque despues tenga varios roles.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personas', function (Blueprint $table) {
            $table->id();
            $table->string('document_type', 30)->nullable();
            $table->string('dni', 20)->nullable()->unique();
            $table->string('name');
            $table->string('last_name')->nullable();
            $table->string('gender', 10)->nullable();
            $table->date('birth_date')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('address')->nullable();
            $table->foreignId('distrito_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('pais_id')->nullable()->constrained('paises')->nullOnDelete();
            $table->string('ciudad_extranjero', 120)->nullable();
            $table->string('avatar')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personas');
    }
};
