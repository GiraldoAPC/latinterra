<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('in_person_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->string('location');
            $table->dateTime('starts_at');
            $table->unsignedInteger('capacity');
            $table->string('registration_token', 64)->unique();
            $table->boolean('registration_open')->default(true);
            $table->dateTime('registration_closes_at')->nullable();
            $table->timestamps();
        });
        Schema::create('in_person_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('in_person_session_id')->constrained()->cascadeOnDelete();
            $table->string('document_type', 20);
            $table->string('document_number', 20);
            $table->string('name', 150);
            $table->string('last_name', 150);
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->timestamps();
            $table->unique(['in_person_session_id', 'document_type', 'document_number'], 'in_person_participant_document_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('in_person_participants');
        Schema::dropIfExists('in_person_sessions');
    }
};
