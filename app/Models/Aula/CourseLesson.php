<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseLesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_module_id',
        'title',
        'description',
        'youtube_video_id',
        'duration_seconds',
        'position',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class, 'course_module_id');
    }

    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(CourseLessonMaterial::class)->orderBy('created_at');
    }
}
