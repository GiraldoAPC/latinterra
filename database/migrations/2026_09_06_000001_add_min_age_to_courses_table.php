<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Null = sin restriccion de edad. Ej. 18 para cursos que exigen
            // mayoria de edad (trabajos en altura, riesgo electrico...).
            $table->unsignedTinyInteger('min_age')->nullable()->after('payment_required');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('min_age');
        });
    }
};
