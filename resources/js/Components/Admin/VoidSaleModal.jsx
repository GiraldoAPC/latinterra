import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { AlertTriangle, Ban } from "lucide-react";

/**
 * Flujo de anulacion en 2 pasos: 1) motivo (obligatorio), 2) confirmacion
 * tipo alerta antes de ejecutar (no se puede deshacer, devuelve stock).
 */
export default function VoidSaleModal({ open, onOpenChange, payment, onVoided }) {
    const [step, setStep] = useState("reason");
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setStep("reason");
            setReason("");
            setError("");
            setSubmitting(false);
        }
    }, [open, payment]);

    const goToConfirm = () => {
        if (!reason.trim()) {
            setError("Ingresa el motivo de la anulacion.");
            return;
        }
        setError("");
        setStep("confirm");
    };

    const confirmVoid = () => {
        if (!payment) return;
        setSubmitting(true);
        router.post(
            `/admin/ventas/otros-pagos/${payment.id}/anular`,
            { reason: reason.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    onVoided?.();
                },
                onError: () => {
                    setSubmitting(false);
                    setStep("reason");
                    setError("No se pudo anular la venta. Intenta nuevamente.");
                },
                onFinish: () => setSubmitting(false),
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
            <DialogContent className="max-w-md">
                {step === "reason" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Ban className="h-4.5 w-4.5 text-red-600" />
                                Anular venta {payment?.receipt_code}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-2 py-2">
                            <label className="text-sm font-medium text-[#024A7D]">Motivo de anulacion</label>
                            <Textarea
                                autoFocus
                                rows={4}
                                placeholder="Ej: Cliente devolvio el producto, error en el registro..."
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    if (error) setError("");
                                }}
                            />
                            {error && <p className="text-xs text-red-600">{error}</p>}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="button" variant="destructive" onClick={goToConfirm}>
                                Continuar
                            </Button>
                        </div>
                    </>
                )}

                {step === "confirm" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-4.5 w-4.5 text-red-600" />
                                Confirmar anulacion
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-3 py-2">
                            <p className="text-sm text-slate-600">
                                Confirmas anular la venta <span className="font-semibold text-[#024A7D]">{payment?.receipt_code}</span>?
                                Si tenia productos, se devolvera el stock. Esta accion no se puede deshacer.
                            </p>
                            <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                                <p className="text-xs text-muted-foreground">Motivo</p>
                                <p className="font-medium text-[#024A7D]">{reason}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setStep("reason")} disabled={submitting}>
                                Volver
                            </Button>
                            <Button type="button" variant="destructive" onClick={confirmVoid} disabled={submitting}>
                                {submitting ? "Anulando..." : "Si, anular"}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
