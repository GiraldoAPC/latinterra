<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Convalidacion manual: el estudiante curso o certifico ese contenido en
 * otra institucion y un admin verifico presencialmente que es equivalente
 * (ver checklist de requerimientos - Aula Virtual, audio 2 y 3). No hay
 * carga de archivo por plataforma: el admin registra la convalidacion aca
 * despues de validar el certificado en persona.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_equivalencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->text('note')->nullable();
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_equivalencies');
    }
};
