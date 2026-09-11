<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Transferencia de Almacen a Ventas (unica direccion que existe por ahora
 * - reponer el area de ventas desde el almacen). No hace falta una tabla
 * de "ubicaciones" generica: son solo 2 roles fijos, ya representados por
 * products.stock_warehouse y products.stock.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained();
            $table->unsignedInteger('quantity');
            $table->text('notes')->nullable();
            $table->foreignId('registered_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_transfers');
    }
};
