<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * El comprobante que el PROVEEDOR entrega por esa compra (factura, boleta,
 * guia de remision...) - distinto de App\Support\DocumentNumber, que es lo
 * que NOSOTROS emitimos al vender. Aca solo se guarda como referencia lo
 * que ya trae el documento del proveedor, no se genera ningun numero.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_purchases', function (Blueprint $table) {
            $table->string('document_type', 30)->nullable()->after('supplier_id');
            $table->string('document_number', 60)->nullable()->after('document_type');
        });
    }

    public function down(): void
    {
        Schema::table('stock_purchases', function (Blueprint $table) {
            $table->dropColumn(['document_type', 'document_number']);
        });
    }
};
