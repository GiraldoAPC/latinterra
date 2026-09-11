<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paises', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 2)->unique(); // ISO 3166-1 alpha-2
            $table->string('nombre', 80);
        });

        Schema::table('users', function (Blueprint $table) {
            // Nullable + default implicito "PE" a nivel app (no de columna,
            // para no forzar un pais en registros que no lo necesiten,
            // ej. admins). "ciudad_extranjero" solo se usa cuando el pais
            // no es Peru (ahi "distrito_id" queda null).
            $table->foreignId('pais_id')->nullable()->after('distrito_id')->constrained('paises')->nullOnDelete();
            $table->string('ciudad_extranjero', 120)->nullable()->after('pais_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pais_id');
            $table->dropColumn('ciudad_extranjero');
        });
        Schema::dropIfExists('paises');
    }
};
