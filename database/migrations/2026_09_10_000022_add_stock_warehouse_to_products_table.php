<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Stock en almacen, separado del stock "vendible" (columna `stock`, sin
 * cambios de significado). Solo se usa cuando el ajuste "warehouse_mode"
 * esta activo (ver Setting/Product::registerPurchase) - una empresa que
 * vende directo de almacen/compra nunca toca esta columna.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('stock_warehouse')->nullable()->after('stock');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('stock_warehouse');
        });
    }
};
