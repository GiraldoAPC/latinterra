<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('other_payments', function (Blueprint $table) {
            $table->foreignId('client_id')->nullable()->after('buyer_business_name')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('other_payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('client_id');
        });
    }
};
