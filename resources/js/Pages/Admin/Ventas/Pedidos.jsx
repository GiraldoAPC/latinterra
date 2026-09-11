import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, ShoppingCart } from "lucide-react";

const STATUS = {
    pending: { label: "Pendiente", className: "bg-amber-100 text-amber-700" },
    paid: { label: "Pagado", className: "bg-[#00ADEE]/15 text-[#024A7D]" },
    rejected: { label: "Rechazado", className: "bg-red-100 text-red-700" },
};

function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function StatCard({ icon: Icon, value, label, color }) {
    const colors = {
        amber: "bg-amber-500/10 text-amber-600",
        green: "bg-[#00ADEE]/10 text-[#024A7D]",
        red: "bg-red-500/10 text-red-600",
    };
    return (
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <span className={`box-border flex h-10 w-10 shrink-0 items-center justify-center rounded-lg leading-none ${colors[color]}`}>
                <Icon className="h-5 w-5" />
            </span>
            <div>
                <div className="text-xl font-bold leading-none">{value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{label}</div>
            </div>
        </div>
    );
}

function ConfirmModal({ order, onOpenChange }) {
    const [paymentMethod, setPaymentMethod] = useState("");
    const [paymentReference, setPaymentReference] = useState("");
    const [processing, setProcessing] = useState(false);

    const confirm = () => {
        setProcessing(true);
        router.post(
            `/admin/ventas/pedidos/${order.id}/confirmar`,
            { payment_method: paymentMethod, payment_reference: paymentReference },
            { preserveScroll: true, onFinish: () => setProcessing(false), onSuccess: () => onOpenChange(false) }
        );
    };

    return (
        <Dialog open={!!order} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Confirmar pago</DialogTitle>
                    <DialogDescription>
                        {order?.student.name} — {order?.course_title} (S/ {Number(order?.amount ?? 0).toFixed(2)})
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div>
                        <Label htmlFor="payment_method" className="text-xs text-muted-foreground">
                            Metodo de pago
                        </Label>
                        <Input
                            id="payment_method"
                            className="mt-1"
                            placeholder="Yape, transferencia, efectivo..."
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="payment_reference" className="text-xs text-muted-foreground">
                            Referencia / N° operacion
                        </Label>
                        <Input
                            id="payment_reference"
                            className="mt-1"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={confirm} disabled={processing}>
                            Confirmar pago y activar acceso
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function Pedidos({ orders, filters, stats }) {
    const [confirming, setConfirming] = useState(null);

    const filterBy = (status) => {
        router.get("/admin/ventas/pedidos", status ? { status } : {}, { preserveState: true });
    };

    const reject = (order) => {
        if (!confirm(`¿Rechazar el pedido de "${order.student.name}"?`)) return;
        router.post(`/admin/ventas/pedidos/${order.id}/rechazar`, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Pedidos de cursos" />
            <AdminLayout title="Pedidos de cursos">
                <div className="mb-4">
                    <h1 className="text-lg font-semibold">Pedidos de cursos</h1>
                    <p className="text-sm text-muted-foreground">
                        Cursos de pago unico: confirma manualmente el pago para activar el acceso del estudiante.
                    </p>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <button type="button" onClick={() => filterBy("pending")} className="text-left">
                        <StatCard icon={Clock} value={stats.pending} label="Pendientes" color="amber" />
                    </button>
                    <button type="button" onClick={() => filterBy("paid")} className="text-left">
                        <StatCard icon={CheckCircle2} value={stats.paid} label="Pagados" color="green" />
                    </button>
                    <button type="button" onClick={() => filterBy("rejected")} className="text-left">
                        <StatCard icon={XCircle} value={stats.rejected} label="Rechazados" color="red" />
                    </button>
                </div>

                {filters?.status && (
                    <Button variant="outline" size="sm" className="mb-3" onClick={() => filterBy(null)}>
                        Quitar filtro ({STATUS[filters.status]?.label})
                    </Button>
                )}

                <div className="overflow-x-auto rounded-xl border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Estudiante</TableHead>
                                <TableHead>Curso</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                                        <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                                        No hay pedidos.
                                    </TableCell>
                                </TableRow>
                            )}
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.student.name}</TableCell>
                                    <TableCell>{order.course_title}</TableCell>
                                    <TableCell>S/ {Number(order.amount).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge className={cn("border-0", STATUS[order.status]?.className)}>
                                            {STATUS[order.status]?.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                        {order.status === "pending" ? (
                                            <div className="flex justify-end gap-1.5">
                                                <Button size="sm" variant="outline" onClick={() => reject(order)}>
                                                    Rechazar
                                                </Button>
                                                <Button size="sm" onClick={() => setConfirming(order)}>
                                                    Confirmar pago
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                {order.status === "paid" ? `Pagado ${formatDate(order.paid_at)}` : "—"}
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </AdminLayout>

            <ConfirmModal order={confirming} onOpenChange={(v) => !v && setConfirming(null)} />
        </>
    );
}
