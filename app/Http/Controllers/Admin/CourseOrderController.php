<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula\CourseOrder;
use App\Models\Aula\Enrollment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pedidos de cursos de pago unico (no matricula+mensualidad, esos se
 * inscriben de una vez - ver StudentController::enrollInCourse). Mientras
 * no haya pasarela de pago integrada, el admin confirma manualmente aca
 * que el pago llego y recien ahi se activa el acceso del estudiante.
 */
class CourseOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = CourseOrder::with(['user:id,name,persona_id,email', 'user.persona:id,last_name', 'course:id,title'])
            ->where('source', 'online')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (CourseOrder $o) => [
                'id' => $o->id,
                'student' => [
                    'id' => $o->user->id,
                    'name' => trim(($o->user->last_name ? $o->user->last_name . ' ' : '') . $o->user->name),
                ],
                'course_title' => $o->course->title,
                'amount' => $o->amount,
                'status' => $o->status,
                'payment_method' => $o->payment_method,
                'payment_reference' => $o->payment_reference,
                'created_at' => $o->created_at,
                'paid_at' => $o->paid_at,
            ]);

        return Inertia::render('Admin/Ventas/Pedidos', [
            'orders' => $orders,
            'filters' => ['status' => $request->status],
            'stats' => [
                'pending' => CourseOrder::where('source', 'online')->where('status', 'pending')->count(),
                'paid' => CourseOrder::where('source', 'online')->where('status', 'paid')->count(),
                'rejected' => CourseOrder::where('source', 'online')->where('status', 'rejected')->count(),
            ],
        ]);
    }

    /** Confirma el pago: activa (o crea) la inscripcion del estudiante. */
    public function confirm(Request $request, CourseOrder $order): RedirectResponse
    {
        $data = $request->validate([
            'payment_method' => ['nullable', 'string', 'max:60'],
            'payment_reference' => ['nullable', 'string', 'max:120'],
        ]);

        $order->update($data + ['status' => 'paid', 'paid_at' => now()]);

        Enrollment::firstOrCreate(
            ['user_id' => $order->user_id, 'course_id' => $order->course_id],
            ['status' => 'active']
        );

        return back()->with('success', 'Pago confirmado. El estudiante ya tiene acceso al curso.');
    }

    public function reject(CourseOrder $order): RedirectResponse
    {
        $order->update(['status' => 'rejected']);

        return back()->with('success', 'Pedido rechazado.');
    }

    /**
     * Caso especial: el curso es de pago unico, pero un estudiante puntual
     * pidio pagar en partes (hasta 3 cuotas con fecha propia, no el
     * cronograma automatico de matricula+mensualidad). El pedido original
     * queda marcado "split" y se reemplaza por cuotas (CourseInstallment)
     * en la inscripcion del estudiante, que recien ahora se crea/activa.
     */
    public function splitIntoInstallments(Request $request, CourseOrder $order): RedirectResponse
    {
        abort_unless($order->status === 'pending', 422, 'Este pedido ya no esta pendiente.');

        $data = $request->validate([
            'installments' => ['required', 'array', 'min:2', 'max:3'],
            'installments.*.amount' => ['required', 'numeric', 'min:0.01'],
            'installments.*.due_date' => ['required', 'date'],
        ]);

        $sum = round(collect($data['installments'])->sum('amount'), 2);
        if ($sum !== round((float) $order->amount, 2)) {
            return back()->withErrors(['installments' => "La suma de las cuotas (S/ {$sum}) debe ser igual al monto del pedido (S/ {$order->amount})."]);
        }

        DB::transaction(function () use ($order, $data) {
            $enrollment = Enrollment::firstOrCreate(
                ['user_id' => $order->user_id, 'course_id' => $order->course_id],
                ['status' => 'active']
            );

            foreach ($data['installments'] as $i => $installment) {
                $enrollment->installments()->create([
                    'type' => 'cuota',
                    'installment_number' => $i + 1,
                    'amount' => $installment['amount'],
                    'due_date' => $installment['due_date'],
                    'status' => 'pending',
                ]);
            }

            $order->update(['status' => 'split']);
        });

        return back()->with('success', 'Pago dividido en cuotas. El estudiante ya tiene acceso al curso.');
    }
}
