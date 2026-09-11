<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Catalogo de ubicacion geografica de Peru (Departamento > Provincia >
 * Distrito), para reemplazar el campo de texto libre "Distrito" por
 * selects en cascada con datos reales. Se llena con UbigeoSeeder a partir
 * de database/data/ubigeo/*.json.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departamentos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 60);
        });

        Schema::create('provincias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('departamento_id')->constrained()->cascadeOnDelete();
            $table->string('nombre', 80);
        });

        Schema::create('distritos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provincia_id')->constrained()->cascadeOnDelete();
            $table->string('nombre', 80);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('distritos');
        Schema::dropIfExists('provincias');
        Schema::dropIfExists('departamentos');
    }
};
