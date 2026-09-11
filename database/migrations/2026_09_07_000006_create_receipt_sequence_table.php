<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla auxiliar para generar un correlativo unico de "ticket interno"
 * (LT-000001, LT-000002...) compartido por TODOS los tipos de pago
 * (cuotas de curso, ventas de producto, etc.) - una fila insertada aca por
 * cada ticket emitido; el id autoincremental de MySQL es el correlativo,
 * sin condiciones de carrera (a diferencia de contar filas existentes).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receipt_sequence', function (Blueprint $table) {
            $table->id();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipt_sequence');
    }
};
