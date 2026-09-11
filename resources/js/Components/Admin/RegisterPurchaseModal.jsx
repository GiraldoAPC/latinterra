import { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { DatePicker } from "@/Components/ui/date-picker";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { Search, Camera, Package, Truck, UserPlus, X, Loader2, ShoppingBag } from "lucide-react";
import BarcodeCameraModal from "@/Components/Admin/BarcodeCameraModal";
import SupplierModal from "@/Components/Admin/SupplierModal";

function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

const DOCUMENT_TYPES = [
    { value: "factura", label: "Factura" },
    { value: "boleta", label: "Boleta" },
    { value: "guia_remision", label: "Guia de remision" },
    { value: "ticket", label: "Ticket" },
    { value: "otro", label: "Otro" },
];

const PAYMENT_METHODS = [
    { value: "efectivo", label: "Efectivo" },
    { value: "transferencia", label: "Transferencia bancaria" },
    { value: "yape", label: "Yape / Plin" },
    { value: "tarjeta", label: "Tarjeta" },
    { value: "otro", label: "Otro" },
];

/**
 * Registrar una compra: buscar/escanear el producto, buscar o dar de alta
 * el proveedor al vuelo, costo unitario y cantidad. Es el unico mecanismo
 * que sube el stock (ver Product::registerPurchase) - por eso muestra una
 * vista previa de como queda el stock y el costo promedio antes de enviar.
 */
export default function RegisterPurchaseModal({ open, onOpenChange, onSaved }) {
    const { settings } = usePage().props;
    const warehouseMode = settings?.warehouseMode ?? false;

    const [productQuery, setProductQuery] = useState("");
    const [productResults, setProductResults] = useState([]);
    const [productSearching, setProductSearching] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductCamera, setShowProductCamera] = useState(false);

    const [supplierQuery, setSupplierQuery] = useState("");
    const [supplierResults, setSupplierResults] = useState([]);
    const [supplierSearching, setSupplierSearching] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [showAddSupplier, setShowAddSupplier] = useState(false);

    const [documentType, setDocumentType] = useState("");
    const [documentNumber, setDocumentNumber] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [unitCost, setUnitCost] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [purchasedAt, setPurchasedAt] = useState(todayIso());
    const [notes, setNotes] = useState("");
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open) {
            setProductQuery("");
            setProductResults([]);
            setSelectedProduct(null);
            setSupplierQuery("");
            setSupplierResults([]);
            setSelectedSupplier(null);
            setDocumentType("");
            setDocumentNumber("");
            setPaymentMethod("");
            setUnitCost("");
            setQuantity("1");
            setPurchasedAt(todayIso());
            setNotes("");
            setError(null);
        }
    }, [open]);

    useEffect(() => {
        if (!open || productQuery.trim() === "") {
            setProductResults([]);
            return;
        }
        setProductSearching(true);
        const t = setTimeout(() => {
            window.axios
                .get("/admin/productos/buscar", { params: { q: productQuery } })
                .then((res) => setProductResults(res.data))
                .finally(() => setProductSearching(false));
        }, 300);
        return () => clearTimeout(t);
    }, [productQuery, open]);

    useEffect(() => {
        if (!open || supplierQuery.trim() === "") {
            setSupplierResults([]);
            return;
        }
        setSupplierSearching(true);
        const t = setTimeout(() => {
            window.axios
                .get("/admin/inventario/proveedores/buscar", { params: { q: supplierQuery } })
                .then((res) => setSupplierResults(res.data))
                .finally(() => setSupplierSearching(false));
        }, 300);
        return () => clearTimeout(t);
    }, [supplierQuery, open]);

    const selectProduct = (p) => {
        setSelectedProduct(p);
        setProductQuery("");
        setProductResults([]);
    };

    const onProductScan = (code) => {
        setShowProductCamera(false);
        window.axios.get("/admin/productos/buscar", { params: { q: code } }).then((res) => {
            const exact = res.data.find((p) => p.barcode === code || p.sku === code);
            if (exact) {
                selectProduct(exact);
            } else {
                setProductQuery(code);
                setError(`No se encontro ningun producto con el codigo "${code}".`);
            }
        });
    };

    const qty = parseInt(quantity, 10) || 0;
    const cost = parseFloat(unitCost) || 0;
    const total = qty * cost;
    // El costo promedio se calcula sobre el TOTAL (ventas + almacen), igual
    // que Product::registerPurchase - la compra entra a un lado u otro
    // segun el modo, pero el costo es uno solo para toda la mercaderia.
    const oldTotal = selectedProduct ? (selectedProduct.stock ?? 0) + (selectedProduct.stock_warehouse ?? 0) : 0;
    const newTotal = oldTotal + qty;
    const previewStock = selectedProduct ? (warehouseMode ? selectedProduct.stock ?? 0 : (selectedProduct.stock ?? 0) + qty) : 0;
    const previewWarehouse = selectedProduct ? (selectedProduct.stock_warehouse ?? 0) + qty : 0;
    const previewAvgCost =
        selectedProduct && qty > 0 && cost > 0
            ? oldTotal <= 0 || !selectedProduct.avg_cost
                ? cost
                : ((oldTotal * Number(selectedProduct.avg_cost)) + qty * cost) / newTotal
            : null;

    const canSubmit = selectedProduct && qty > 0 && cost > 0 && purchasedAt && !processing;

    const submit = () => {
        if (!canSubmit) return;
        setProcessing(true);
        setError(null);
        router.post(
            "/admin/inventario/movimientos",
            {
                product_id: selectedProduct.id,
                supplier_id: selectedSupplier?.id ?? null,
                document_type: documentType || null,
                document_number: documentNumber || null,
                payment_method: paymentMethod || null,
                unit_cost: cost,
                quantity: qty,
                purchased_at: purchasedAt,
                notes: notes || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    onSaved?.();
                },
                onError: (errors) => setError(Object.values(errors)[0]),
                onFinish: () => setProcessing(false),
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-w-2xl flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-4.5 w-4.5 text-[#024A7D]" />
                        Registrar compra
                    </DialogTitle>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-1 -m-1">
                    <div>
                        <Label className="text-xs text-muted-foreground">Producto</Label>
                        {selectedProduct ? (
                            <div className="mt-1 flex items-start justify-between gap-2 rounded-md bg-[#00ADEE]/10 px-3 py-2.5">
                                <div className="flex items-start gap-2 min-w-0">
                                    <Package className="mt-0.5 h-4 w-4 shrink-0 text-[#024A7D]" />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-[#024A7D]">{selectedProduct.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedProduct.sku && `SKU ${selectedProduct.sku} · `}
                                            {warehouseMode
                                                ? `Almacén: ${selectedProduct.stock_warehouse ?? 0} · Ventas: ${selectedProduct.stock ?? 0}`
                                                : `Stock actual: ${selectedProduct.stock ?? "sin control"}`}
                                        </p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setSelectedProduct(null)} className="shrink-0 text-muted-foreground hover:text-destructive">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative mt-1 flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        placeholder="Buscar por nombre, SKU o codigo de barras..."
                                        value={productQuery}
                                        onChange={(e) => setProductQuery(e.target.value)}
                                        autoFocus
                                    />
                                    {productQuery.trim() !== "" && (
                                        <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-52 overflow-y-auto rounded-md border bg-background shadow-lg">
                                            {productSearching && <p className="px-3 py-2 text-xs text-muted-foreground">Buscando...</p>}
                                            {!productSearching && productResults.length === 0 && (
                                                <p className="px-3 py-2 text-xs text-muted-foreground">Sin resultados.</p>
                                            )}
                                            {productResults.map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => selectProduct(p)}
                                                    className="lt-hover-sweep flex w-full items-center justify-between px-3 py-2.5 text-left text-sm"
                                                >
                                                    <span className="truncate">{p.name}</span>
                                                    <span className="shrink-0 text-xs text-muted-foreground">Stock: {p.stock ?? "-"}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Button type="button" variant="outline" size="icon" onClick={() => setShowProductCamera(true)} title="Escanear producto">
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">Proveedor (opcional)</Label>
                        {selectedSupplier ? (
                            <div className="mt-1 flex items-start justify-between gap-2 rounded-md bg-muted/50 px-3 py-2.5">
                                <div className="flex items-start gap-2 min-w-0">
                                    <Truck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    <p className="truncate text-sm font-medium">{selectedSupplier.name}</p>
                                </div>
                                <button type="button" onClick={() => setSelectedSupplier(null)} className="shrink-0 text-muted-foreground hover:text-destructive">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative mt-1 flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        placeholder="Buscar proveedor..."
                                        value={supplierQuery}
                                        onChange={(e) => setSupplierQuery(e.target.value)}
                                    />
                                    {supplierQuery.trim() !== "" && (
                                        <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-md border bg-background shadow-lg">
                                            {supplierSearching && <p className="px-3 py-2 text-xs text-muted-foreground">Buscando...</p>}
                                            {!supplierSearching && supplierResults.length === 0 && (
                                                <p className="px-3 py-2 text-xs text-muted-foreground">Sin resultados - usa el boton "+".</p>
                                            )}
                                            {supplierResults.map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedSupplier(s);
                                                        setSupplierQuery("");
                                                        setSupplierResults([]);
                                                    }}
                                                    className="lt-hover-sweep flex w-full items-center justify-between px-3 py-2.5 text-left text-sm"
                                                >
                                                    <span className="truncate">{s.name}</span>
                                                    {s.ruc && <span className="shrink-0 text-xs text-muted-foreground">{s.ruc}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Button type="button" variant="outline" size="icon" onClick={() => setShowAddSupplier(true)} title="Nuevo proveedor">
                                    <UserPlus className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div>
                            <Label className="text-xs text-muted-foreground">Comprobante (opcional)</Label>
                            <Select value={documentType} onValueChange={setDocumentType}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPES.map((d) => (
                                        <SelectItem key={d.value} value={d.value}>
                                            {d.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Serie y numero</Label>
                            <Input
                                className="mt-1"
                                placeholder="F001-00001234"
                                value={documentNumber}
                                onChange={(e) => setDocumentNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Costo unitario (S/)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                className="mt-1"
                                value={unitCost}
                                onChange={(e) => setUnitCost(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Cantidad</Label>
                            <Input type="number" min="1" className="mt-1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <Label className="text-xs text-muted-foreground">Fecha de compra</Label>
                            <DatePicker value={purchasedAt} onChange={setPurchasedAt} maxDate={new Date()} />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Forma de pago (opcional)</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_METHODS.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">Notas (opcional)</Label>
                        <Textarea className="mt-1" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>

                    {selectedProduct && qty > 0 && cost > 0 && (
                        <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/40 px-4 py-3 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">Total</p>
                                <p className="font-semibold text-[#024A7D]">S/ {total.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{warehouseMode ? "Almacén nuevo" : "Stock nuevo"}</p>
                                <p className="font-semibold text-[#024A7D]">{warehouseMode ? previewWarehouse : previewStock}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Costo prom. nuevo</p>
                                <p className="font-semibold text-[#024A7D]">S/ {previewAvgCost.toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                    {selectedProduct && warehouseMode && (
                        <p className="text-xs text-muted-foreground">
                            Esta compra entra a <strong>Almacén</strong> — usa "Transferir a Ventas" despues para poder venderlo.
                        </p>
                    )}

                    {error && <p className="text-xs text-destructive">{error}</p>}
                </div>

                <div className="flex shrink-0 justify-end gap-2 border-t pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={submit} disabled={!canSubmit}>
                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Registrar compra
                    </Button>
                </div>
            </DialogContent>

            <BarcodeCameraModal open={showProductCamera} onOpenChange={setShowProductCamera} onScan={onProductScan} />
            <SupplierModal open={showAddSupplier} onOpenChange={setShowAddSupplier} onSaved={(s) => setSelectedSupplier(s)} />
        </Dialog>
    );
}
