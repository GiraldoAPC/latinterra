<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Catalogo generico para los selects fijos del sistema (tipo de
     * documento, genero, estado SCTR, y los que se agreguen despues) que
     * antes estaban hardcodeados en el frontend/backend. `group` distingue
     * a que select pertenece cada fila; `code` es el valor guardado en la
     * columna real (ej. users.document_type, users.gender).
     */
    public function up(): void
    {
        Schema::create('select_options', function (Blueprint $table) {
            $table->id();
            $table->string('group', 40); // 'document_type', 'gender', 'sctr_status', ...
            $table->string('code', 40);
            $table->string('label', 80);
            $table->string('pattern', 120)->nullable(); // solo usado por document_type
            $table->string('error_message', 180)->nullable(); // idem
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['group', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('select_options');
    }
};
