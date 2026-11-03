<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL schema changes may persist if a later CREATE TABLE fails.
        if (!Schema::hasColumn('in_person_participants', 'score')) {
            Schema::table('in_person_participants', function (Blueprint $table) {
                $table->decimal('score', 5, 2)->nullable();
                $table->boolean('attendance_confirmed')->default(false);
                $table->timestamp('assessed_at')->nullable();
                $table->foreignId('assessed_by')->nullable()->constrained('users')->nullOnDelete();
            });
        }
        Schema::create('in_person_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('in_person_participant_id')->unique()->constrained()->restrictOnDelete();
            $table->string('code')->unique();
            $table->string('student_name');
            $table->string('document_type', 20);
            $table->string('document_number', 20);
            $table->string('course_title');
            $table->decimal('final_score', 5, 2);
            $table->json('signatories');
            $table->dateTime('issued_at');
            $table->dateTime('expires_at');
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('in_person_certificates');
        Schema::table('in_person_participants', function (Blueprint $table) {
            $table->dropForeign(['assessed_by']);
            $table->dropColumn(['score', 'attendance_confirmed', 'assessed_at', 'assessed_by']);
        });
    }
};
