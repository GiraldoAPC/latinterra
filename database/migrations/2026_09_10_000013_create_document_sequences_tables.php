<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Correlativos independientes para boleta/factura simuladas (serie B001-/
 * F001-), separados del contador de ticket interno (receipt_sequence) -
 * cada tipo de documento numera desde su propia serie, como en un
 * comprobante real, aunque estos no tengan validez tributaria ante SUNAT.
 * Mismo patron que receipt_sequence: el id autoincremental es el
 * correlativo, sin condiciones de carrera.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boleta_sequence', function (Blueprint $table) {
            $table->id();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('factura_sequence', function (Blueprint $table) {
            $table->id();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boleta_sequence');
        Schema::dropIfExists('factura_sequence');
    }
};
