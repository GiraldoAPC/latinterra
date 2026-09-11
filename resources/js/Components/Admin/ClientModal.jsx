import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { Loader2 } from "lucide-react";

const EMPTY = { type: "juridica", ruc: "", dni: "", business_name: "", address: "", phone: "", email: "" };

/**
 * Registro de cliente con RUC (para facturarle, simulado) - persona
 * juridica (empresa) o natural con negocio. Componente compartido: se usa
 * tal cual tanto en /admin/clientes (CRUD) como abierto encima del modal
 * de venta cuando no se encuentra el cliente al buscar (por eso usa axios
 * directo en vez de Inertia useForm - necesita el cliente recien creado de
 * vuelta para poder seleccionarlo al toque, sin cerrar el modal de venta).
 */
export default function ClientModal({ open, onOpenChange, client, onSaved }) {
    const [data, setDataState] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const isEdit = !!client;

    const setData = (key, value) => setDataState((prev) => ({ ...prev, [key]: value }));

    useEffect(() => {
        if (open) {
            setDataState(
                client
                    ? {
                          type: client.type ?? "juridica",
                          ruc: client.ruc,
                          dni: client.dni ?? "",
                          business_name: client.business_name,
                          address: client.address ?? "",
                          phone: client.phone ?? "",
                          email: client.email ?? "",
                      }
                    : EMPTY
            );
            setErrors({});
        }
    }, [open, client?.id]);

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        const request = isEdit ? window.axios.put(`/admin/clientes/${client.id}`, data) : window.axios.post("/admin/clientes", data);
        request
            .then((res) => {
                onOpenChange(false);
                onSaved?.(res.data);
            })
            .catch((err) => {
                if (err.response?.status === 422) {
                    setErrors(err.response.data.errors ?? {});
                }
            })
            .finally(() => setProcessing(false));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label className="text-xs text-muted-foreground">Tipo de cliente</Label>
                        <Select value={data.type} onValueChange={(v) => setData("type", v)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="juridica">Juridica (empresa)</SelectItem>
                                <SelectItem value="natural">Natural (con negocio)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-muted-foreground">RUC</Label>
                            <Input
                                className="mt-1"
                                maxLength={11}
                                inputMode="numeric"
                                value={data.ruc}
                                onChange={(e) => setData("ruc", e.target.value.replace(/\D/g, ""))}
                            />
                            {errors.ruc && <p className="mt-1 text-xs text-destructive">{errors.ruc[0]}</p>}
                        </div>
                        {data.type === "natural" && (
                            <div>
                                <Label className="text-xs text-muted-foreground">DNI (opcional)</Label>
                                <Input
                                    className="mt-1"
                                    maxLength={8}
                                    inputMode="numeric"
                                    value={data.dni}
                                    onChange={(e) => setData("dni", e.target.value.replace(/\D/g, ""))}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">
                            {data.type === "natural" ? "Nombres y apellidos" : "Razon social"}
                        </Label>
                        <Input className="mt-1" value={data.business_name} onChange={(e) => setData("business_name", e.target.value)} />
                        {errors.business_name && <p className="mt-1 text-xs text-destructive">{errors.business_name[0]}</p>}
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">Direccion (opcional)</Label>
                        <Input className="mt-1" value={data.address} onChange={(e) => setData("address", e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-muted-foreground">Telefono (opcional)</Label>
                            <Input className="mt-1" value={data.phone} onChange={(e) => setData("phone", e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Email (opcional)</Label>
                            <Input
                                type="email"
                                className="mt-1"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                            />
                            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email[0]}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
