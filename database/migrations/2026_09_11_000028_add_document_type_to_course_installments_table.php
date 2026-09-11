<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Mismo tipo de comprobante (ticket/boleta/factura simulada) que ya tiene
 * la venta de productos (other_payments), ahora tambien para el pago de
 * cuotas de curso.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_installments', function (Blueprint $table) {
            $table->string('document_type', 20)->nullable()->after('receipt_code');
            $table->foreignId('client_id')->nullable()->after('document_type')->constrained()->nullOnDelete();
            $table->string('buyer_ruc', 11)->nullable()->after('client_id');
            $table->string('buyer_business_name', 180)->nullable()->after('buyer_ruc');
        });
    }

    public function down(): void
    {
        Schema::table('course_installments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('client_id');
            $table->dropColumn(['document_type', 'buyer_ruc', 'buyer_business_name']);
        });
    }
};
