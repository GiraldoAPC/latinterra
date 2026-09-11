<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Ventas\Client;
use App\Models\Ventas\OtherPayment;
use App\Models\Ventas\Product;
use App\Models\Ventas\SaleItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pagos ajenos a un curso (venta de productos u otro concepto suelto) - ver
 * comentario de OtherPayment/la migracion para el porque de separarlo de
 * course_installments/course_orders.
 */
class OtherPaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));

        $payments = OtherPayment::with('buyer:id,name')
            ->when($request->type, fn ($query, $type) => $query->where('type', $type))
            ->when($q !== '', fn ($query) => $query->where(
                fn ($w) => $w->where('receipt_code', 'like', "%{$q}%")
                    ->orWhere('concept', 'like', "%{$q}%")
                    ->orWhere('buyer_name', 'like', "%{$q}%")
                    ->orWhereHas('buyer', fn ($b) => $b->where('name', 'like', "%{$q}%"))
            ))
            ->orderByDesc('paid_at')
            ->get()
            ->map(fn (OtherPayment $p) => [
                'id' => $p->id,
                'type' => $p->type,
                'concept' => $p->concept,
                'description' => $p->description,
                'amount' => $p->amount,
                'buyer_name' => $p->buyer?->name ?? $p->buyer_name,
                'payment_method' => $p->payment_method,
                'payment_reference' => $p->payment_reference,
                'receipt_code' => $p->receipt_code,
                'paid_at' => $p->paid_at,
                'voided_at' => $p->voided_at,
            ]);

        return Inertia::render('Admin/Ventas/OtrosPagos', [
            'payments' => $payments,
            'filters' => ['type' => $request->type, 'q' => $q],
            'stats' => [
                'total' => OtherPayment::count(),
                'monto_total' => OtherPayment::sum('amount'),
                'producto' => OtherPayment::where('type', 'producto')->count(),
                'otro' => OtherPayment::where('type', 'otro')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', 'in:producto,otro'],
            'concept' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:2000'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'buyer_name' => ['nullable', 'string', 'max:180'],
            'payment_method' => ['required', 'string', 'max:60'],
            'payment_reference' => ['nullable', 'string', 'max:120'],
        ]);

        OtherPayment::register($data + ['registered_by' => Auth::id()]);

        return back()->with('success', 'Pago registrado.');
    }

    /**
     * Anular una venta/pago: no se borra (el numero de ticket ya emitido no
     * se libera, mismo principio que el resto del sistema) - solo se
     * marca. Si tenia productos vinculados, les devuelve el stock vendido.
     */
    public function void(Request $request, OtherPayment $payment): RedirectResponse
    {
        if ($payment->isVoided()) {
            return back()->withErrors(['payment' => 'Esta venta ya estaba anulada.']);
        }

        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($payment, $data) {
            foreach ($payment->saleItems as $item) {
                if (!$item->product_id) {
                    continue;
                }
                $product = Product::whereKey($item->product_id)->lockForUpdate()->first();
                if ($product && $product->tracksStock()) {
                    $product->increment('stock', $item->qty);
                }
            }

            $payment->update([
                'voided_at' => now(),
                'voided_by' => Auth::id(),
                'void_reason' => $data['reason'],
            ]);
        });

        return back()->with('success', 'Venta anulada.');
    }

    /**
     * Venta de uno o mas productos a un estudiante especifico, desde su
     * perfil (carrito: buscar producto, agregar, ajustar cantidad). Se
     * registra como un solo OtherPayment con el detalle de items en
     * `description`, enlazado a ese estudiante via user_id.
     */
    public function sellToStudent(Request $request, User $student): RedirectResponse
    {
        abort_unless($student->role === 'student', 404);

        $data = $request->validate($this->saleRules());

        if ($error = $this->checkStock($data['items'])) {
            return back()->withErrors(['items' => $error]);
        }
        if ($error = $this->checkFacturaData($data, null)) {
            return back()->withErrors(['buyer_ruc' => $error]);
        }

        DB::transaction(fn () => $this->processSale($data, student: $student));

        return back()->with('success', 'Venta registrada.');
    }

    /**
     * Venta general desde Ventas (no atada a un estudiante) - el comprador
     * puede ser un estudiante/usuario buscado por nombre o DNI, un cliente
     * con RUC, o quedar sin registrar (solo un nombre suelto).
     */
    public function sell(Request $request): RedirectResponse
    {
        $data = $request->validate($this->saleRules() + [
            'buyer_type' => ['required', 'in:student,client,none'],
            'buyer_user_id' => ['required_if:buyer_type,student', 'nullable', 'integer', 'exists:users,id'],
            'buyer_client_id' => ['required_if:buyer_type,client', 'nullable', 'integer', 'exists:clients,id'],
            'buyer_name' => ['nullable', 'string', 'max:180'],
        ]);

        if ($error = $this->checkStock($data['items'])) {
            return back()->withErrors(['items' => $error]);
        }

        $student = $data['buyer_type'] === 'student' ? User::find($data['buyer_user_id']) : null;
        $buyerClient = $data['buyer_type'] === 'client' ? Client::find($data['buyer_client_id']) : null;

        if ($error = $this->checkFacturaData($data, $buyerClient)) {
            return back()->withErrors(['buyer_ruc' => $error]);
        }

        DB::transaction(fn () => $this->processSale(
            $data,
            student: $student,
            buyerClient: $buyerClient,
            freeBuyerName: $data['buyer_name'] ?? null,
        ));

        return back()->with('success', 'Venta registrada.');
    }

    private function saleRules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.name' => ['required', 'string', 'max:180'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.serial' => ['nullable', 'string', 'max:120'],
            'payment_method' => ['required', 'string', 'max:60'],
            'payment_reference' => ['nullable', 'string', 'max:120'],
            'document_type' => ['nullable', 'in:ticket,boleta,factura'],
            'client_id' => ['nullable', 'integer', 'exists:clients,id'],
            'buyer_ruc' => ['nullable', 'digits:11'],
            'buyer_business_name' => ['nullable', 'string', 'max:180'],
        ];
    }

    /**
     * Para factura hace falta un cliente de alguna forma: ya elegido
     * (client_id, o el propio comprador es un cliente), o RUC+razon social
     * sueltos para crear uno nuevo. Se valida aca (no como required_if
     * declarativo) porque "requerido" depende de si YA hay un cliente
     * resuelto por otro campo, no de un valor fijo.
     */
    private function checkFacturaData(array $data, ?Client $buyerClient): ?string
    {
        if (($data['document_type'] ?? 'ticket') !== 'factura') {
            return null;
        }
        if ($buyerClient || !empty($data['client_id'])) {
            return null;
        }
        if (empty($data['buyer_ruc']) || empty($data['buyer_business_name'])) {
            return 'Para factura, busca/selecciona un cliente o indica RUC y razon social.';
        }

        return null;
    }

    /** Revalida el stock en el servidor - el carrito ya avisa en el cliente, pero otro admin pudo vender de por medio. */
    private function checkStock(array $items): ?string
    {
        foreach ($items as $item) {
            if (!$item['product_id']) {
                continue;
            }
            $product = Product::find($item['product_id']);
            if ($product && $product->tracksStock() && $item['qty'] > $product->stock) {
                return "\"{$product->name}\" ya no tiene stock suficiente (quedan {$product->stock}).";
            }
        }

        return null;
    }

    /**
     * Nucleo compartido por sellToStudent() y sell(): arma el pago, los
     * renglones estructurados y descuenta stock. $student y $buyerClient
     * son mutuamente excluyentes (quien recibe la venta); si se pide
     * factura y el comprador ya es un cliente, se factura a ese mismo
     * cliente sin volver a pedirlo.
     */
    private function processSale(array $data, ?User $student = null, ?Client $buyerClient = null, ?string $freeBuyerName = null): OtherPayment
    {
        $items = $data['items'];
        $amount = array_sum(array_map(fn ($i) => $i['unit_price'] * $i['qty'], $items));

        $description = collect($items)
            ->map(function ($i) {
                $line = "{$i['qty']} x {$i['name']} (S/ " . number_format($i['unit_price'], 2) . ' c/u)';
                return ($i['serial'] ?? null) ? "{$line} - Serie/lote: {$i['serial']}" : $line;
            })
            ->implode("\n");

        $concept = count($items) === 1
            ? "{$items[0]['qty']} x {$items[0]['name']}"
            : count($items) . ' productos';

        $invoiceClient = null;
        if (($data['document_type'] ?? 'ticket') === 'factura') {
            $invoiceClient = $buyerClient ?? (isset($data['client_id'])
                ? Client::find($data['client_id'])
                : Client::firstOrCreate(['ruc' => $data['buyer_ruc']], ['business_name' => $data['buyer_business_name']]));
        }

        $payment = OtherPayment::register([
            'type' => 'producto',
            'document_type' => $data['document_type'] ?? 'ticket',
            'concept' => $concept,
            'description' => $description,
            'amount' => $amount,
            'user_id' => $student?->id,
            'buyer_name' => $student ? null : ($buyerClient?->business_name ?? $freeBuyerName),
            'buyer_ruc' => $invoiceClient?->ruc ?? $data['buyer_ruc'] ?? null,
            'buyer_business_name' => $invoiceClient?->business_name ?? $data['buyer_business_name'] ?? null,
            'client_id' => $invoiceClient?->id ?? $buyerClient?->id,
            'payment_method' => $data['payment_method'],
            'payment_reference' => $data['payment_reference'] ?? null,
            'registered_by' => Auth::id(),
        ]);

        foreach ($items as $item) {
            $product = $item['product_id']
                ? Product::whereKey($item['product_id'])->lockForUpdate()->first()
                : null;

            SaleItem::create([
                'other_payment_id' => $payment->id,
                'product_id' => $item['product_id'],
                'name' => $item['name'],
                'unit_price' => $item['unit_price'],
                'unit_cost' => $product?->avg_cost,
                'qty' => $item['qty'],
                'serial' => $item['serial'] ?? null,
            ]);

            if ($product && $product->tracksStock()) {
                $product->decrement('stock', min($item['qty'], $product->stock));
            }
        }

        return $payment;
    }

    /** Buscador de estudiantes/usuarios para vincular el comprador (opcional). */
    public function searchBuyers(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        if ($q === '') {
            return response()->json([]);
        }

        $users = User::where(fn ($query) => $query->where('name', 'like', "%{$q}%")->orWhere('dni', 'like', "%{$q}%"))
            ->limit(8)
            ->get(['id', 'name', 'dni'])
            ->map(fn (User $u) => ['id' => $u->id, 'name' => $u->name, 'dni' => $u->dni]);

        return response()->json($users);
    }

    private function ticketData(OtherPayment $payment): array
    {
        $typeLabel = $payment->type === 'producto' ? 'Producto' : 'Otro';

        return [
            [
                'name' => $payment->buyer?->name ?? $payment->buyer_name,
                'last_name' => null,
                'dni' => $payment->buyer?->dni,
            ],
            [
                'title' => $typeLabel,
                'titleLabel' => 'Tipo',
                'concept' => $payment->concept,
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
                'payment_reference' => $payment->payment_reference,
                'receipt_code' => $payment->receipt_code,
                'paid_at' => $payment->paid_at,
                'document_type' => $payment->document_type ?? 'ticket',
                'buyer_ruc' => $payment->buyer_ruc,
                'buyer_business_name' => $payment->buyer_business_name,
                'items' => $payment->saleItems->map(fn (SaleItem $i) => [
                    'name' => $i->name,
                    'qty' => $i->qty,
                    'unit_price' => $i->unit_price,
                    'serial' => $i->serial,
                ]),
                'voided_at' => $payment->voided_at,
                'void_reason' => $payment->void_reason,
            ],
        ];
    }

    public function reciboPago(OtherPayment $payment): Response
    {
        [$buyerData, $ticketData] = $this->ticketData($payment);

        return Inertia::render('Admin/Ventas/ReciboOtroPago', [
            'student' => $buyerData,
            'installment' => $ticketData,
        ]);
    }

    public function reciboPagoDatos(OtherPayment $payment): JsonResponse
    {
        [$buyerData, $ticketData] = $this->ticketData($payment);

        return response()->json(['student' => $buyerData, 'installment' => $ticketData]);
    }
}
