<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_instructors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unique(['course_id', 'user_id']); $table->timestamps();
        });
        Schema::create('user_role_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('previous_role')->nullable(); $table->string('new_role');
            $table->boolean('previous_active')->nullable(); $table->boolean('new_active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_role_changes');
        Schema::dropIfExists('course_instructors');
    }
};
