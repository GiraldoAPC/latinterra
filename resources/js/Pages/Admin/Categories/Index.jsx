import { useEffect, useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Switch } from "@/Components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Plus, Tags, Pencil, Trash2, Loader2 } from "lucide-react";

const EMPTY = { name: "", is_active: true };

function CategoryModal({ open, onOpenChange, category }) {
    const { data, setData, post, put, processing, errors, clearErrors } = useForm(EMPTY);
    const isEdit = !!category;

    useEffect(() => {
        if (open) {
            setData(category ? { name: category.name, is_active: category.is_active } : EMPTY);
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, category?.id]);

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: () => onOpenChange(false) };
        if (isEdit) {
            put(`/admin/categories/${category.id}`, opts);
        } else {
            post("/admin/categories", opts);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Editar categoria" : "Nueva categoria"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="name" className="text-xs text-muted-foreground">
                            Nombre
                        </Label>
                        <Input id="name" className="mt-1" value={data.name} onChange={(e) => setData("name", e.target.value)} autoFocus />
                        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                        <span className="text-sm">Activa (disponible para productos)</span>
                        <Switch checked={data.is_active} onCheckedChange={(v) => setData("is_active", v)} />
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

export default function Index({ categories }) {
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
        if (confirm(`¿Eliminar "${c.name}"?`)) {
            router.delete(`/admin/categories/${c.id}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Categorías" />
            <AdminLayout title="Categorías">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-bold text-[#024A7D]">Categorías</h1>
                        <p className="text-sm text-muted-foreground">Clasificacion de productos del inventario.</p>
                    </div>
                    <Button onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        Nueva categoria
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {categories.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-14 text-center">
                                <Tags className="h-10 w-10 text-slate-300" />
                                <p className="text-slate-500">Aun no hay categorias registradas.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                            <th className="px-4 py-3">Nombre</th>
                                            <th className="px-4 py-3">Estado</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((c) => (
                                            <tr key={c.id} className="border-b last:border-0">
                                                <td className="px-4 py-3 font-medium text-[#024A7D]">{c.name}</td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.is_active ? "bg-[#00ADEE]/15 text-[#024A7D]" : "bg-muted text-muted-foreground"}`}
                                                    >
                                                        {c.is_active ? "Activa" : "Inactiva"}
                                                    </span>
                                                </td>
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

            <CategoryModal open={modalOpen} onOpenChange={setModalOpen} category={editing} />
        </>
    );
}
