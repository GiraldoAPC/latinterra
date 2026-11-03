<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = ['course_id', 'course_module_id', 'course_lesson_id', 'title', 'passing_score'];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function courseModule(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class, 'course_module_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(CourseLesson::class, 'course_lesson_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(ExamQuestion::class)->orderBy('position');
    }

    public function isModuleQuiz(): bool
    {
        return $this->course_module_id !== null;
    }

    public function isLessonQuiz(): bool
    {
        return $this->course_lesson_id !== null;
    }
}
