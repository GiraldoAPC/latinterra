import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Plus, Building2, Pencil, Trash2 } from "lucide-react";
import ClientModal from "@/Components/Admin/ClientModal";

const TYPE_LABEL = { natural: "Natural", juridica: "Juridica" };

export default function Index({ clients }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const openNew = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (c) => {
        setEditing(c);
        setModalOpen(true);
    };

    const remove = (c) => {
        if (confirm(`¿Eliminar "${c.business_name}"?`)) {
            router.delete(`/admin/clientes/${c.id}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Clientes" />
            <AdminLayout title="Clientes">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-bold text-[#024A7D]">Clientes</h1>
                        <p className="text-sm text-muted-foreground">Empresas y personas con RUC para facturarles (simulado) desde una venta.</p>
                    </div>
                    <Button onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        Nuevo cliente
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {clients.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-14 text-center">
                                <Building2 className="h-10 w-10 text-slate-300" />
                                <p className="text-slate-500">Aun no hay clientes registrados.</p>
                                <p className="max-w-sm text-xs text-slate-400">
                                    Se registran automaticamente al facturarle a alguien nuevo desde "Vender producto", o puedes crearlos aca.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                            <th className="px-4 py-3">RUC</th>
                                            <th className="px-4 py-3">Razon social</th>
                                            <th className="px-4 py-3">Tipo</th>
                                            <th className="px-4 py-3">Telefono</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.map((c) => (
                                            <tr key={c.id} className="border-b last:border-0">
                                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.ruc}</td>
                                                <td className="px-4 py-3 font-medium text-[#024A7D]">{c.business_name}</td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                                        {TYPE_LABEL[c.type] ?? c.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{c.phone || "-"}</td>
                                                <td className="px-4 py-3 text-slate-500">{c.email || "-"}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button type="button" onClick={() => openEdit(c)} className="text-slate-500 hover:text-foreground">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button type="button" onClick={() => remove(c)} className="text-slate-500 hover:text-destructive">
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

            <ClientModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                client={editing}
                onSaved={() => router.reload({ only: ["clients"] })}
            />
        </>
    );
}
