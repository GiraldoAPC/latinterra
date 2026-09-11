import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { Loader2, ShoppingBag } from "lucide-react";

const TYPES = [
    { value: "producto", label: "Venta de producto" },
    { value: "otro", label: "Otro concepto" },
];

const METHODS = [
    { value: "efectivo", label: "Efectivo" },
    { value: "transferencia", label: "Transferencia bancaria" },
    { value: "yape", label: "Yape / Plin" },
    { value: "tarjeta", label: "Tarjeta" },
    { value: "otro", label: "Otro" },
];

const EMPTY = {
    type: "producto",
    concept: "",
    description: "",
    amount: "",
    buyer_name: "",
    payment_method: "",
    payment_reference: "",
};

/** Registrar un pago ajeno a un curso (venta de producto u otro concepto). */
export default function RegisterOtherPaymentModal({ open, onOpenChange, onRegistered }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm(EMPTY);

    useEffect(() => {
        if (open) {
            reset();
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const submit = (e) => {
        e.preventDefault();
        post("/admin/ventas/otros-pagos", {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                onRegistered?.();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-4.5 w-4.5 text-[#024A7D]" />
                        Registrar pago
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="type" className="text-xs text-muted-foreground">
                            Tipo
                        </Label>
                        <Select value={data.type} onValueChange={(v) => setData("type", v)}>
                            <SelectTrigger id="type" className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="concept" className="text-xs text-muted-foreground">
                            Concepto
                        </Label>
                        <Input
                            id="concept"
                            className="mt-1"
                            placeholder="Ej. Casco de seguridad x2"
                            value={data.concept}
                            onChange={(e) => setData("concept", e.target.value)}
                        />
                        {errors.concept && <p className="mt-1 text-xs text-destructive">{errors.concept}</p>}
                    </div>

                    <div>
                        <Label htmlFor="amount" className="text-xs text-muted-foreground">
                            Monto (S/)
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            className="mt-1"
                            value={data.amount}
                            onChange={(e) => setData("amount", e.target.value)}
                        />
                        {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount}</p>}
                    </div>

                    <div>
                        <Label htmlFor="buyer_name" className="text-xs text-muted-foreground">
                            Cliente (opcional)
                        </Label>
                        <Input
                            id="buyer_name"
                            className="mt-1"
                            placeholder="Nombre del cliente"
                            value={data.buyer_name}
                            onChange={(e) => setData("buyer_name", e.target.value)}
                        />
                    </div>

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

                    <div>
                        <Label htmlFor="description" className="text-xs text-muted-foreground">
                            Detalle adicional (opcional)
                        </Label>
                        <Textarea
                            id="description"
                            className="mt-1"
                            rows={2}
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                            Registrar pago
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
