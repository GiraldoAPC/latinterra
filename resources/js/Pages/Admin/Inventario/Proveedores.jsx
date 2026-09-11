import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Plus, Truck, Pencil, Trash2 } from "lucide-react";
import SupplierModal from "@/Components/Admin/SupplierModal";

export default function Proveedores({ suppliers }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const openNew = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (s) => {
        setEditing(s);
        setModalOpen(true);
    };

    const remove = (s) => {
        if (confirm(`¿Eliminar "${s.name}"?`)) {
            router.delete(`/admin/inventario/proveedores/${s.id}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Proveedores" />
            <AdminLayout title="Proveedores">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-bold text-[#024A7D]">Proveedores</h1>
                        <p className="text-sm text-muted-foreground">A quien le compras el inventario.</p>
                    </div>
                    <Button onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        Nuevo proveedor
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {suppliers.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-14 text-center">
                                <Truck className="h-10 w-10 text-slate-300" />
                                <p className="text-slate-500">Aun no hay proveedores registrados.</p>
                                <p className="max-w-sm text-xs text-slate-400">
                                    Se registran automaticamente al agregar uno nuevo desde "Registrar compra", o puedes crearlos aca.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                            <th className="px-4 py-3">Nombre</th>
                                            <th className="px-4 py-3">RUC</th>
                                            <th className="px-4 py-3">Telefono</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {suppliers.map((s) => (
                                            <tr key={s.id} className="border-b last:border-0">
                                                <td className="px-4 py-3 font-medium text-[#024A7D]">{s.name}</td>
                                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.ruc || "-"}</td>
                                                <td className="px-4 py-3 text-slate-500">{s.phone || "-"}</td>
                                                <td className="px-4 py-3 text-slate-500">{s.email || "-"}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button type="button" onClick={() => openEdit(s)} className="text-slate-500 hover:text-foreground">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button type="button" onClick={() => remove(s)} className="text-slate-500 hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </AdminLayout>

            <SupplierModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                supplier={editing}
                onSaved={() => router.reload({ only: ["suppliers"] })}
            />
        </>
    );
}
