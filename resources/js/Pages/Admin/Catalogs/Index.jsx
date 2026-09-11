import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { cn } from "@/lib/utils";
import { ListChecks, Plus, Pencil, Trash2, GripVertical } from "lucide-react";

function Field({ label, htmlFor, error, children }) {
    return (
        <div>
            <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
                {label}
            </Label>
            <div className="mt-1">{children}</div>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
    );
}

const EMPTY = { code: "", label: "", pattern: "", error_message: "", sort_order: 0, is_active: true };

function OptionFormModal({ open, onOpenChange, group, groupMeta, option }) {
    const isEdit = !!option;
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm(
        option
            ? {
                  code: option.code,
                  label: option.label,
                  pattern: option.pattern ?? "",
                  error_message: option.error_message ?? "",
                  sort_order: option.sort_order ?? 0,
                  is_active: option.is_active,
              }
            : { ...EMPTY, group }
    );

    const close = () => {
        onOpenChange(false);
        reset();
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/catalogos/${option.id}`, { preserveScroll: true, onSuccess: close });
        } else {
            post("/admin/catalogos", { preserveScroll: true, onSuccess: close });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Editar opcion" : "Nueva opcion"}</DialogTitle>
                    <DialogDescription>{groupMeta?.label}</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Codigo (interno)" htmlFor="code" error={errors.code}>
                            <Input
                                id="code"
                                placeholder="ej. vigente"
                                disabled={isEdit}
                                value={data.code}
                                onChange={(e) => setData("code", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                            />
                        </Field>
                        <Field label="Orden" htmlFor="sort_order" error={errors.sort_order}>
                            <Input
                                id="sort_order"
                                type="number"
                                min={0}
                                value={data.sort_order}
                                onChange={(e) => setData("sort_order", e.target.value)}
                            />
                        </Field>
                    </div>

                    <Field label="Etiqueta (lo que ve el usuario)" htmlFor="label" error={errors.label}>
                        <Input id="label" value={data.label} onChange={(e) => setData("label", e.target.value)} />
                    </Field>

                    {groupMeta?.withPattern && (
                        <>
                            <Field label="Formato (expresion regular, opcional)" htmlFor="pattern" error={errors.pattern}>
                                <Input
                                    id="pattern"
                                    placeholder="/^\d{8}$/"
                                    value={data.pattern}
                                    onChange={(e) => setData("pattern", e.target.value)}
                                />
                            </Field>
                            <Field label="Mensaje de error si no cumple el formato" htmlFor="error_message" error={errors.error_message}>
                                <Input
                                    id="error_message"
                                    value={data.error_message}
                                    onChange={(e) => setData("error_message", e.target.value)}
                                />
                            </Field>
                        </>
                    )}

                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                        <div>
                            <Label htmlFor="is_active" className="cursor-pointer text-sm">
                                Activa
                            </Label>
                            <p className="text-xs text-muted-foreground">Si la desactivas, deja de aparecer en el select.</p>
                        </div>
                        <Switch id="is_active" checked={data.is_active} onCheckedChange={(v) => setData("is_active", v)} />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={close}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEdit ? "Guardar cambios" : "Agregar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function CatalogsIndex({ groups, options }) {
    const groupKeys = Object.keys(groups);
    const [activeGroup, setActiveGroup] = useState(groupKeys[0]);
    const [modal, setModal] = useState(null); // { option: null | row }

    const rows = options[activeGroup] ?? [];
    const meta = groups[activeGroup];

    const handleDelete = (row) => {
        if (!confirm(`¿Eliminar la opcion "${row.label}"? Si algun estudiante ya la tiene guardada, seguira viendola como texto suelto.`)) return;
        router.delete(`/admin/catalogos/${row.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Catalogos" />
            <AdminLayout title="Catalogos">
                <div className="mb-4">
                    <h1 className="flex items-center gap-2 text-lg font-semibold">
                        <ListChecks className="h-5 w-5 text-[#024A7D]" />
                        Catalogos del sistema
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Administra las opciones de los selects fijos (tipo de documento, genero, SCTR...) sin
                        depender de un cambio de codigo.
                    </p>
                </div>

                <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg border bg-muted/40 p-1">
                    {groupKeys.map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveGroup(key)}
                            className={cn(
                                "lt-hover-sweep relative shrink-0 overflow-hidden rounded-md px-4 py-2 text-sm font-medium",
                                activeGroup === key
                                    ? "bg-white text-[#024A7D] shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {groups[key].label}
                        </button>
                    ))}
                </div>

                <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {rows.length} {rows.length === 1 ? "opcion" : "opciones"} en {meta?.label}
                    </p>
                    <Button size="sm" onClick={() => setModal({ option: null })}>
                        <Plus className="h-4 w-4" />
                        Nueva opcion
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10"></TableHead>
                                <TableHead>Etiqueta</TableHead>
                                <TableHead>Codigo</TableHead>
                                {meta?.withPattern && <TableHead>Formato</TableHead>}
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                        Sin opciones todavia.
                                    </TableCell>
                                </TableRow>
                            )}
                            {rows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                                    </TableCell>
                                    <TableCell className="font-medium">{row.label}</TableCell>
                                    <TableCell>
                                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.code}</code>
                                    </TableCell>
                                    {meta?.withPattern && (
                                        <TableCell>
                                            {row.pattern ? (
                                                <code className="text-xs text-muted-foreground">{row.pattern}</code>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Sin validar</span>
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Badge variant={row.is_active ? "default" : "secondary"}>
                                            {row.is_active ? "Activa" : "Inactiva"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" onClick={() => setModal({ option: row })}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(row)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </AdminLayout>

            {modal && (
                <OptionFormModal
                    open={!!modal}
                    onOpenChange={(v) => !v && setModal(null)}
                    group={activeGroup}
                    groupMeta={meta}
                    option={modal.option}
                />
            )}
        </>
    );
}
