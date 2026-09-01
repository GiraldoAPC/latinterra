<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'course_id', 'status', 'completed_at'];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function examAttempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class);
    }

    public function certificate(): HasOne
    {
        return $this->hasOne(Certificate::class);
    }

    public function progressPercent(): int
    {
        $total = $this->course->totalLessons();
        if ($total === 0) {
            return 0;
        }

        $done = $this->lessonProgress()->whereNotNull('completed_at')->count();

        return (int) round(($done / $total) * 100);
    }

    public function allLessonsCompleted(): bool
    {
        return $this->progressPercent() >= 100;
    }

    public function bestExamAttempt(): ?ExamAttempt
    {
        return $this->examAttempts()->orderByDesc('score')->first();
    }
}
