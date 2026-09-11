import { useState } from "react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { ScanBarcode, Camera } from "lucide-react";
import BarcodeCameraModal from "@/Components/Admin/BarcodeCameraModal";

/**
 * Campo de codigo de barras controlado (value/onChange como un input
 * normal) que ademas se puede llenar de dos formas:
 * 1. Lector fisico USB/Bluetooth: "tipea" el codigo como si fuera un
 *    teclado y termina con Enter - no necesita JS especial, solo capturar
 *    el Enter en este input.
 * 2. Camara del celular/tablet: boton que abre un modal con lectura en
 *    vivo (ZXing) - ver BarcodeCameraModal.
 * `onScan` (opcional) se dispara ademas de onChange cuando el valor viene
 * de un escaneo/Enter - util para lugares donde escanear debe hacer algo
 * mas que solo llenar el campo (ej. agregar al carrito directo).
 */
export default function BarcodeScanInput({ value, onChange, onScan, placeholder = "Escanea o escribe el codigo...", autoFocus = false, className }) {
    const [showCamera, setShowCamera] = useState(false);

    const handleScan = (code) => {
        onChange?.(code);
        onScan?.(code);
    };

    return (
        <>
            <div className={className ?? "flex gap-2"}>
                <div className="relative flex-1">
                    <ScanBarcode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder={placeholder}
                        value={value ?? ""}
                        autoFocus={autoFocus}
                        onChange={(e) => onChange?.(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && value) {
                                e.preventDefault();
                                onScan?.(value);
                            }
                        }}
                    />
                </div>
                <Button type="button" variant="outline" size="icon" onClick={() => setShowCamera(true)} title="Escanear con camara">
                    <Camera className="h-4 w-4" />
                </Button>
            </div>

            <BarcodeCameraModal open={showCamera} onOpenChange={setShowCamera} onScan={handleScan} />
        </>
    );
}
