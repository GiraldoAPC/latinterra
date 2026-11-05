<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonProgress extends Model
{
    use HasFactory;

    protected $fillable = ['enrollment_id', 'course_lesson_id', 'completed_at', 'video_watched_at',
        'video_tracking_token', 'video_tracking_video_id', 'video_tracking_duration', 'video_position_ms', 'video_last_ping_ms', 'video_is_playing'];
    protected $hidden = ['video_tracking_token'];

    protected $casts = [
        'completed_at' => 'datetime',
        'video_watched_at' => 'datetime',
        'video_tracking_duration' => 'integer',
        'video_position_ms' => 'integer',
        'video_last_ping_ms' => 'integer',
        'video_is_playing' => 'boolean',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(CourseLesson::class, 'course_lesson_id');
    }
}
