import { useEffect, useMemo, useState } from "react";
import { useForm } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { DatePicker } from "@/Components/ui/date-picker";
import { Loader2, SplitSquareHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

function evenSplit(total, count) {
    const base = Math.floor((total / count) * 100) / 100;
    const amounts = Array(count).fill(base);
    // La diferencia por redondeo (centavos) se la lleva la ultima cuota.
    const remainder = Math.round((total - base * count) * 100) / 100;
    amounts[count - 1] = Math.round((amounts[count - 1] + remainder) * 100) / 100;
    return amounts;
}

function defaultDueDate(monthsAhead) {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead);
    return d.toISOString().slice(0, 10);
}

/**
 * Caso especial: el curso es de pago unico, pero un estudiante puntual pidio
 * pagar en partes. Convierte el pedido pendiente en hasta 3 cuotas con monto
 * y fecha propios (no el cronograma automatico de matricula+mensualidad).
 */
export default function SplitOrderModal({ open, onOpenChange, order, onSplit }) {
    const [count, setCount] = useState(2);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        installments: [],
    });

    useEffect(() => {
        if (open && order) {
            clearErrors();
            const amounts = evenSplit(Number(order.amount), count);
            setData(
                "installments",
                amounts.map((amount, i) => ({ amount: String(amount), due_date: defaultDueDate(i) }))
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, order?.id, count]);

    const sum = useMemo(
        () => data.installments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0),
        [data.installments]
    );

    if (!order) return null;

    const target = Number(order.amount);
    const matches = Math.abs(sum - target) < 0.01;

    const updateInstallment = (index, field, value) => {
        setData(
            "installments",
            data.installments.map((inst, i) => (i === index ? { ...inst, [field]: value } : inst))
        );
    };

    const submit = (e) => {
        e.preventDefault();
        if (!matches) return;
        post(`/admin/ventas/pedidos/${order.id}/dividir-cuotas`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
                onSplit?.(order);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <SplitSquareHorizontal className="h-4.5 w-4.5 text-[#024A7D]" />
                        Dividir pago en cuotas
                    </DialogTitle>
                </DialogHeader>

                <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                    <p className="font-medium text-[#024A7D]">{order.course_title}</p>
                    <p className="text-xs text-muted-foreground">Monto total: S/ {target.toFixed(2)}</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label className="text-xs text-muted-foreground">Cantidad de cuotas</Label>
                        <div className="mt-1 flex gap-2">
                            {[2, 3].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setCount(n)}
                                    className={cn(
                                        "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                                        count === n
                                            ? "border-[#00ADEE] bg-[#00ADEE]/10 text-[#024A7D]"
                                            : "text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    {n} cuotas
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        {data.installments.map((inst, i) => (
                            <div key={i} className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Cuota #{i + 1} - monto</Label>
                                    <Input
                                        className="mt-1"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={inst.amount}
                                        onChange={(e) => updateInstallment(i, "amount", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Fecha de vencimiento</Label>
                                    <div className="mt-1">
                                        <DatePicker
                                            value={inst.due_date}
                                            onChange={(v) => updateInstallment(i, "due_date", v)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className={cn("text-xs font-medium", matches ? "text-emerald-600" : "text-destructive")}>
                        Suma de cuotas: S/ {sum.toFixed(2)} {matches ? "✓ coincide con el total" : `(debe ser S/ ${target.toFixed(2)})`}
                    </p>
                    {errors.installments && <p className="text-xs text-destructive">{errors.installments}</p>}

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing || !matches}>
                            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                            Dividir en cuotas
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
