<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'description',
        'thumbnail',
        'price',
        'is_free',
        'is_published',
        'passing_score',
        'billing_type',
        'enrollment_fee',
        'monthly_fee',
        'duration_months',
        'payment_required',
        'min_age',
    ];

    protected $casts = [
        'is_free' => 'boolean',
        'is_published' => 'boolean',
        'price' => 'decimal:2',
        'passing_score' => 'decimal:2',
        'enrollment_fee' => 'decimal:2',
        'monthly_fee' => 'decimal:2',
        'duration_months' => 'integer',
        'payment_required' => 'boolean',
        'min_age' => 'integer',
    ];

    public function modules(): HasMany
    {
        return $this->hasMany(CourseModule::class)->orderBy('position');
    }

    public function lessons(): HasManyThrough
    {
        return $this->hasManyThrough(CourseLesson::class, CourseModule::class);
    }

    public function exam(): HasOne
    {
        return $this->hasOne(Exam::class)->whereNull('course_module_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(CourseOrder::class);
    }

    public function totalLessons(): int
    {
        return $this->lessons()->count();
    }

    /**
     * Genera las cuotas de un estudiante recien inscrito, segun como este
     * configurado el curso: matricula (una vez) y/o mensualidades (una por
     * mes segun duration_months). No genera nada para cursos gratis o de
     * pago unico simple (esos usan CourseOrder, no cuotas).
     */
    public function generateInstallmentsFor(Enrollment $enrollment): void
    {
        if ($this->is_free || $this->billing_type !== 'matricula_mensualidad') {
            return;
        }

        $startDate = $enrollment->created_at ?? now();

        if ((float) $this->enrollment_fee > 0) {
            $enrollment->installments()->create([
                'type' => 'matricula',
                'amount' => $this->enrollment_fee,
                'due_date' => $startDate->toDateString(),
                'status' => 'pending',
            ]);
        }

        if ((float) $this->monthly_fee > 0 && $this->duration_months > 0) {
            for ($i = 1; $i <= $this->duration_months; $i++) {
                $enrollment->installments()->create([
                    'type' => 'mensualidad',
                    'installment_number' => $i,
                    'amount' => $this->monthly_fee,
                    'due_date' => $startDate->copy()->addMonthsNoOverflow($i - 1)->toDateString(),
                    'status' => 'pending',
                ]);
            }
        }
    }
}
