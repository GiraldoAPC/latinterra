import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { Loader2, Wallet } from "lucide-react";

const METHODS = [
    { value: "efectivo", label: "Efectivo" },
    { value: "transferencia", label: "Transferencia bancaria" },
    { value: "yape", label: "Yape / Plin" },
    { value: "tarjeta", label: "Tarjeta" },
    { value: "otro", label: "Otro" },
];

const TYPE_LABELS = { matricula: "Matricula", mensualidad: "Mensualidad" };

/**
 * Registrar el pago de una cuota (matricula o mensualidad) con su metodo y
 * referencia - a diferencia del viejo "Marcar pagado" de un clic, esto deja
 * el detalle necesario para poder generar el ticket interno despues.
 */
export default function RegisterPaymentModal({ open, onOpenChange, studentId, installment, onPaid }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        payment_method: "",
        payment_reference: "",
    });

    useEffect(() => {
        if (open) {
            reset();
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, installment?.id]);

    if (!installment) return null;

    const concept = TYPE_LABELS[installment.type] ?? installment.type;

    const submit = (e) => {
        e.preventDefault();
        post(`/admin/estudiantes/${studentId}/cuotas/${installment.id}/pagar`, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                onPaid?.(installment);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="h-4.5 w-4.5 text-[#024A7D]" />
                        Registrar pago
                    </DialogTitle>
                </DialogHeader>

                <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                    <p className="font-medium text-[#024A7D]">{installment.course_title}</p>
                    <p className="text-xs text-muted-foreground">
                        {concept}
                        {installment.installment_number ? ` #${installment.installment_number}` : ""} · S/{" "}
                        {Number(installment.amount).toFixed(2)}
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="payment_method" className="text-xs text-muted-foreground">
                            Metodo de pago
                        </Label>
                        <Select value={data.payment_method} onValueChange={(v) => setData("payment_method", v)}>
                            <SelectTrigger id="payment_method" className="mt-1">
                                <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                                {METHODS.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.payment_method && <p className="mt-1 text-xs text-destructive">{errors.payment_method}</p>}
                    </div>

                    <div>
                        <Label htmlFor="payment_reference" className="text-xs text-muted-foreground">
                            Referencia / N° de operacion (opcional)
                        </Label>
                        <Input
                            id="payment_reference"
                            className="mt-1"
                            value={data.payment_reference}
                            onChange={(e) => setData("payment_reference", e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                            Confirmar pago
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
