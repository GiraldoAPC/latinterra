import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import {
    Search,
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    Loader2,
    PackageSearch,
    AlertTriangle,
    ClipboardCheck,
    ArrowLeft,
    UserPlus,
    Building2,
    X,
    Camera,
    GraduationCap,
    UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PaymentTicket from "@/Components/Shared/PaymentTicket";
import ClientModal from "@/Components/Admin/ClientModal";
import BarcodeCameraModal from "@/Components/Admin/BarcodeCameraModal";

const METHODS = [
    { value: "efectivo", label: "Efectivo" },
    { value: "transferencia", label: "Transferencia bancaria" },
    { value: "yape", label: "Yape / Plin" },
    { value: "tarjeta", label: "Tarjeta" },
    { value: "otro", label: "Otro" },
];
const METHOD_LABEL = Object.fromEntries(METHODS.map((m) => [m.value, m.label]));

const DOCUMENT_TYPES = [
    { value: "ticket", label: "Ticket interno" },
    { value: "boleta", label: "Boleta (simulada)" },
    { value: "factura", label: "Factura (simulada)" },
];

// Formato de cada serie (la serie es fija; el correlativo real se asigna
// recien al confirmar - ver App\Support\DocumentNumber). Solo para que la
// vista previa muestre el formato correcto segun el tipo elegido.
const DOCUMENT_NUMBER_PREVIEW = {
    ticket: "Se asigna al confirmar",
    boleta: "B001-XXXXXXXX (se asigna al confirmar)",
    factura: "F001-XXXXXXXX (se asigna al confirmar)",
};

function StockBadge({ stock, lowStock }) {
    if (stock === null || stock === undefined) return <span className="text-muted-foreground">Sin control</span>;
    return (
        <span className={`inline-flex items-center gap-1 font-medium ${lowStock ? "text-red-600" : "text-muted-foreground"}`}>
            {lowStock && <AlertTriangle className="h-3 w-3" />}
            Stock: {stock}
        </span>
    );
}

/**
 * Venderle productos a un estudiante directo desde su perfil: busca en el
 * catalogo (debounced, muestra stock y avisa si esta bajo), arma un
 * carrito temporal con serie/lote opcional por item, y antes de emitir el
 * ticket muestra un paso de revision (no se registra de un solo clic).
 *
 * El cuerpo (entre titulo y botones) es el unico que hace scroll interno -
 * titulo y botones quedan siempre visibles aunque el contenido no entre en
 * pantalla (ventanas de navegador bajas).
 */
export default function SellProductModal({ open, onOpenChange, studentId, studentName, studentDni, onSold }) {
    const generalMode = !studentId;

    const [step, setStep] = useState("cart"); // 'cart' | 'review'
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showProductCamera, setShowProductCamera] = useState(false);
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [paymentReference, setPaymentReference] = useState("");
    const [documentType, setDocumentType] = useState("ticket");
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientQuery, setClientQuery] = useState("");
    const [clientResults, setClientResults] = useState([]);
    const [clientSearching, setClientSearching] = useState(false);
    const [clientTypeFilter, setClientTypeFilter] = useState("");
    const [showAddClient, setShowAddClient] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [stockAlert, setStockAlert] = useState(null);
    const stockAlertTimeout = useRef(null);

    // Solo en modo general (no atado a un estudiante desde su perfil): con
    // que tipo de comprador se hace la venta.
    const [buyerType, setBuyerType] = useState("client"); // 'client' | 'none' | 'student'
    const [buyerName, setBuyerName] = useState("");
    const [selectedBuyerStudent, setSelectedBuyerStudent] = useState(null);
    const [buyerStudentQuery, setBuyerStudentQuery] = useState("");
    const [buyerStudentResults, setBuyerStudentResults] = useState([]);
    const [buyerStudentSearching, setBuyerStudentSearching] = useState(false);

    useEffect(() => {
        if (!open) {
            setStep("cart");
            setQuery("");
            setResults([]);
            setCart([]);
            setPaymentMethod("");
            setPaymentReference("");
            setDocumentType("ticket");
            setSelectedClient(null);
            setClientQuery("");
            setClientResults([]);
            setClientTypeFilter("");
            setBuyerType("client");
            setBuyerName("");
            setSelectedBuyerStudent(null);
            setBuyerStudentQuery("");
            setBuyerStudentResults([]);
        }
    }, [open]);

    useEffect(() => {
        if (!open || !generalMode || buyerStudentQuery.trim() === "") {
            setBuyerStudentResults([]);
            return;
        }
        setBuyerStudentSearching(true);
        const t = setTimeout(() => {
            window.axios
                .get("/admin/ventas/otros-pagos/buscar-cliente", { params: { q: buyerStudentQuery } })
                .then((res) => setBuyerStudentResults(res.data))
                .finally(() => setBuyerStudentSearching(false));
        }, 300);
        return () => clearTimeout(t);
    }, [buyerStudentQuery, open, generalMode]);

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

    useEffect(() => {
        if (!open || clientQuery.trim() === "") {
            setClientResults([]);
            return;
        }
        setClientSearching(true);
        const t = setTimeout(() => {
            window.axios
                .get("/admin/clientes/buscar", { params: { q: clientQuery, type: clientTypeFilter || undefined } })
                .then((res) => setClientResults(res.data))
                .finally(() => setClientSearching(false));
        }, 300);
        return () => clearTimeout(t);
    }, [clientQuery, clientTypeFilter, open]);

    const selectClient = (c) => {
        setSelectedClient(c);
        setClientQuery("");
        setClientResults([]);
    };

    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.product_id === product.id);
            if (existing) {
                return prev.map((i) => (i.product_id === product.id ? { ...i, qty: i.qty + 1 } : i));
            }
            return [
                ...prev,
                {
                    product_id: product.id,
                    name: product.name,
                    unit_price: Number(product.price),
                    qty: 1,
                    stock: product.stock,
                    lowStock: product.low_stock,
                    serial: "",
                },
            ];
        });
        setQuery("");
    };

    const onProductScan = (code) => {
        setShowProductCamera(false);
        window.axios.get("/admin/productos/buscar", { params: { q: code } }).then((res) => {
            const exact = res.data.find((p) => p.barcode === code || p.sku === code);
            if (exact) {
                addToCart(exact);
            } else {
                setQuery(code);
            }
        });
    };

    const setQty = (productId, qty) => {
        if (qty < 1) return;
        const item = cart.find((i) => i.product_id === productId);
        if (item && item.stock !== null && item.stock !== undefined && qty > item.stock) {
            setStockAlert(productId);
            window.clearTimeout(stockAlertTimeout.current);
            stockAlertTimeout.current = window.setTimeout(() => setStockAlert(null), 2500);
            return;
        }
        setCart((prev) => prev.map((i) => (i.product_id === productId ? { ...i, qty } : i)));
    };

    const setSerial = (productId, serial) => {
        setCart((prev) => prev.map((i) => (i.product_id === productId ? { ...i, serial } : i)));
    };

    const removeFromCart = (productId) => {
        setCart((prev) => prev.filter((i) => i.product_id !== productId));
    };

    const total = cart.reduce((sum, i) => sum + i.unit_price * i.qty, 0);
    const overStock = cart.some((i) => i.stock !== null && i.stock !== undefined && i.qty > i.stock);
    // Si el comprador ya es un cliente, esa es la misma entidad a facturar
    // (no hace falta volver a pedirla en la seccion de factura).
    const buyerIsClient = generalMode && buyerType === "client";
    const facturaIncompleta = documentType === "factura" && !selectedClient;
    const buyerIncompleta =
        generalMode && ((buyerType === "student" && !selectedBuyerStudent) || (buyerType === "client" && !selectedClient));

    const displayBuyerName = generalMode
        ? buyerType === "student"
            ? selectedBuyerStudent?.name
            : buyerType === "client"
              ? selectedClient?.business_name
              : buyerName || null
        : studentName;

    // Misma logica que OtherPaymentController::sellToStudent para que el
    // "Concepto" de la vista previa coincida exactamente con el ticket real.
    const previewConcept = cart.length === 1 ? `${cart[0].qty} x ${cart[0].name}` : `${cart.length} productos`;
    const previewStudent = {
        name: displayBuyerName,
        last_name: null,
        dni: generalMode ? selectedBuyerStudent?.dni : studentDni,
    };
    const previewInstallment = {
        title: "Producto",
        titleLabel: "Tipo",
        concept: previewConcept,
        amount: total,
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        receipt_code: DOCUMENT_NUMBER_PREVIEW[documentType] ?? DOCUMENT_NUMBER_PREVIEW.ticket,
        paid_at: new Date().toISOString(),
        document_type: documentType,
        buyer_ruc: selectedClient?.ruc ?? "",
        buyer_business_name: selectedClient?.business_name ?? "",
    };

    const submit = () => {
        setProcessing(true);
        const payload = {
            items: cart.map((i) => ({ product_id: i.product_id, name: i.name, unit_price: i.unit_price, qty: i.qty, serial: i.serial || null })),
            payment_method: paymentMethod,
            payment_reference: paymentReference,
            document_type: documentType,
            buyer_ruc: documentType === "factura" ? selectedClient?.ruc : null,
            buyer_business_name: documentType === "factura" ? selectedClient?.business_name : null,
            client_id: documentType === "factura" ? selectedClient?.id : null,
        };

        const url = generalMode
            ? "/admin/ventas/vender"
            : `/admin/estudiantes/${studentId}/ventas`;

        if (generalMode) {
            payload.buyer_type = buyerType;
            payload.buyer_user_id = buyerType === "student" ? selectedBuyerStudent?.id : null;
            payload.buyer_client_id = buyerType === "client" ? selectedClient?.id : null;
            payload.buyer_name = buyerType === "none" ? buyerName || null : null;
        }

        router.post(url, payload, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                onSold?.();
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn("flex flex-col", step === "review" ? "max-w-4xl" : "max-w-3xl")}>
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        {step === "cart" ? (
                            <ShoppingCart className="h-4.5 w-4.5 text-[#024A7D]" />
                        ) : (
                            <ClipboardCheck className="h-4.5 w-4.5 text-[#024A7D]" />
                        )}
                        {step === "cart"
                            ? displayBuyerName
                                ? `Venderle a ${displayBuyerName}`
                                : "Vender producto"
                            : "Revisa antes de emitir el ticket"}
                    </DialogTitle>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-1 -m-1">
                    {step === "cart" && (
                        <>
                            <p className="-mt-2 text-xs text-muted-foreground">
                                1. Busca el producto. 2. Agrégalo al carrito. 3. Revisa y confirma antes de emitir el ticket.
                            </p>

                            {generalMode && (
                                <div className="space-y-2 rounded-lg border p-3">
                                    <Label className="text-xs text-muted-foreground">Comprador</Label>
                                    <div className="flex gap-1 rounded-lg bg-muted/60 p-1 w-fit">
                                        {[
                                            { value: "client", label: "Cliente", icon: Building2 },
                                            { value: "none", label: "Sin registrar", icon: UserX },
                                            { value: "student", label: "Estudiante", icon: GraduationCap },
                                        ].map((t) => (
                                            <button
                                                key={t.value}
                                                type="button"
                                                onClick={() => setBuyerType(t.value)}
                                                className={cn(
                                                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                                                    buyerType === t.value ? "bg-white text-[#024A7D] shadow-sm" : "text-muted-foreground"
                                                )}
                                            >
                                                <t.icon className="h-3.5 w-3.5" />
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>

                                    {buyerType === "student" &&
                                        (selectedBuyerStudent ? (
                                            <div className="flex items-center justify-between gap-2 rounded-md bg-[#00ADEE]/10 px-3 py-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <GraduationCap className="h-4 w-4 shrink-0 text-[#024A7D]" />
                                                    <p className="truncate text-sm font-medium text-[#024A7D]">
                                                        {selectedBuyerStudent.name}
                                                        {selectedBuyerStudent.dni && (
                                                            <span className="ml-1 font-normal text-muted-foreground">
                                                                (DNI {selectedBuyerStudent.dni})
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedBuyerStudent(null)}
                                                    className="shrink-0 text-muted-foreground hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    className="pl-9"
                                                    placeholder="Buscar por nombre o DNI..."
                                                    value={buyerStudentQuery}
                                                    onChange={(e) => setBuyerStudentQuery(e.target.value)}
                                                />
                                                {buyerStudentQuery.trim() !== "" && (
                                                    <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-md border bg-background shadow-lg">
                                                        {buyerStudentSearching && (
                                                            <p className="px-3 py-2 text-xs text-muted-foreground">Buscando...</p>
                                                        )}
                                                        {!buyerStudentSearching && buyerStudentResults.length === 0 && (
                                                            <p className="px-3 py-2 text-xs text-muted-foreground">Sin resultados.</p>
                                                        )}
                                                        {buyerStudentResults.map((s) => (
                                                            <button
                                                                key={s.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedBuyerStudent(s);
                                                                    setBuyerStudentQuery("");
                                                                    setBuyerStudentResults([]);
                                                                }}
                                                                className="lt-hover-sweep flex w-full items-center justify-between px-3 py-2.5 text-left text-sm"
                                                            >
                                                                <span className="truncate">{s.name}</span>
                                                                {s.dni && <span className="shrink-0 text-xs text-muted-foreground">{s.dni}</span>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                    {buyerType === "client" &&
                                        (selectedClient ? (
                                            <div className="flex items-center justify-between gap-2 rounded-md bg-[#00ADEE]/10 px-3 py-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Building2 className="h-4 w-4 shrink-0 text-[#024A7D]" />
                                                    <p className="truncate text-sm font-medium text-[#024A7D]">
                                                        {selectedClient.business_name}{" "}
                                                        <span className="font-normal text-muted-foreground">RUC {selectedClient.ruc}</span>
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedClient(null)}
                                                    className="shrink-0 text-muted-foreground hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Select value={clientTypeFilter || "todos"} onValueChange={(v) => setClientTypeFilter(v === "todos" ? "" : v)}>
                                                    <SelectTrigger className="h-8 w-40 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="todos">Todos los tipos</SelectItem>
                                                        <SelectItem value="natural">Natural</SelectItem>
                                                        <SelectItem value="juridica">Juridica</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
                                                                        Sin resultados - usa el boton "+".
                                                                    </p>
                                                                )}
                                                                {clientResults.map((c) => (
                                                                    <button
                                                                        key={c.id}
                                                                        type="button"
                                                                        onClick={() => selectClient(c)}
                                                                        className="lt-hover-sweep flex w-full items-center justify-between px-3 py-2.5 text-left text-sm"
                                                                    >
                                                                        <span className="truncate">{c.business_name}</span>
                                                                        <span className="shrink-0 text-xs text-muted-foreground">{c.ruc}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button type="button" variant="outline" size="icon" onClick={() => setShowAddClient(true)} title="Nuevo cliente">
                                                        <UserPlus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                    {buyerType === "none" && (
                                        <Input
                                            placeholder="Nombre (opcional)"
                                            value={buyerName}
                                            onChange={(e) => setBuyerName(e.target.value)}
                                        />
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="Buscar producto por nombre, SKU o escanea el codigo..."
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
                                                onClick={() => addToCart(p)}
                                                disabled={p.stock === 0}
                                                className="lt-hover-sweep flex w-full items-center justify-between px-3 py-2.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <span className="flex items-center gap-2 truncate">
                                                    <Plus className="h-3.5 w-3.5 shrink-0 text-[#024A7D]" />
                                                    <span className="truncate">{p.name}</span>
                                                    {p.sku && <span className="shrink-0 text-xs text-muted-foreground">({p.sku})</span>}
                                                </span>
                                                <span className="flex shrink-0 items-center gap-3 text-xs">
                                                    <StockBadge stock={p.stock} lowStock={p.low_stock} />
                                                    <span className="font-semibold text-muted-foreground">S/ {Number(p.price).toFixed(2)}</span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button type="button" variant="outline" size="icon" onClick={() => setShowProductCamera(true)} title="Escanear producto">
                                <Camera className="h-4 w-4" />
                            </Button>
                            </div>

                            <div className="min-h-[180px] rounded-lg border">
                                {cart.length === 0 ? (
                                    <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 text-center">
                                        <PackageSearch className="h-8 w-8 text-slate-300" />
                                        <p className="text-sm text-muted-foreground">El carrito está vacío - busca un producto arriba.</p>
                                    </div>
                                ) : (
                                    <div className="max-h-64 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="sticky top-0 border-b bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                                    <th className="px-4 py-2.5">Producto</th>
                                                    <th className="px-4 py-2.5">Precio unit.</th>
                                                    <th className="px-4 py-2.5 text-center">Cantidad</th>
                                                    <th className="px-4 py-2.5">Serie / lote (opcional)</th>
                                                    <th className="px-4 py-2.5 text-right">Subtotal</th>
                                                    <th className="px-3 py-2.5"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cart.map((item) => {
                                                    const atMax = item.stock !== null && item.stock !== undefined && item.qty >= item.stock;
                                                    return (
                                                        <tr key={item.product_id} className="border-b last:border-0">
                                                            <td className="px-4 py-2.5">
                                                                <p className="font-medium text-[#024A7D]">{item.name}</p>
                                                                <StockBadge stock={item.stock} lowStock={item.lowStock} />
                                                            </td>
                                                            <td className="px-4 py-2.5 text-muted-foreground">S/ {item.unit_price.toFixed(2)}</td>
                                                            <td className="px-4 py-2.5">
                                                                <div className="flex items-center justify-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setQty(item.product_id, item.qty - 1)}
                                                                        className="flex h-6 w-6 items-center justify-center rounded border text-muted-foreground hover:bg-muted"
                                                                    >
                                                                        <Minus className="h-3 w-3" />
                                                                    </button>
                                                                    <span className="w-6 text-center font-medium">{item.qty}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setQty(item.product_id, item.qty + 1)}
                                                                        className={cn(
                                                                            "flex h-6 w-6 items-center justify-center rounded border text-muted-foreground hover:bg-muted",
                                                                            atMax && "border-red-200 text-red-500 hover:bg-red-50"
                                                                        )}
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                                {stockAlert === item.product_id && (
                                                                    <p className="mt-1 flex items-center justify-center gap-1 text-center text-[10px] font-medium text-red-600">
                                                                        <AlertTriangle className="h-3 w-3" />
                                                                        No hay más stock ({item.stock} disponible{item.stock === 1 ? "" : "s"})
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2.5">
                                                                <Input
                                                                    className="h-8 text-xs"
                                                                    placeholder="N° serie / lote"
                                                                    value={item.serial}
                                                                    onChange={(e) => setSerial(item.product_id, e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right font-semibold text-[#024A7D]">
                                                                S/ {(item.unit_price * item.qty).toFixed(2)}
                                                            </td>
                                                            <td className="px-3 py-2.5 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFromCart(item.product_id)}
                                                                    className="text-muted-foreground hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {cart.length > 0 && (
                                <>
                                    <div className="flex items-center justify-between border-t pt-3 text-base font-bold text-[#024A7D]">
                                        <span>Total</span>
                                        <span>S/ {total.toFixed(2)}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Metodo de pago</Label>
                                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                                <SelectTrigger className="mt-1">
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
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Referencia (opcional)</Label>
                                            <Input className="mt-1" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />
                                        </div>
                                    </div>

                                    {overStock && (
                                        <p className="flex items-center gap-1.5 text-xs text-red-600">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            Uno o mas productos superan el stock disponible - ajusta la cantidad antes de continuar.
                                        </p>
                                    )}
                                    {buyerIncompleta && (
                                        <p className="flex items-center gap-1.5 text-xs text-red-600">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            Busca y selecciona al {buyerType === "student" ? "estudiante" : "cliente"} antes de continuar.
                                        </p>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {step === "review" && (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_340px]">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Tipo de comprobante</Label>
                                    <Select value={documentType} onValueChange={setDocumentType}>
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
                                    {documentType !== "ticket" && (
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            Documento referencial - todavia no esta conectado a SUNAT, no tiene validez tributaria. Cambia el
                                            tipo para ver como queda la vista previa.
                                        </p>
                                    )}
                                </div>

                                {documentType === "factura" && (
                                    <div className="space-y-3 rounded-lg border border-dashed p-3">
                                        {buyerIsClient && selectedClient && (
                                            <p className="text-[11px] text-muted-foreground">
                                                Se factura al mismo cliente comprador (para cambiarlo, vuelve al carrito).
                                            </p>
                                        )}
                                        {selectedClient ? (
                                            <div className="flex items-start justify-between gap-2 rounded-md bg-[#00ADEE]/10 px-3 py-2.5">
                                                <div className="flex items-start gap-2 min-w-0">
                                                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#024A7D]" />
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-[#024A7D]">{selectedClient.business_name}</p>
                                                        <p className="text-xs text-muted-foreground">RUC {selectedClient.ruc}</p>
                                                    </div>
                                                </div>
                                                {!buyerIsClient && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedClient(null)}
                                                        className="shrink-0 text-muted-foreground hover:text-destructive"
                                                        title="Cambiar cliente"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
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
                                                                        className="lt-hover-sweep flex w-full items-center justify-between px-3 py-2.5 text-left text-sm"
                                                                    >
                                                                        <span className="truncate">{c.business_name}</span>
                                                                        <span className="shrink-0 text-xs text-muted-foreground">{c.ruc}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button type="button" variant="outline" size="icon" onClick={() => setShowAddClient(true)} title="Nuevo cliente">
                                                        <UserPlus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {facturaIncompleta && (
                                    <p className="flex items-center gap-1.5 text-xs text-red-600">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        Para factura, busca o registra un cliente.
                                    </p>
                                )}

                                <div className="rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                                <th className="px-4 py-2.5">Producto</th>
                                                <th className="px-4 py-2.5 text-center">Cant.</th>
                                                <th className="px-4 py-2.5">Serie / lote</th>
                                                <th className="px-4 py-2.5 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.map((item) => (
                                                <tr key={item.product_id} className="border-b last:border-0">
                                                    <td className="px-4 py-2.5 font-medium text-[#024A7D]">{item.name}</td>
                                                    <td className="px-4 py-2.5 text-center">{item.qty}</td>
                                                    <td className="px-4 py-2.5 text-muted-foreground">{item.serial || "-"}</td>
                                                    <td className="px-4 py-2.5 text-right font-semibold">
                                                        S/ {(item.unit_price * item.qty).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 px-4 py-3 text-sm">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Metodo de pago</p>
                                        <p className="font-medium text-[#024A7D]">{METHOD_LABEL[paymentMethod]}</p>
                                    </div>
                                    {paymentReference && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">Referencia</p>
                                            <p className="font-medium text-[#024A7D]">{paymentReference}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-t pt-3 text-base font-bold text-[#024A7D]">
                                    <span>Total a cobrar</span>
                                    <span>S/ {total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center">
                                <p className="mb-2 self-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Vista previa del ticket
                                </p>
                                <div className="rounded-lg border border-dashed bg-muted/20 p-3">
                                    <PaymentTicket student={previewStudent} installment={previewInstallment} hideActions />
                                </div>
                                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                                    El N° de ticket se asigna al confirmar la venta.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {step === "cart" && cart.length > 0 && (
                    <div className="flex shrink-0 justify-end gap-2 border-t pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={() => setStep("review")} disabled={!paymentMethod || overStock || buyerIncompleta}>
                            Revisar y confirmar
                        </Button>
                    </div>
                )}

                {step === "review" && (
                    <div className="flex shrink-0 justify-between gap-2 border-t pt-4">
                        <Button type="button" variant="outline" onClick={() => setStep("cart")}>
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Button>
                        <Button type="button" onClick={submit} disabled={processing || facturaIncompleta}>
                            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                            Confirmar y emitir ticket
                        </Button>
                    </div>
                )}
            </DialogContent>

            <ClientModal open={showAddClient} onOpenChange={setShowAddClient} onSaved={(client) => selectClient(client)} />
            <BarcodeCameraModal open={showProductCamera} onOpenChange={setShowProductCamera} onScan={onProductScan} />
        </Dialog>
    );
}
