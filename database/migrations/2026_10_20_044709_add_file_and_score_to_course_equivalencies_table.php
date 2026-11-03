<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_equivalencies', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('note');
            $table->decimal('score', 5, 2)->nullable()->after('file_path');
        });
    }

    public function down(): void
    {
        Schema::table('course_equivalencies', function (Blueprint $table) {
            $table->dropColumn(['file_path', 'score']);
        });
    }
};
