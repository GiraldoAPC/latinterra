<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Clientes con RUC para venderles con factura (simulada) - distinto de un
 * estudiante: una empresa/negocio, no una persona natural en un curso.
 * Se registran al vuelo la primera vez que se les factura, y despues se
 * buscan/reutilizan desde el mismo selector.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('ruc', 11)->unique();
            $table->string('business_name', 180);
            $table->string('address', 255)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email', 180)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
