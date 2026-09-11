<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Registrado por administracion
            $table->string('dni', 20)->nullable()->unique()->after('phone');
            $table->string('company')->nullable()->after('dni');
            $table->string('position')->nullable()->after('company');
            $table->boolean('is_active')->default(true)->after('role');

            // Completado por el propio estudiante
            $table->date('birth_date')->nullable()->after('position');
            $table->string('address')->nullable()->after('birth_date');
            $table->string('emergency_contact_name')->nullable()->after('address');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
            $table->string('blood_type', 5)->nullable()->after('emergency_contact_phone');
            $table->text('medical_conditions')->nullable()->after('blood_type');
            $table->string('sctr_status')->nullable()->after('medical_conditions'); // vigente|no_vigente|no_aplica
            $table->date('sctr_expires_at')->nullable()->after('sctr_status');
            $table->text('previous_experience')->nullable()->after('sctr_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'dni',
                'company',
                'position',
                'is_active',
                'birth_date',
                'address',
                'emergency_contact_name',
                'emergency_contact_phone',
                'blood_type',
                'medical_conditions',
                'sctr_status',
                'sctr_expires_at',
                'previous_experience',
            ]);
        });
    }
};
