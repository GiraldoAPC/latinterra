import { useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Plus, ShoppingBag, ShoppingCart, Receipt, Package, Sparkles, Wallet, Search, Eye, Printer, Ban, ChevronDown } from "lucide-react";
import RegisterOtherPaymentModal from "@/Components/Admin/RegisterOtherPaymentModal";
import SellProductModal from "@/Components/Admin/SellProductModal";
import SaleDetailsModal from "@/Components/Admin/SaleDetailsModal";
import VoidSaleModal from "@/Components/Admin/VoidSaleModal";
import TicketModal from "@/Components/Shared/TicketModal";

const TYPE_BADGE = {
    producto: { label: "Producto", className: "bg-sky-500/10 text-sky-600" },
    otro: { label: "Otro", className: "bg-amber-500/10 text-amber-600" },
};

const ACTION_ICON_COLORS = {
    sky: "bg-sky-500/10 text-sky-600",
    green: "bg-[#00ADEE]/10 text-[#024A7D]",
    red: "bg-red-500/10 text-red-600",
};

function ActionIcon({ icon: Icon, color }) {
    return (
        <span className={`box-border flex h-6 w-6 shrink-0 items-center justify-center rounded-md leading-none ${ACTION_ICON_COLORS[color]}`}>
            <Icon className="h-3.5 w-3.5" />
        </span>
    );
}

const METHOD_LABELS = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    yape: "Yape / Plin",
    tarjeta: "Tarjeta",
    otro: "Otro",
};

function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white", color)}>
                <Icon className="h-4 w-4" />
            </span>
            <div>
                <p className="text-lg font-extrabold leading-none text-[#024A7D]">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

export default function OtrosPagos({ payments, filters, stats }) {
    const [showRegister, setShowRegister] = useState(false);
    const [showSell, setShowSell] = useState(false);
    const [viewingDetails, setViewingDetails] = useState(null);
    const [printingTicket, setPrintingTicket] = useState(null);
    const [voidingPayment, setVoidingPayment] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [q, setQ] = useState(filters.q ?? "");

    const filterByType = (type) => {
        router.get("/admin/ventas/otros-pagos", { ...(type ? { type } : {}), ...(q ? { q } : {}) }, { preserveState: true, preserveScroll: true });
    };

    useEffect(() => {
        const t = setTimeout(() => {
            if (q === (filters.q ?? "")) return;
            router.get(
                "/admin/ventas/otros-pagos",
                { ...(filters.type ? { type: filters.type } : {}), ...(q ? { q } : {}) },
                { preserveState: true, preserveScroll: true }
            );
        }, 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    return (
        <>
            <Head title="Ventas" />
            <AdminLayout title="Ventas">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-bold text-[#024A7D]">Ventas</h1>
                        <p className="text-sm text-muted-foreground">
                            Ventas de productos y otros conceptos ajenos a las cuotas de curso.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowRegister(true)}>
                            <Plus className="h-4 w-4" />
                            Registrar pago
                        </Button>
                        <Button onClick={() => setShowSell(true)}>
                            <ShoppingCart className="h-4 w-4" />
                            Vender producto
                        </Button>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <StatCard icon={Wallet} label="Total registrado" value={`S/ ${Number(stats.monto_total).toFixed(2)}`} color="bg-gradient-to-br from-[#59CAF4] to-[#024A7D]" />
                    <StatCard icon={Receipt} label="Tickets emitidos" value={stats.total} color="bg-gradient-to-br from-sky-400 to-sky-600" />
                    <StatCard icon={Package} label="Productos" value={stats.producto} color="bg-gradient-to-br from-amber-400 to-amber-600" />
                    <StatCard icon={Sparkles} label="Otros conceptos" value={stats.otro} color="bg-gradient-to-br from-violet-400 to-violet-600" />
                </div>

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-1 rounded-lg bg-muted/60 p-1 w-fit">
                        {[
                            { value: null, label: "Todos" },
                            { value: "producto", label: "Productos" },
                            { value: "otro", label: "Otros" },
                        ].map((f) => (
                            <button
                                key={f.label}
                                type="button"
                                onClick={() => filterByType(f.value)}
                                className={cn(
                                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                                    (filters.type ?? null) === f.value ? "bg-white shadow-sm text-[#024A7D]" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Buscar por ticket, concepto o cliente..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {payments.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-14 text-center">
                                <ShoppingBag className="h-10 w-10 text-slate-300" />
                                <p className="text-slate-500">Aun no hay pagos registrados.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                            <th className="px-4 py-3">Ticket</th>
                                            <th className="px-4 py-3">Tipo</th>
                                            <th className="px-4 py-3">Concepto</th>
                                            <th className="px-4 py-3">Cliente</th>
                                            <th className="px-4 py-3">Monto</th>
                                            <th className="px-4 py-3">Metodo</th>
                                            <th className="px-4 py-3">Fecha</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((p) => {
                                            const type = TYPE_BADGE[p.type] ?? TYPE_BADGE.otro;
                                            const voided = !!p.voided_at;
                                            return (
                                                <tr key={p.id} className={cn("border-b last:border-0", voided && "bg-red-50/40")}>
                                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                                        <span className={voided ? "line-through" : ""}>{p.receipt_code}</span>
                                                        {voided && (
                                                            <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                                                                Anulado
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", type.className)}>
                                                            {type.label}
                                                        </span>
                                                    </td>
                                                    <td className={cn("px-4 py-3 font-medium text-[#024A7D]", voided && "line-through opacity-60")}>
                                                        {p.concept}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">{p.buyer_name || "-"}</td>
                                                    <td className={cn("px-4 py-3", voided && "line-through opacity-60")}>
                                                        S/ {Number(p.amount).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">{METHOD_LABELS[p.payment_method] ?? p.payment_method}</td>
                                                    <td className="px-4 py-3 text-slate-500">{formatDate(p.paid_at)}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <DropdownMenu
                                                            open={openMenuId === p.id}
                                                            onOpenChange={(v) => setOpenMenuId(v ? p.id : null)}
                                                        >
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="sm">
                                                                    Acciones
                                                                    <ChevronDown className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-52" onCloseAutoFocus={(e) => e.preventDefault()}>
                                                                <DropdownMenuItem onClick={() => setViewingDetails(p)}>
                                                                    <ActionIcon icon={Eye} color="sky" />
                                                                    Ver detalles
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => setPrintingTicket(p)}>
                                                                    <ActionIcon icon={Printer} color="green" />
                                                                    Imprimir
                                                                </DropdownMenuItem>
                                                                {!voided && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem onClick={() => setVoidingPayment(p)}>
                                                                            <ActionIcon icon={Ban} color="red" />
                                                                            <span className="text-destructive">Anular</span>
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </AdminLayout>

            <RegisterOtherPaymentModal
                open={showRegister}
                onOpenChange={setShowRegister}
                onRegistered={() => router.reload({ only: ["payments", "stats"] })}
            />

            <SellProductModal
                open={showSell}
                onOpenChange={setShowSell}
                onSold={() => router.reload({ only: ["payments", "stats"] })}
            />

            <SaleDetailsModal
                open={!!viewingDetails}
                onOpenChange={(v) => !v && setViewingDetails(null)}
                dataUrl={viewingDetails ? `/admin/ventas/otros-pagos/${viewingDetails.id}/recibo-datos` : null}
            />

            <TicketModal
                open={!!printingTicket}
                onOpenChange={(v) => !v && setPrintingTicket(null)}
                dataUrl={printingTicket ? `/admin/ventas/otros-pagos/${printingTicket.id}/recibo-datos` : null}
                autoPrint
            />

            <VoidSaleModal
                open={!!voidingPayment}
                onOpenChange={(v) => !v && setVoidingPayment(null)}
                payment={voidingPayment}
                onVoided={() => router.reload({ only: ["payments", "stats"] })}
            />
        </>
    );
}
