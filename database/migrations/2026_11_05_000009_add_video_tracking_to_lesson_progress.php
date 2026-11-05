<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('lesson_progress', function (Blueprint $table) {
            $table->uuid('video_tracking_token')->nullable();
            $table->string('video_tracking_video_id', 50)->nullable();
            $table->unsignedInteger('video_tracking_duration')->default(0);
            $table->unsignedBigInteger('video_position_ms')->default(0);
            $table->unsignedBigInteger('video_last_ping_ms')->nullable();
            $table->boolean('video_is_playing')->default(false);
        });
    }
    public function down(): void
    {
        Schema::table('lesson_progress', fn (Blueprint $table) => $table->dropColumn([
            'video_tracking_token', 'video_tracking_video_id', 'video_tracking_duration',
            'video_position_ms', 'video_last_ping_ms', 'video_is_playing',
        ]));
    }
};
