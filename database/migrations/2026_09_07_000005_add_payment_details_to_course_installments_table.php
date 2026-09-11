<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Detalle de como se registro el pago de una cuota (metodo, referencia de
 * operacion) + un codigo correlativo para el "ticket" interno imprimible
 * que el admin puede generar despues de marcarla pagada.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_installments', function (Blueprint $table) {
            $table->string('payment_method', 60)->nullable()->after('paid_at');
            $table->string('payment_reference', 120)->nullable()->after('payment_method');
            $table->string('receipt_code', 20)->nullable()->unique()->after('payment_reference');
        });
    }

    public function down(): void
    {
        Schema::table('course_installments', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'payment_reference', 'receipt_code']);
        });
    }
};
