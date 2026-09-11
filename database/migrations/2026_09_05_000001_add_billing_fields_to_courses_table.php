<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // 'unico': un solo cobro (usa la columna "price" que ya existia).
            // 'matricula_mensualidad': matricula de inscripcion + cuotas mensuales.
            $table->string('billing_type', 30)->default('unico')->after('is_free');
            $table->decimal('enrollment_fee', 10, 2)->nullable()->after('billing_type');
            $table->decimal('monthly_fee', 10, 2)->nullable()->after('enrollment_fee');
            $table->unsignedTinyInteger('duration_months')->nullable()->after('monthly_fee');
            // Si es true, el estudiante no puede ver las clases mientras
            // tenga una cuota vencida sin pagar. Si es false, queda
            // inscrito y puede avanzar aunque deba (pago informativo).
            $table->boolean('payment_required')->default(true)->after('duration_months');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['billing_type', 'enrollment_fee', 'monthly_fee', 'duration_months', 'payment_required']);
        });
    }
};
