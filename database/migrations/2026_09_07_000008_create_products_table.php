<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Catalogo simple de productos (EPP, herramientas, etc.) para poder
 * venderselos a un estudiante desde su perfil (buscar + agregar al
 * carrito) sin tener que escribir el concepto a mano cada vez. El control
 * de stock es opcional (null = no se lleva stock de ese producto).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name', 180);
            $table->string('sku', 60)->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('stock')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
