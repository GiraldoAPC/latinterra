<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id(); $table->string('code', 24)->unique();
            $table->string('buyer_name', 180); $table->string('buyer_document', 30)->nullable();
            $table->date('valid_until')->nullable(); $table->string('status', 20)->default('draft');
            $table->json('items'); $table->decimal('amount', 10, 2); $table->text('notes')->nullable();
            $table->foreignId('registered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->foreignId('other_payment_id')->nullable()->unique()->constrained()->restrictOnDelete();
            $table->timestamps();
        });
        Schema::create('stock_sponsorships', function (Blueprint $table) {
            $table->id(); $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->string('product_name', 180); $table->string('recipient', 180);
            $table->string('source', 20); $table->unsignedInteger('quantity');
            $table->decimal('unit_cost', 10, 2); $table->decimal('total_cost', 10, 2);
            $table->text('notes'); $table->uuid('request_key')->unique();
            $table->foreignId('registered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_sponsorships');
        Schema::dropIfExists('quotes');
    }
};
