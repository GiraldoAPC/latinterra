<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bitacora de compras: unico mecanismo que aumenta el stock de un producto
 * (ver Product::registerPurchase). product_id queda RESTRICT a proposito
 * (no nullOnDelete/cascade) - un producto con compras registradas no se
 * puede borrar, solo desactivar (ver ProductController::destroy).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained();
            $table->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('unit_cost', 10, 2);
            $table->unsignedInteger('quantity');
            $table->decimal('total', 10, 2);
            $table->date('purchased_at');
            $table->text('notes')->nullable();
            $table->foreignId('registered_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_purchases');
    }
};
