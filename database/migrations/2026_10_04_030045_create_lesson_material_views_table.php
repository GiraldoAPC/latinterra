<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_material_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_lesson_material_id')->constrained()->cascadeOnDelete();
            $table->timestamp('opened_at');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();

            $table->unique(['enrollment_id', 'course_lesson_material_id'], 'lesson_material_views_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_material_views');
    }
};
