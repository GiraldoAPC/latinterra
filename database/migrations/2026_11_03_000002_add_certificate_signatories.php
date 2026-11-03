<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', fn (Blueprint $table) => $table->json('certificate_signatories')->nullable());
        Schema::table('certificates', fn (Blueprint $table) => $table->json('signatories')->nullable());
    }

    public function down(): void
    {
        Schema::table('certificates', fn (Blueprint $table) => $table->dropColumn('signatories'));
        Schema::table('courses', fn (Blueprint $table) => $table->dropColumn('certificate_signatories'));
    }
};
