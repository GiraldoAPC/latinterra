<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula\CourseInstallment;
use App\Models\Aula\Enrollment;
use App\Models\SelectOption;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Documentos imprimibles del estudiante (ficha de matricula, record de
 * notas). Se renderizan como paginas normales con CSS de impresion (igual
 * patron que Aula/Certificado.jsx) en vez de generar PDF en el backend -
 * el navegador ya resuelve "Guardar como PDF" sin agregar una dependencia
 * nueva (dompdf) solo para esto.
 */
class StudentReportController extends Controller
{
    public function matricula(User $student, Enrollment $enrollment): Response
    {
        abort_unless($student->role === 'student', 404);
        abort_unless($enrollment->user_id === $student->id, 404);

        $enrollment->load('course');
        $student->load('persona.pais');

        return Inertia::render('Admin/Students/FichaMatricula', [
            'student' => array_merge($student->toArray(), [
                'pais_nombre' => $student->persona?->pais?->nombre,
            ]),
            'enrollment' => $enrollment,
            'documentTypes' => SelectOption::optionsFor('document_type'),
            'genderOptions' => SelectOption::optionsFor('gender'),
        ]);
    }

    public function notas(User $student, Enrollment $enrollment): Response
    {
        abort_unless($student->role === 'student', 404);
        abort_unless($enrollment->user_id === $student->id, 404);

        $enrollment->load('course.modules.exam', 'course.exam');

        $modules = $enrollment->course->modules->map(function ($module) use ($enrollment) {
            $exam = $module->exam;
            $attempt = $exam ? $enrollment->bestExamAttempt($exam->id) : null;

            return [
                'title' => $module->title,
                'has_exam' => (bool) $exam,
                'score' => $attempt?->score,
                'passed' => $attempt?->passed,
                'submitted_at' => $attempt?->submitted_at,
            ];
        });

        $finalExam = $enrollment->course->exam;
        $finalAttempt = $finalExam ? $enrollment->bestExamAttempt($finalExam->id) : null;

        return Inertia::render('Admin/Students/RecordNotas', [
            'student' => $student,
            'enrollment' => [
                'id' => $enrollment->id,
                'course' => ['title' => $enrollment->course->title],
                'created_at' => $enrollment->created_at,
                'status' => $enrollment->isTrulyCompleted() ? 'completed' : 'active',
                'progress' => $enrollment->progressPercent(),
            ],
            'modules' => $modules,
            'finalExam' => $finalExam ? [
                'score' => $finalAttempt?->score,
                'passed' => $finalAttempt?->passed,
                'submitted_at' => $finalAttempt?->submitted_at,
                'passing_score' => $enrollment->course->passing_score,
            ] : null,
        ]);
    }

    /** Ticket interno (no es comprobante tributario) del pago de una cuota. */
    public function reciboPago(User $student, CourseInstallment $installment): Response
    {
        [$studentData, $installmentData] = $this->ticketData($student, $installment);

        return Inertia::render('Admin/Students/ReciboPago', [
            'student' => $studentData,
            'installment' => $installmentData,
        ]);
    }

    /** Mismo ticket que reciboPago() pero como JSON, para mostrarlo en un modal sin navegar. */
    public function reciboPagoDatos(User $student, CourseInstallment $installment): \Illuminate\Http\JsonResponse
    {
        [$studentData, $installmentData] = $this->ticketData($student, $installment);

        return response()->json(['student' => $studentData, 'installment' => $installmentData]);
    }

    private function ticketData(User $student, CourseInstallment $installment): array
    {
        abort_unless($student->role === 'student', 404);
        abort_unless($installment->enrollment->user_id === $student->id, 404);
        abort_unless($installment->status === 'paid', 404);

        $installment->load('enrollment.course');
        $student->load('persona.pais', 'persona.distrito');

        return [
            array_merge($student->toArray(), [
                'pais_nombre' => $student->persona?->pais?->nombre,
            ]),
            [
                'id' => $installment->id,
                'type' => $installment->type,
                'installment_number' => $installment->installment_number,
                'amount' => $installment->amount,
                'due_date' => $installment->due_date,
                'paid_at' => $installment->paid_at,
                'payment_method' => $installment->payment_method,
                'payment_reference' => $installment->payment_reference,
                'receipt_code' => $installment->receipt_code,
                'document_type' => $installment->document_type ?? 'ticket',
                'buyer_ruc' => $installment->buyer_ruc,
                'buyer_business_name' => $installment->buyer_business_name,
                'course_title' => $installment->enrollment->course->title,
            ],
        ];
    }
}
