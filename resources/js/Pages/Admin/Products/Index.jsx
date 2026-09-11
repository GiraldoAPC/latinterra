import { useEffect, useState } from "react";
import { Head, useForm, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Switch } from "@/Components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Plus, Package, Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react";
import BarcodeScanInput from "@/Components/Admin/BarcodeScanInput";

const NONE = "__none__";
const EMPTY = {
    category_id: "",
    brand_id: "",
    name: "",
    sku: "",
    barcode: "",
    color: "",
    size: "",
    price: "",
    min_stock: "",
    is_active: true,
};

function isLowStock(p) {
    return p.stock !== null && p.stock <= (p.min_stock ?? 5);
}

function inventoryValue(p) {
    if (p.stock === null || !p.avg_cost) return null;
    return ((p.stock ?? 0) + (p.stock_warehouse ?? 0)) * Number(p.avg_cost);
}

function ProductModal({ open, onOpenChange, product, categories, brands, onOpenExisting }) {
    const { settings } = usePage().props;
    const warehouseMode = settings?.warehouseMode ?? false;
    const { data, setData, post, put, processing, errors, clearErrors } = useForm(EMPTY);
    const isEdit = !!product;
    const [barcodeMatch, setBarcodeMatch] = useState(null);
    const [checkingBarcode, setCheckingBarcode] = useState(false);

    useEffect(() => {
        if (open) {
            setData(
                product
                    ? {
                          category_id: product.category_id ?? "",
                          brand_id: product.brand_id ?? "",
                          name: product.name,
                          sku: product.sku ?? "",
                          barcode: product.barcode ?? "",
                          color: product.color ?? "",
                          size: product.size ?? "",
                          price: product.price,
                          min_stock: product.min_stock ?? "",
                          is_active: product.is_active,
                      }
                    : EMPTY
            );
            clearErrors();
            setBarcodeMatch(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, product?.id]);

    // Al escanear (no en cada tecla) mientras se esta creando, busca si ese
    // codigo ya pertenece a otro producto - evita registrar un duplicado
    // sin querer y ofrece abrir el producto existente en su lugar.
    const handleBarcodeScan = (code) => {
        setData("barcode", code);
        if (isEdit || !code) {
            setBarcodeMatch(null);
            return;
        }
        setCheckingBarcode(true);
        window.axios
            .get("/admin/productos/buscar", { params: { q: code } })
            .then((res) => setBarcodeMatch(res.data.find((p) => p.barcode === code) ?? null))
            .finally(() => setCheckingBarcode(false));
    };

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: () => onOpenChange(false) };
        if (isEdit) {
            put(`/admin/products/${product.id}`, opts);
        } else {
            post("/admin/products", opts);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-4.5 w-4.5 text-[#024A7D]" />
                        {isEdit ? "Editar producto" : "Nuevo producto"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    {!isEdit && (
                        <div className="rounded-lg border border-dashed border-[#00ADEE]/40 bg-[#00ADEE]/5 p-3">
                            <Label className="text-xs font-medium text-[#024A7D]">
                                Empieza escaneando el codigo de barras (opcional)
                            </Label>
                            <div className="mt-1">
                                <BarcodeScanInput
                                    value={data.barcode}
                                    onChange={(v) => {
                                        setData("barcode", v);
                                        setBarcodeMatch(null);
                                    }}
                                    onScan={handleBarcodeScan}
                                    placeholder="Escanea o escribe el codigo..."
                                    autoFocus
                                />
                            </div>
                            {errors.barcode && <p className="mt-1 text-xs text-destructive">{errors.barcode}</p>}
                            {checkingBarcode && <p className="mt-1.5 text-xs text-muted-foreground">Buscando si ya existe...</p>}
                            {barcodeMatch && (
                                <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2 shadow-sm">
                                    <p className="text-xs text-[#14264a]">
                                        Ya existe: <strong>{barcodeMatch.name}</strong> (stock: {barcodeMatch.stock ?? "sin control"})
                                    </p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onOpenExisting?.(barcodeMatch)}
                                    >
                                        Editar ese producto
                                    </Button>
                                </div>
                            )}
                            {!checkingBarcode && !barcodeMatch && data.barcode && (
                                <p className="mt-1.5 text-xs text-muted-foreground">
                                    No hay ningun producto con este codigo - sigue llenando el formulario para crearlo.
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="name" className="text-xs text-muted-foreground">
                            Nombre
                        </Label>
                        <Input id="name" className="mt-1" value={data.name} onChange={(e) => setData("name", e.target.value)} autoFocus={isEdit} />
                        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                            <Label className="text-xs text-muted-foreground">Categoria</Label>
                            <Select
                                value={data.category_id ? String(data.category_id) : NONE}
                                onValueChange={(v) => setData("category_id", v === NONE ? "" : v)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Sin categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NONE}>Sin categoria</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Marca</Label>
                            <Select
                                value={data.brand_id ? String(data.brand_id) : NONE}
                                onValueChange={(v) => setData("brand_id", v === NONE ? "" : v)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Sin marca" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NONE}>Sin marca</SelectItem>
                                    {brands.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)}>
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="color" className="text-xs text-muted-foreground">
                                Color
                            </Label>
                            <Input id="color" className="mt-1" value={data.color} onChange={(e) => setData("color", e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="size" className="text-xs text-muted-foreground">
                                Talla
                            </Label>
                            <Input id="size" className="mt-1" value={data.size} onChange={(e) => setData("size", e.target.value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="sku" className="text-xs text-muted-foreground">
                                SKU / codigo interno (opcional)
                            </Label>
                            <Input id="sku" className="mt-1" value={data.sku} onChange={(e) => setData("sku", e.target.value)} />
                        </div>
                        {isEdit && (
                            <div>
                                <Label className="text-xs text-muted-foreground">Codigo de barras (opcional)</Label>
                                <div className="mt-1">
                                    <BarcodeScanInput value={data.barcode} onChange={(v) => setData("barcode", v)} placeholder="Escanea o escribe..." />
                                </div>
                                {errors.barcode && <p className="mt-1 text-xs text-destructive">{errors.barcode}</p>}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="price" className="text-xs text-muted-foreground">
                                Precio de venta (S/)
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                className="mt-1"
                                value={data.price}
                                onChange={(e) => setData("price", e.target.value)}
                            />
                            {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price}</p>}
                        </div>
                        <div>
                            <Label htmlFor="min_stock" className="text-xs text-muted-foreground">
                                Stock minimo antes de avisar
                            </Label>
                            <Input
                                id="min_stock"
                                type="number"
                                min="0"
                                placeholder="5"
                                className="mt-1"
                                value={data.min_stock}
                                onChange={(e) => setData("min_stock", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
                        <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                            {isEdit ? (
                                <>
                                    {warehouseMode ? (
                                        <>
                                            Almacén: <strong className="text-[#024A7D]">{product.stock_warehouse ?? 0}</strong> · Ventas:{" "}
                                            <strong className="text-[#024A7D]">{product.stock ?? 0}</strong>
                                        </>
                                    ) : (
                                        <>
                                            Stock actual: <strong className="text-[#024A7D]">{product.stock ?? "sin control"}</strong>
                                        </>
                                    )}
                                    {product.avg_cost && (
                                        <>
                                            {" "}
                                            · Costo prom.: <strong className="text-[#024A7D]">S/ {Number(product.avg_cost).toFixed(2)}</strong>
                                        </>
                                    )}
                                    <br />
                                    Sube registrando una compra en Inventario → Movimientos.
                                </>
                            ) : (
                                "El stock inicial se carga registrando una compra en Inventario → Movimientos, despues de crear el producto."
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 sm:justify-start">
                            <span className="text-sm">Activo</span>
                            <Switch checked={data.is_active} onCheckedChange={(v) => setData("is_active", v)} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
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

export default function Index({ products, categories, brands }) {
    const { settings } = usePage().props;
    const warehouseMode = settings?.warehouseMode ?? false;
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const lowStockProducts = products.filter(isLowStock);

    const openNew = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (p) => {
        setEditing(p);
        setModalOpen(true);
    };

    const remove = (p) => {
        if (confirm(`¿Eliminar "${p.name}"?`)) {
            router.delete(`/admin/products/${p.id}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Productos" />
            <AdminLayout title="Productos">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-bold text-[#024A7D]">Productos</h1>
                        <p className="text-sm text-muted-foreground">Catalogo e inventario — vender a estudiantes desde su perfil.</p>
                    </div>
                    <Button onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        Nuevo producto
                    </Button>
                </div>

                {lowStockProducts.length > 0 && (
                    <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                        <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-600" />
                        <div>
                            <p className="text-sm font-semibold text-red-800">Stock bajo</p>
                            <p className="text-xs text-red-700">
                                {lowStockProducts.map((p) => `${p.name} (${p.stock})`).join(", ")}
                            </p>
                        </div>
                    </div>
                )}

                <Card>
                    <CardContent className="p-0">
                        {products.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-14 text-center">
                                <Package className="h-10 w-10 text-slate-300" />
                                <p className="text-slate-500">Aun no hay productos registrados.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                            <th className="px-4 py-3">Nombre</th>
                                            <th className="px-4 py-3">Categoria</th>
                                            <th className="px-4 py-3">Marca</th>
                                            <th className="px-4 py-3">Precio</th>
                                            {warehouseMode && <th className="px-4 py-3">Almacén</th>}
                                            <th className="px-4 py-3">{warehouseMode ? "Ventas" : "Stock"}</th>
                                            <th className="px-4 py-3">Valor inventario</th>
                                            <th className="px-4 py-3">Estado</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((p) => {
                                            const value = inventoryValue(p);
                                            return (
                                                <tr key={p.id} className="border-b last:border-0">
                                                    <td className="px-4 py-3 font-medium text-[#024A7D]">
                                                        {p.name}
                                                        {p.sku && <span className="ml-1.5 text-xs text-slate-400">({p.sku})</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">{p.category?.name || "-"}</td>
                                                    <td className="px-4 py-3 text-slate-500">{p.brand?.name || "-"}</td>
                                                    <td className="px-4 py-3">S/ {Number(p.price).toFixed(2)}</td>
                                                    {warehouseMode && <td className="px-4 py-3 text-slate-700">{p.stock_warehouse ?? 0}</td>}
                                                    <td className="px-4 py-3">
                                                        {p.stock === null ? (
                                                            <span className="text-slate-500">Sin control</span>
                                                        ) : (
                                                            <span
                                                                className={`inline-flex items-center gap-1 font-medium ${isLowStock(p) ? "text-red-600" : "text-slate-700"}`}
                                                            >
                                                                {isLowStock(p) && <AlertTriangle className="h-3.5 w-3.5" />}
                                                                {p.stock}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">{value !== null ? `S/ ${value.toFixed(2)}` : "-"}</td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.is_active ? "bg-[#00ADEE]/15 text-[#024A7D]" : "bg-muted text-muted-foreground"}`}
                                                        >
                                                            {p.is_active ? "Activo" : "Inactivo"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-3">
                                                            <button type="button" onClick={() => openEdit(p)} className="text-slate-500 hover:text-foreground">
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button type="button" onClick={() => remove(p)} className="text-slate-500 hover:text-destructive">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </AdminLayout>

            <ProductModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                product={editing}
                categories={categories}
                brands={brands}
                onOpenExisting={openEdit}
            />
        </>
    );
}
