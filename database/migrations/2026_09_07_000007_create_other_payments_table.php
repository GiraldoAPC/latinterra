<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pagos ajenos a un curso (venta de productos/EPP, u otro concepto suelto)
 * - separado a proposito de course_installments/course_orders, que estan
 * atados a un Enrollment y no deberian cargar con conceptos que no son de
 * curso. El comprador puede ser un estudiante/usuario existente o alguien
 * sin cuenta en el sistema (solo se guarda su nombre).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('other_payments', function (Blueprint $table) {
            $table->id();
            $table->string('type', 20); // 'producto' | 'otro'
            $table->string('concept', 180);
            $table->text('description')->nullable();
            $table->decimal('amount', 10, 2);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('buyer_name', 180)->nullable();
            $table->string('payment_method', 60);
            $table->string('payment_reference', 120)->nullable();
            $table->string('receipt_code', 20)->unique();
            $table->foreignId('registered_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('paid_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('other_payments');
    }
};
