<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    /**
     * URL relativa (sin dominio) a proposito: el sitio se sirve tanto en
     * latin-terra.com como en cursos.accesoverticalperu.com, y el visor de
     * PDF propio (pdf.js) hace fetch() del archivo - si la URL viniera fija
     * con el dominio de APP_URL, un visitante en el otro dominio chocaria
     * con CORS. Relativa, el navegador siempre la resuelve contra el
     * dominio actual (mismo origen, sin problema).
     */
    public function getUrlAttribute(): string
    {
        return '/storage/' . ltrim($this->file_path, '/');
    }
}
