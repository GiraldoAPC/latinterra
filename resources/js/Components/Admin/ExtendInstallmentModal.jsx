import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Loader2, CalendarClock } from "lucide-react";

const TYPE_LABELS = { matricula: "Matricula", mensualidad: "Mensualidad" };

function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + (Number(days) || 0));
    return d;
}

/**
 * Amplia el vencimiento de una cuota especifica X dias - el backend solo
 * deja hacerlo una vez por cuota (ver CourseInstallment::extendDueDate).
 */
export default function ExtendInstallmentModal({ open, onOpenChange, studentId, installment, onExtended }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ days: "7" });

    useEffect(() => {
        if (open) {
            reset();
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, installment?.id]);

    if (!installment) return null;

    const concept = TYPE_LABELS[installment.type] ?? installment.type;
    const newDueDate = data.days ? addDays(installment.due_date, data.days) : null;

    const submit = (e) => {
        e.preventDefault();
        post(`/admin/estudiantes/${studentId}/cuotas/${installment.id}/ampliar`, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                onExtended?.(installment);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarClock className="h-4.5 w-4.5 text-[#024A7D]" />
                        Ampliar plazo
                    </DialogTitle>
                </DialogHeader>

                <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                    <p className="font-medium text-[#024A7D]">{installment.course_title}</p>
                    <p className="text-xs text-muted-foreground">
                        {concept}
                        {installment.installment_number ? ` #${installment.installment_number}` : ""} · Vence{" "}
                        {formatDate(installment.due_date)}
                    </p>
                </div>

                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Solo se puede ampliar el plazo una vez por cuota. Usalo con cuidado.
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="days" className="text-xs text-muted-foreground">
                            Dias de ampliacion
                        </Label>
                        <Input
                            id="days"
                            type="number"
                            min={1}
                            max={60}
                            className="mt-1"
                            value={data.days}
                            onChange={(e) => setData("days", e.target.value)}
                        />
                        {errors.days && <p className="mt-1 text-xs text-destructive">{errors.days}</p>}
                        {newDueDate && (
                            <p className="mt-1.5 text-xs text-muted-foreground">
                                Nuevo vencimiento: <span className="font-medium text-[#024A7D]">{formatDate(newDueDate)}</span>
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                            Ampliar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
