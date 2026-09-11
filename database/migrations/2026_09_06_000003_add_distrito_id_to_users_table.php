<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // "district" (texto libre) se mantiene para no romper pantallas
            // que ya lo muestran (tabla, perfil, CSV) - a partir de ahora se
            // llena automaticamente con el nombre del distrito elegido acá.
            $table->foreignId('distrito_id')->nullable()->after('district')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('distrito_id');
        });
    }
};
