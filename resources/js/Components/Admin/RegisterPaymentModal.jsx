import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { Loader2, Wallet, Search, Building2, X, Plus } from "lucide-react";
import ClientModal from "@/Components/Admin/ClientModal";

const METHODS = [
    { value: "efectivo", label: "Efectivo" },
    { value: "transferencia", label: "Transferencia bancaria" },
    { value: "yape", label: "Yape / Plin" },
    { value: "tarjeta", label: "Tarjeta" },
    { value: "otro", label: "Otro" },
];

const DOCUMENT_TYPES = [
    { value: "ticket", label: "Ticket interno" },
    { value: "boleta", label: "Boleta (simulada)" },
    { value: "factura", label: "Factura (simulada)" },
];

const TYPE_LABELS = { matricula: "Matricula", mensualidad: "Mensualidad" };

/**
 * Registrar el pago de una cuota (matricula o mensualidad) con su metodo,
 * referencia y tipo de comprobante (ticket/boleta/factura simulada) - mismo
 * criterio que la venta de productos, para que el ticket impreso salga con
 * el comprobante correcto.
 */
export default function RegisterPaymentModal({ open, onOpenChange, studentId, installment, onPaid }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        payment_method: "",
        payment_reference: "",
        document_type: "ticket",
        client_id: null,
        buyer_ruc: "",
        buyer_business_name: "",
    });
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientQuery, setClientQuery] = useState("");
    const [clientResults, setClientResults] = useState([]);
    const [clientSearching, setClientSearching] = useState(false);
    const [showAddClient, setShowAddClient] = useState(false);

    useEffect(() => {
        if (open) {
            reset();
            clearErrors();
            setSelectedClient(null);
            setClientQuery("");
            setClientResults([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, installment?.id]);

    useEffect(() => {
        if (!open || clientQuery.trim() === "") {
            setClientResults([]);
            return;
        }
        setClientSearching(true);
        const t = setTimeout(() => {
            window.axios
                .get("/admin/clientes/buscar", { params: { q: clientQuery } })
                .then((res) => setClientResults(res.data))
                .finally(() => setClientSearching(false));
        }, 300);
        return () => clearTimeout(t);
    }, [clientQuery, open]);

    if (!installment) return null;

    const concept = TYPE_LABELS[installment.type] ?? installment.type;

    const selectClient = (client) => {
        setSelectedClient(client);
        setData((d) => ({ ...d, client_id: client.id, buyer_ruc: client.ruc, buyer_business_name: client.business_name }));
        setClientQuery("");
        setClientResults([]);
        setShowAddClient(false);
    };

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

                    <div>
                        <Label className="text-xs text-muted-foreground">Tipo de comprobante</Label>
                        <Select value={data.document_type} onValueChange={(v) => setData("document_type", v)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DOCUMENT_TYPES.map((d) => (
                                    <SelectItem key={d.value} value={d.value}>
                                        {d.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {data.document_type !== "ticket" && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Documento referencial - todavia no esta conectado a SUNAT, no tiene validez tributaria.
                            </p>
                        )}
                    </div>

                    {data.document_type === "factura" && (
                        <div className="space-y-3 rounded-lg border border-dashed p-3">
                            {selectedClient ? (
                                <div className="flex items-start justify-between gap-2 rounded-md bg-[#00ADEE]/10 px-3 py-2.5">
                                    <div className="flex min-w-0 items-start gap-2">
                                        <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#024A7D]" />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-[#024A7D]">{selectedClient.business_name}</p>
                                            <p className="text-xs text-muted-foreground">RUC {selectedClient.ruc}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedClient(null);
                                            setData((d) => ({ ...d, client_id: null, buyer_ruc: "", buyer_business_name: "" }));
                                        }}
                                        className="shrink-0 text-muted-foreground hover:text-destructive"
                                        title="Cambiar cliente"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Label className="text-xs text-muted-foreground">Cliente (para la factura)</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                className="pl-9"
                                                placeholder="Buscar por RUC o razon social..."
                                                value={clientQuery}
                                                onChange={(e) => setClientQuery(e.target.value)}
                                            />
                                            {clientQuery.trim() !== "" && (
                                                <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-md border bg-background shadow-lg">
                                                    {clientSearching && (
                                                        <p className="px-3 py-2 text-xs text-muted-foreground">Buscando...</p>
                                                    )}
                                                    {!clientSearching && clientResults.length === 0 && (
                                                        <p className="px-3 py-2 text-xs text-muted-foreground">
                                                            Sin resultados - usa el boton "+" para registrarlo.
                                                        </p>
                                                    )}
                                                    {clientResults.map((c) => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => selectClient(c)}
                                                            className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted"
                                                        >
                                                            <span className="font-medium text-[#024A7D]">{c.business_name}</span>
                                                            <span className="text-xs text-muted-foreground">RUC {c.ruc}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <Button type="button" variant="outline" size="icon" onClick={() => setShowAddClient(true)} title="Nuevo cliente">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {errors.buyer_ruc && <p className="text-xs text-destructive">{errors.buyer_ruc}</p>}
                                </>
                            )}
                        </div>
                    )}

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

            <ClientModal open={showAddClient} onOpenChange={setShowAddClient} onSaved={(client) => selectClient(client)} />
        </Dialog>
    );
}
