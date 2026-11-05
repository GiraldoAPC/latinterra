<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->text('certificate_content')->nullable();
            $table->decimal('certificate_duration_hours', 6, 2)->nullable();
        });
        foreach (['certificates', 'in_person_certificates'] as $name) {
            if (Schema::hasTable($name)) Schema::table($name, fn (Blueprint $table) => $table->json('course_details')->nullable());
        }
    }

    public function down(): void
    {
        foreach (['certificates', 'in_person_certificates'] as $name) {
            if (Schema::hasTable($name)) Schema::table($name, fn (Blueprint $table) => $table->dropColumn('course_details'));
        }
        Schema::table('courses', fn (Blueprint $table) => $table->dropColumn(['certificate_content', 'certificate_duration_hours']));
    }
};
