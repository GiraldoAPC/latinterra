<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonMaterialView extends Model
{
    use HasFactory;

    protected $fillable = ['enrollment_id', 'course_lesson_material_id', 'opened_at', 'confirmed_at', 'reading_state'];

    protected $hidden = ['reading_state'];

    protected $casts = [
        'opened_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'reading_state' => 'array',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(CourseLessonMaterial::class, 'course_lesson_material_id');
    }
}
