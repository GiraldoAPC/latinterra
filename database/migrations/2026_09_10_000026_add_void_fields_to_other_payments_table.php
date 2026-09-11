<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Anular una venta/pago: no se borra (el numero de ticket ya emitido nunca
 * se libera, mismo principio que el resto del sistema), solo se marca. Si
 * era una venta de producto, anularla devuelve el stock vendido.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('other_payments', function (Blueprint $table) {
            $table->timestamp('voided_at')->nullable()->after('paid_at');
            $table->foreignId('voided_by')->nullable()->after('voided_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('other_payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('voided_by');
            $table->dropColumn('voided_at');
        });
    }
};
