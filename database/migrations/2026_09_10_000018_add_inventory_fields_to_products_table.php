<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Atributos de inventario "a nivel profesional": categoria/marca (FK a
 * catalogos propios), color/talla libres, codigo de barras (distinto del
 * sku: puede ser el mismo si se imprime etiqueta propia, o un EAN/UPC de
 * fabrica) y el costo promedio ponderado, que se recalcula en cada compra
 * (ver Product::registerPurchase) - nunca se edita a mano.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->foreignId('brand_id')->nullable()->after('category_id')->constrained()->nullOnDelete();
            $table->string('color')->nullable()->after('sku');
            $table->string('size')->nullable()->after('color');
            $table->string('barcode', 64)->nullable()->unique()->after('sku');
            $table->decimal('avg_cost', 10, 2)->nullable()->after('stock');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
            $table->dropConstrainedForeignId('brand_id');
            $table->dropColumn(['color', 'size', 'barcode', 'avg_cost']);
        });
    }
};
