import { Button } from "@/Components/ui/button";
import { Printer } from "lucide-react";

const TYPE_LABELS = { matricula: "Matricula", mensualidad: "Mensualidad" };
const METHOD_LABELS = {
    efectivo: "Efectivo",
    transferencia: "Transferencia bancaria",
    yape: "Yape / Plin",
    tarjeta: "Tarjeta",
    otro: "Otro",
};
const DOCUMENT_LABELS = {
    ticket: "RECIBO INTERNO DE PAGO",
    boleta: "BOLETA DE VENTA (simulada)",
    factura: "FACTURA (simulada)",
};
const DOCUMENT_NUMBER_LABEL = {
    ticket: "N Ticket",
    boleta: "N Boleta",
    factura: "N Factura",
};
const IGV_RATE = 0.18;

function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function TicketRow({ label, value }) {
    return (
        <div className="flex justify-between gap-2 py-0.5">
            <span className="shrink-0 text-[11px] text-neutral-600">{label}</span>
            <span className="text-right text-[11px] font-semibold text-black">{value || "-"}</span>
        </div>
    );
}

/**
 * Ticket de pago formateado para impresora tiketera (80mm de ancho): sin
 * bordes redondeados, tipografia monoespaciada chica, todo en una sola
 * columna angosta - a diferencia de la ficha de matricula (A4). Usado
 * tanto desde el perfil admin de un estudiante como desde "Mi perfil" del
 * propio estudiante.
 */
export default function PaymentTicket({ student, installment, hideActions = false }) {
    const fullName = [student.last_name, student.name].filter(Boolean).join(" ") || student.name || student.buyer_name;
    // "installment" cubre tanto una cuota de curso (course_title + type +
    // installment_number) como un pago ajeno al curso (title + concept ya
    // resueltos por el backend) - ver OtherPaymentController.
    const title = installment.title ?? installment.course_title;
    const concept =
        installment.concept ??
        `${TYPE_LABELS[installment.type] ?? installment.type}${installment.installment_number ? ` #${installment.installment_number}` : ""}`;

    const items = installment.items ?? [];
    const documentType = installment.document_type ?? "ticket";
    const isFiscalSim = documentType === "boleta" || documentType === "factura";
    const amount = Number(installment.amount);
    const opGravada = amount / (1 + IGV_RATE);
    const igv = amount - opGravada;
    const voided = !!installment.voided_at;

    return (
        <div className="mx-auto max-w-[300px]">
            <div
                id="ticket-print"
                className="relative overflow-hidden border border-dashed border-neutral-300 bg-white px-4 py-5 font-mono text-black"
            >
                {voided && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                        <span className="-rotate-45 whitespace-nowrap text-4xl font-extrabold tracking-widest text-red-600/40">
                            ANULADO
                        </span>
                    </div>
                )}

                <div className="text-center">
                    <img src="/assets/img/LOGO-ACCESO-VERTICAL.png" alt="Acceso Vertical Perú" className="mx-auto h-8 object-contain" />
                    <p className="mt-1 text-[10px] tracking-wide text-neutral-600">
                        {DOCUMENT_LABELS[documentType] ?? DOCUMENT_LABELS.ticket}
                    </p>
                </div>

                {voided && (
                    <p className="my-1 text-center text-[9px] font-semibold text-red-600">
                        Anulado el {formatDateTime(installment.voided_at)}
                        {installment.void_reason ? ` · ${installment.void_reason}` : ""}
                    </p>
                )}

                <div className="my-2 border-t border-dashed border-neutral-400" />

                <TicketRow label={DOCUMENT_NUMBER_LABEL[documentType] ?? DOCUMENT_NUMBER_LABEL.ticket} value={installment.receipt_code} />
                <TicketRow label="Fecha" value={formatDateTime(installment.paid_at)} />

                <div className="my-2 border-t border-dashed border-neutral-400" />

                <TicketRow label={student.dni ? "Estudiante" : "Cliente"} value={fullName} />
                {student.dni && <TicketRow label="Documento" value={student.dni} />}
                {documentType === "factura" && (
                    <>
                        <TicketRow label="RUC" value={installment.buyer_ruc} />
                        <TicketRow label="Razon social" value={installment.buyer_business_name} />
                    </>
                )}

                <div className="my-2 border-t border-dashed border-neutral-400" />

                {title && <TicketRow label={installment.titleLabel ?? "Curso"} value={title} />}
                <TicketRow label="Concepto" value={concept} />
                {items.length > 1 && (
                    <div className="my-1 space-y-0.5 border-y border-dashed border-neutral-300 py-1">
                        {items.map((it, idx) => (
                            <div key={idx} className="flex justify-between gap-2 text-[10px] text-neutral-700">
                                <span className="truncate">
                                    {it.qty} x {it.name}
                                    {it.serial && <span className="text-neutral-500"> ({it.serial})</span>}
                                </span>
                                <span className="shrink-0 font-semibold">S/ {(it.unit_price * it.qty).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                )}
                {installment.due_date && <TicketRow label="Vencimiento" value={formatDate(installment.due_date)} />}
                <TicketRow label="Metodo" value={METHOD_LABELS[installment.payment_method] ?? installment.payment_method} />
                {installment.payment_reference && <TicketRow label="Referencia" value={installment.payment_reference} />}

                <div className="my-2 border-t border-dashed border-neutral-400" />

                {isFiscalSim && (
                    <>
                        <TicketRow label="Op. gravada" value={`S/ ${opGravada.toFixed(2)}`} />
                        <TicketRow label="IGV (18%)" value={`S/ ${igv.toFixed(2)}`} />
                    </>
                )}
                <div className="flex items-baseline justify-between py-1">
                    <span className="text-xs font-bold uppercase">Total pagado</span>
                    <span className="text-base font-extrabold">S/ {amount.toFixed(2)}</span>
                </div>

                <div className="my-2 border-t border-dashed border-neutral-400" />

                <p className="text-center text-[9px] leading-relaxed text-neutral-500">
                    {isFiscalSim ? (
                        <>
                            Documento referencial emitido por Acceso Vertical Perú - no
                            tiene validez tributaria ante SUNAT.
                        </>
                    ) : (
                        <>
                            Este es un comprobante interno de Acceso Vertical Perú y no constituye un
                            comprobante de pago tributario (boleta/factura).
                        </>
                    )}
                    <br />
                    ¡Gracias por tu pago!
                </p>
            </div>

            {!hideActions && (
                <div className="mt-6 flex justify-center print:hidden">
                    <Button onClick={() => window.print()}>
                        <Printer className="h-4 w-4" />
                        Imprimir ticket
                    </Button>
                </div>
            )}

            <style>{`
                @media print {
                    @page { size: 80mm auto; margin: 0; }
                    html, body { background: #fff !important; }
                    /* El ticket puede estar en la pagina de recibo normal o
                       dentro de un Dialog (portal en <body>, hermano del
                       resto de la pagina/overlay) - en ambos casos, al
                       imprimir se oculta todo menos el ticket mismo. */
                    body * { visibility: hidden !important; }
                    #ticket-print, #ticket-print * { visibility: visible !important; }
                    #ticket-print {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 72mm;
                        margin: 0 auto;
                        border: none !important;
                        padding: 4mm 3mm !important;
                    }
                }
            `}</style>
        </div>
    );
}
