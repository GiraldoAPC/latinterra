import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Loader2, ClipboardList, AlertTriangle } from "lucide-react";

const METHOD_LABELS = {
    efectivo: "Efectivo",
    transferencia: "Transferencia bancaria",
    yape: "Yape / Plin",
    tarjeta: "Tarjeta",
    otro: "Otro",
};

const DOCUMENT_LABELS = {
    ticket: "Ticket interno",
    boleta: "Boleta (simulada)",
    factura: "Factura (simulada)",
};

function formatDateTime(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Field({ label, value }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-[#024A7D]">{value || "-"}</p>
        </div>
    );
}

/**
 * Vista completa de una venta/pago para revisar (no para imprimir - eso es
 * TicketModal, formato tiketera compacto). Misma fuente de datos
 * (recibo-datos), pero mostrada como tabla/ficha detallada.
 */
export default function SaleDetailsModal({ open, onOpenChange, dataUrl }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !dataUrl) return;
        setData(null);
        setLoading(true);
        window.axios
            .get(dataUrl)
            .then((res) => setData(res.data))
            .finally(() => setLoading(false));
    }, [open, dataUrl]);

    const student = data?.student;
    const sale = data?.installment;
    const items = sale?.items ?? [];
    const fullName = student ? [student.last_name, student.name].filter(Boolean).join(" ") || student.name || student.buyer_name : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] max-w-lg flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardList className="h-4.5 w-4.5 text-[#024A7D]" />
                        Detalle de venta {sale?.receipt_code && `· ${sale.receipt_code}`}
                    </DialogTitle>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-1 -m-1">
                    {loading && (
                        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando...
                        </div>
                    )}

                    {!loading && sale && (
                        <>
                            {sale.voided_at && (
                                <div className="space-y-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                        Anulada el {formatDateTime(sale.voided_at)}
                                    </div>
                                    {sale.void_reason && (
                                        <p className="pl-6 text-red-600">
                                            <span className="font-medium">Motivo:</span> {sale.void_reason}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <Field label={student?.dni ? "Estudiante" : "Cliente"} value={fullName} />
                                {student?.dni && <Field label="Documento" value={student.dni} />}
                                <Field label="Tipo de comprobante" value={DOCUMENT_LABELS[sale.document_type] ?? sale.document_type} />
                                <Field label="N° de comprobante" value={sale.receipt_code} />
                                {sale.buyer_ruc && <Field label="RUC" value={sale.buyer_ruc} />}
                                {sale.buyer_business_name && <Field label="Razon social" value={sale.buyer_business_name} />}
                                <Field label="Metodo de pago" value={METHOD_LABELS[sale.payment_method] ?? sale.payment_method} />
                                {sale.payment_reference && <Field label="Referencia" value={sale.payment_reference} />}
                                <Field label="Fecha" value={formatDateTime(sale.paid_at)} />
                            </div>

                            {items.length > 0 ? (
                                <div className="rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                                <th className="px-3 py-2">Producto</th>
                                                <th className="px-3 py-2 text-center">Cant.</th>
                                                <th className="px-3 py-2 text-right">Precio unit.</th>
                                                <th className="px-3 py-2 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((it, idx) => (
                                                <tr key={idx} className="border-b last:border-0">
                                                    <td className="px-3 py-2">
                                                        {it.name}
                                                        {it.serial && <span className="ml-1 text-xs text-muted-foreground">({it.serial})</span>}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">{it.qty}</td>
                                                    <td className="px-3 py-2 text-right">S/ {Number(it.unit_price).toFixed(2)}</td>
                                                    <td className="px-3 py-2 text-right font-semibold">
                                                        S/ {(it.unit_price * it.qty).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="rounded-lg border px-3 py-2 text-sm">
                                    <p className="text-xs text-muted-foreground">Concepto</p>
                                    <p className="font-medium text-[#024A7D]">{sale.concept}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t pt-3 text-base font-bold text-[#024A7D]">
                                <span>Total</span>
                                <span>S/ {Number(sale.amount).toFixed(2)}</span>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
