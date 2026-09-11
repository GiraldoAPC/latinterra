<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aula\CourseOrder;
use App\Models\Aula\Enrollment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                'pending' => CourseOrder::where('status', 'pending')->count(),
                'paid' => CourseOrder::where('status', 'paid')->count(),
                'rejected' => CourseOrder::where('status', 'rejected')->count(),
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
}
