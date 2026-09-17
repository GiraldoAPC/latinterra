<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Distingue si el pedido de curso (pago unico) vino de la auto-inscripcion
 * del estudiante en linea, o de que un admin lo inscribio desde el panel.
 * Solo los de origen "online" necesitan pasar por la cola de "Pedidos de
 * cursos" para que un admin confirme el pago - si el admin ya lo inscribio
 * el mismo, registra el pago directo desde el perfil del estudiante.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_orders', function (Blueprint $table) {
            $table->string('source', 20)->default('online')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('course_orders', function (Blueprint $table) {
            $table->dropColumn('source');
        });
    }
};
