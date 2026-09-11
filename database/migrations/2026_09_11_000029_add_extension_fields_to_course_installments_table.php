<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ampliacion de plazo de una cuota vencida, a criterio del admin, maximo
 * una vez por cuota (ver CourseInstallment::extendDueDate()).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_installments', function (Blueprint $table) {
            $table->date('original_due_date')->nullable()->after('due_date');
            $table->timestamp('due_date_extended_at')->nullable()->after('original_due_date');
        });
    }

    public function down(): void
    {
        Schema::table('course_installments', function (Blueprint $table) {
            $table->dropColumn(['original_due_date', 'due_date_extended_at']);
        });
    }
};
