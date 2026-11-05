<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('course_lesson_materials', function (Blueprint $table) {
            $table->unsignedInteger('pdf_page_count')->nullable();
            $table->string('pdf_checksum', 64)->nullable();
        });
        Schema::table('lesson_material_views', fn (Blueprint $table) => $table->json('reading_state')->nullable());
    }

    public function down(): void
    {
        Schema::table('lesson_material_views', fn (Blueprint $table) => $table->dropColumn('reading_state'));
        Schema::table('course_lesson_materials', fn (Blueprint $table) => $table->dropColumn(['pdf_page_count', 'pdf_checksum']));
    }
};
