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

    /**
     * True only when the enrollment was marked completed AND the current
     * course content is still 100% finished. If the admin adds new
     * modules/lessons after a student was certified, progress recalculates
     * below 100% and the certificate/completed state must stop showing
     * until the student finishes the new content and re-passes the exam.
     */
    public function isTrulyCompleted(): bool
    {
        return $this->status === 'completed' && $this->allLessonsCompleted();
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
}
