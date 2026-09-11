<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CourseModule extends Model
{
    use HasFactory;

    protected $fillable = ['course_id', 'title', 'description', 'position'];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(CourseLesson::class)->orderBy('position');
    }

    public function exam(): HasOne
    {
        return $this->hasOne(Exam::class, 'course_module_id');
    }
}
