import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Search, Camera, Package, X, Loader2, ArrowRightLeft, AlertTriangle } from "lucide-react";
import BarcodeCameraModal from "@/Components/Admin/BarcodeCameraModal";

/**
 * Transferir de Almacen a Ventas - solo tiene sentido con el modo almacen
 * activo (ver Settings). Mismo patron de busqueda/escaneo que
 * RegisterPurchaseModal, pero sin proveedor ni costo (es la misma
 * mercaderia, solo cambia de lugar).
 */
export default function TransferStockModal({ open, onOpenChange, onSaved }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [quantity, setQuantity] = useState("1");
    const [notes, setNotes] = useState("");
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open) {
            setQuery("");
            setResults([]);
            setSelectedProduct(null);
            setQuantity("1");
            setNotes("");
            setError(null);
        }
    }, [open]);

    useEffect(() => {
        if (!open || query.trim() === "") {
            setResults([]);
            return;
        }
        setSearching(true);
        const t = setTimeout(() => {
            window.axios
                .get("/admin/productos/buscar", { params: { q: query } })
                .then((res) => setResults(res.data))
                .finally(() => setSearching(false));
        }, 300);
        return () => clearTimeout(t);
    }, [query, open]);

    const selectProduct = (p) => {
        setSelectedProduct(p);
        setQuery("");
        setResults([]);
    };

    const onScan = (code) => {
        setShowCamera(false);
        window.axios.get("/admin/productos/buscar", { params: { q: code } }).then((res) => {
            const exact = res.data.find((p) => p.barcode === code || p.sku === code);
            if (exact) {
                selectProduct(exact);
            } else {
                setQuery(code);
            }
        });
    };

    const available = selectedProduct?.stock_warehouse ?? 0;
    const qty = parseInt(quantity, 10) || 0;
    const overAvailable = selectedProduct && qty > available;
    const canSubmit = selectedProduct && qty > 0 && !overAvailable && !processing;

    const submit = () => {
        if (!canSubmit) return;
        setProcessing(true);
        setError(null);
        router.post(
            "/admin/inventario/transferencias",
            { product_id: selectedProduct.id, quantity: qty, notes: notes || null },
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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowRightLeft className="h-4.5 w-4.5 text-[#024A7D]" />
                        Transferir a Ventas
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label className="text-xs text-muted-foreground">Producto</Label>
                        {selectedProduct ? (
                            <div className="mt-1 flex items-start justify-between gap-2 rounded-md bg-[#00ADEE]/10 px-3 py-2.5">
                                <div className="flex items-start gap-2 min-w-0">
                                    <Package className="mt-0.5 h-4 w-4 shrink-0 text-[#024A7D]" />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-[#024A7D]">{selectedProduct.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Almacén: {available} · Ventas: {selectedProduct.stock ?? 0}
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
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        autoFocus
                                    />
                                    {query.trim() !== "" && (
                                        <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-52 overflow-y-auto rounded-md border bg-background shadow-lg">
                                            {searching && <p className="px-3 py-2 text-xs text-muted-foreground">Buscando...</p>}
                                            {!searching && results.length === 0 && (
                                                <p className="px-3 py-2 text-xs text-muted-foreground">Sin resultados.</p>
                                            )}
                                            {results.map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => selectProduct(p)}
                                                    className="lt-hover-sweep flex w-full items-center justify-between px-3 py-2.5 text-left text-sm"
                                                >
                                                    <span className="truncate">{p.name}</span>
                                                    <span className="shrink-0 text-xs text-muted-foreground">Almacén: {p.stock_warehouse ?? 0}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Button type="button" variant="outline" size="icon" onClick={() => setShowCamera(true)} title="Escanear producto">
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">Cantidad a transferir</Label>
                        <Input type="number" min="1" className="mt-1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                        {overAvailable && (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-red-600">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Solo hay {available} en almacén.
                            </p>
                        )}
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">Notas (opcional)</Label>
                        <Textarea className="mt-1" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>

                    {error && <p className="text-xs text-destructive">{error}</p>}
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={submit} disabled={!canSubmit}>
                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Transferir
                    </Button>
                </div>
            </DialogContent>

            <BarcodeCameraModal open={showCamera} onOpenChange={setShowCamera} onScan={onScan} />
        </Dialog>
    );
}
