<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->string('buyer_email')->nullable();
            $table->string('emailed_to')->nullable();
            $table->dateTime('emailed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('quotes', fn (Blueprint $table) => $table->dropColumn(['buyer_email', 'emailed_to', 'emailed_at']));
    }
};
