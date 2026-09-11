import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Loader2 } from "lucide-react";

const EMPTY = { name: "", ruc: "", phone: "", email: "", address: "" };

/**
 * Registro de proveedor - mismo patron que ClientModal.jsx: axios directo
 * (no Inertia useForm) para poder abrirse anidado dentro de "Registrar
 * compra" y devolver el proveedor recien creado sin cerrar ese modal.
 */
export default function SupplierModal({ open, onOpenChange, supplier, onSaved }) {
    const [data, setDataState] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const isEdit = !!supplier;

    const setData = (key, value) => setDataState((prev) => ({ ...prev, [key]: value }));

    useEffect(() => {
        if (open) {
            setDataState(
                supplier
                    ? {
                          name: supplier.name,
                          ruc: supplier.ruc ?? "",
                          phone: supplier.phone ?? "",
                          email: supplier.email ?? "",
                          address: supplier.address ?? "",
                      }
                    : EMPTY
            );
            setErrors({});
        }
    }, [open, supplier?.id]);

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        const request = isEdit
            ? window.axios.put(`/admin/inventario/proveedores/${supplier.id}`, data)
            : window.axios.post("/admin/inventario/proveedores", data);
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
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label className="text-xs text-muted-foreground">Nombre</Label>
                        <Input className="mt-1" value={data.name} onChange={(e) => setData("name", e.target.value)} />
                        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name[0]}</p>}
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">RUC (opcional)</Label>
                        <Input
                            className="mt-1"
                            maxLength={11}
                            inputMode="numeric"
                            value={data.ruc}
                            onChange={(e) => setData("ruc", e.target.value.replace(/\D/g, ""))}
                        />
                        {errors.ruc && <p className="mt-1 text-xs text-destructive">{errors.ruc[0]}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-muted-foreground">Telefono (opcional)</Label>
                            <Input className="mt-1" value={data.phone} onChange={(e) => setData("phone", e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Email (opcional)</Label>
                            <Input type="email" className="mt-1" value={data.email} onChange={(e) => setData("email", e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Direccion (opcional)</Label>
                        <Input className="mt-1" value={data.address} onChange={(e) => setData("address", e.target.value)} />
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
