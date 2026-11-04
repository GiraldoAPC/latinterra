<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->unsignedSmallInteger('max_attempts')->default(6);
            $table->unsignedSmallInteger('question_limit')->default(20);
            $table->unsignedSmallInteger('duration_minutes')->default(20);
        });
        Schema::create('module_exam_sessions', function (Blueprint $table) {
            $table->id(); $table->uuid('token')->unique();
            $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->json('questions'); $table->json('saved_answers')->nullable();
            $table->dateTime('started_at'); $table->dateTime('expires_at'); $table->dateTime('completed_at')->nullable();
            $table->foreignId('exam_attempt_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->timestamps(); $table->index(['enrollment_id', 'exam_id', 'completed_at'], 'module_exam_session_pending');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_exam_sessions');
        Schema::table('exams', fn (Blueprint $table) => $table->dropColumn(['max_attempts', 'question_limit', 'duration_minutes']));
    }
};
