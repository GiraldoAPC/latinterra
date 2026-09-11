<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Persona natural (con negocio, RUC 10...) o juridica (empresa, RUC 20...). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('type', 10)->default('juridica')->after('id');
            $table->string('dni', 15)->nullable()->after('ruc');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['type', 'dni']);
        });
    }
};
