import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, ClipboardList, ShoppingBag, ArrowRightLeft } from "lucide-react";
import RegisterPurchaseModal from "@/Components/Admin/RegisterPurchaseModal";
import TransferStockModal from "@/Components/Admin/TransferStockModal";

function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const DOCUMENT_TYPE_LABEL = {
    factura: "Factura",
    boleta: "Boleta",
    guia_remision: "Guia de remision",
    ticket: "Ticket",
    otro: "Otro",
};

const PAYMENT_METHOD_LABEL = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    yape: "Yape / Plin",
    tarjeta: "Tarjeta",
    otro: "Otro",
};

export default function Movimientos({ purchases, transfers, stats }) {
    const { settings } = usePage().props;
    const warehouseMode = settings?.warehouseMode ?? false;

    const [tab, setTab] = useState("compras");
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [transferModalOpen, setTransferModalOpen] = useState(false);

    return (
        <>
            <Head title="Movimientos de inventario" />
            <AdminLayout title="Movimientos">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-bold text-[#024A7D]">Movimientos de inventario</h1>
                        <p className="text-sm text-muted-foreground">
                            {stats.count} compras · S/ {Number(stats.total).toFixed(2)} en total.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {warehouseMode && (
                            <Button variant="outline" onClick={() => setTransferModalOpen(true)}>
                                <ArrowRightLeft className="h-4 w-4" />
                                Transferir a Ventas
                            </Button>
                        )}
                        <Button onClick={() => setPurchaseModalOpen(true)}>
                            <Plus className="h-4 w-4" />
                            Registrar compra
                        </Button>
                    </div>
                </div>

                {warehouseMode && (
                    <div className="mb-4 flex gap-1 rounded-lg bg-muted/50 p-1 w-fit">
                        <button
                            type="button"
                            onClick={() => setTab("compras")}
                            className={cn(
                                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                tab === "compras" ? "bg-white text-[#024A7D] shadow-sm" : "text-muted-foreground"
                            )}
                        >
                            Compras
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("transferencias")}
                            className={cn(
                                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                tab === "transferencias" ? "bg-white text-[#024A7D] shadow-sm" : "text-muted-foreground"
                            )}
                        >
                            Transferencias
                        </button>
                    </div>
                )}

                {tab === "compras" && (
                    <Card>
                        <CardContent className="p-0">
                            {purchases.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 py-14 text-center">
                                    <ClipboardList className="h-10 w-10 text-slate-300" />
                                    <p className="text-slate-500">Aun no hay compras registradas.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                                <th className="px-4 py-3">Fecha</th>
                                                <th className="px-4 py-3">Producto</th>
                                                <th className="px-4 py-3">Proveedor</th>
                                                <th className="px-4 py-3">Costo unit.</th>
                                                <th className="px-4 py-3">Cantidad</th>
                                                <th className="px-4 py-3">Total</th>
                                                <th className="px-4 py-3">Pago</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {purchases.map((p) => (
                                                <tr key={p.id} className="border-b last:border-0">
                                                    <td className="px-4 py-3 text-slate-500">{formatDate(p.purchased_at)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium text-[#024A7D]">{p.product?.name}</p>
                                                                {p.product?.sku && <p className="text-xs text-muted-foreground">{p.product.sku}</p>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {p.supplier?.name || "-"}
                                                        {p.document_type && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {DOCUMENT_TYPE_LABEL[p.document_type] ?? p.document_type}
                                                                {p.document_number && ` ${p.document_number}`}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">S/ {Number(p.unit_cost).toFixed(2)}</td>
                                                    <td className="px-4 py-3">{p.quantity}</td>
                                                    <td className="px-4 py-3 font-semibold text-[#024A7D]">S/ {Number(p.total).toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {p.payment_method ? PAYMENT_METHOD_LABEL[p.payment_method] ?? p.payment_method : "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {tab === "transferencias" && warehouseMode && (
                    <Card>
                        <CardContent className="p-0">
                            {transfers.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 py-14 text-center">
                                    <ArrowRightLeft className="h-10 w-10 text-slate-300" />
                                    <p className="text-slate-500">Aun no hay transferencias registradas.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                                <th className="px-4 py-3">Fecha</th>
                                                <th className="px-4 py-3">Producto</th>
                                                <th className="px-4 py-3">Cantidad</th>
                                                <th className="px-4 py-3">Notas</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transfers.map((t) => (
                                                <tr key={t.id} className="border-b last:border-0">
                                                    <td className="px-4 py-3 text-slate-500">{formatDate(t.created_at)}</td>
                                                    <td className="px-4 py-3 font-medium text-[#024A7D]">{t.product?.name}</td>
                                                    <td className="px-4 py-3">
                                                        Almacén → Ventas: <strong>{t.quantity}</strong>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">{t.notes || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </AdminLayout>

            <RegisterPurchaseModal
                open={purchaseModalOpen}
                onOpenChange={setPurchaseModalOpen}
                onSaved={() => router.reload({ only: ["purchases", "stats"] })}
            />
            <TransferStockModal
                open={transferModalOpen}
                onOpenChange={setTransferModalOpen}
                onSaved={() => router.reload({ only: ["transfers"] })}
            />
        </>
    );
}
