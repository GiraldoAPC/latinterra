<?php

namespace App\Models\Aula;

use App\Models\User;
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

    public function installments(): HasMany
    {
        return $this->hasMany(CourseInstallment::class);
    }

    /**
     * True si el curso exige pago al dia (payment_required) y este
     * estudiante tiene alguna cuota (matricula o mensualidad) vencida sin
     * pagar. Se usa para bloquear el acceso a las clases.
     */
    public function hasBlockingDebt(): bool
    {
        if (!$this->course->payment_required) {
            return false;
        }

        return $this->installments()
            ->where('status', 'pending')
            ->whereDate('due_date', '<=', now()->toDateString())
            ->exists();
    }

    /**
     * True si el curso tiene un plazo de acceso configurado
     * (access_duration_days), el estudiante todavia no termino, y ya paso
     * ese plazo desde que se matriculo.
     */
    public function isAccessExpired(): bool
    {
        if (!$this->course->access_duration_days || $this->isTrulyCompleted()) {
            return false;
        }

        return now()->greaterThan($this->created_at->addDays($this->course->access_duration_days));
    }

    public function progressPercent(): int
    {
        if ($this->isTrulyCompleted()) {
            return 100;
        }

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

    /** Completion is permanent; later content edits do not reopen a certified course. */
    public function isTrulyCompleted(): bool
    {
        return $this->status === 'completed' || $this->certificate()->exists();
    }

    public function bestExamAttempt(?int $examId = null): ?ExamAttempt
    {
        return $this->examAttempts()
            ->when($examId, fn ($q) => $q->where('exam_id', $examId))
            ->orderByDesc('score')
            ->first();
    }

    public function hasPassedExam(int $examId): bool
    {
        return $this->examAttempts()->where('exam_id', $examId)->where('passed', true)->exists();
    }

    /**
     * True si aprobo el quiz de cada modulo que tiene uno configurado (los
     * modulos sin quiz no cuentan). No hay examen final de curso aparte -
     * ver checklist de requerimientos, Examenes - el curso se certifica
     * solo con esto.
     */
    public function allModuleQuizzesPassed(): bool
    {
        return $this->course->modules
            ->filter(fn (CourseModule $m) => $m->exam && $m->exam->questions->count() > 0)
            ->every(fn (CourseModule $m) => $this->hasPassedExam($m->exam->id));
    }

    public function isReadyToCertify(): bool
    {
        return $this->allLessonsCompleted() && $this->allModuleQuizzesPassed();
    }
}
