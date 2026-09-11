<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Clasificacion del tipo de documento con el que se registra el pago
 * (ticket interno / boleta / factura). Por ahora es solo referencial: no
 * hay integracion con un OSE/PSE de SUNAT, asi que boleta/factura generan
 * el mismo ticket con el formato y desglose de IGV correspondiente pero
 * marcado como documento sin validez tributaria - igual que el ticket
 * interno actual.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('other_payments', function (Blueprint $table) {
            $table->string('document_type', 20)->default('ticket')->after('type');
            $table->string('buyer_ruc', 11)->nullable()->after('buyer_name');
            $table->string('buyer_business_name', 180)->nullable()->after('buyer_ruc');
        });
    }

    public function down(): void
    {
        Schema::table('other_payments', function (Blueprint $table) {
            $table->dropColumn(['document_type', 'buyer_ruc', 'buyer_business_name']);
        });
    }
};
