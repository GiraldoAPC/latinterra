<?php

namespace App\Models\Aula;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Convalidacion manual de un curso: un admin certifico presencialmente que
 * el certificado externo del estudiante equivale a este curso nuestro (ver
 * Course::prerequisiteSatisfiedBy()).
 */
class CourseEquivalency extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'course_id', 'issuing_institution', 'note', 'file_path', 'score', 'granted_by'];

    protected $casts = [
        'score' => 'decimal:2',
    ];

    protected $appends = ['file_url'];

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? '/storage/' . ltrim($this->file_path, '/') : null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function grantedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
    }
}
