<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cuotas de un estudiante inscrito: la matricula (una vez) y las
     * mensualidades (una por mes segun course.duration_months). Separado
     * de course_orders porque una orden es "quiero inscribirme" (antes de
     * tener acceso); una cuota es "debo este pago" ya estando inscrito.
     */
    public function up(): void
    {
        Schema::create('course_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20); // 'matricula' | 'mensualidad'
            $table->unsignedTinyInteger('installment_number')->nullable(); // 1..N para mensualidad
            $table->decimal('amount', 10, 2);
            $table->date('due_date');
            $table->string('status', 20)->default('pending'); // pending | paid
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_installments');
    }
};
