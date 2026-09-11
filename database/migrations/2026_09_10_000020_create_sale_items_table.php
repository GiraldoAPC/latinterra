<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Renglones estructurados de una venta de producto (OtherPayment hoy solo
 * guarda un texto libre en "description" con el detalle) - guarda el costo
 * promedio del producto al momento de la venta (snapshot) para poder medir
 * utilidad por venta a futuro, sin depender de que avg_cost siga igual.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('other_payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name', 180);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->unsignedInteger('qty');
            $table->string('serial')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};
