<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CourseLessonMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_lesson_id',
        'title',
        'file_path',
        'original_name',
        'mime_type',
        'size',
    ];

    protected $appends = ['url'];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(CourseLesson::class, 'course_lesson_id');
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }
}
