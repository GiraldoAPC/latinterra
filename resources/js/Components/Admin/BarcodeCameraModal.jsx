import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * Lectura de codigo de barras con la camara (celular/tablet, sin lector
 * fisico) usando ZXing. Se abre como un Dialog anidado dentro de otro modal
 * ya abierto (formulario de producto, alta de compra, carrito de venta) -
 * seguro gracias al guard [role="dialog"] de Components/ui/dialog.jsx.
 *
 * facingMode: "environment" fuerza la camara trasera (decodeFromVideoDevice
 * sin filtro suele abrir la frontal/selfie en celulares). Se limitan los
 * formatos a los que realmente se usan en productos (Code128 para
 * etiquetas propias, EAN/UPC para codigos de fabrica) para que lea mas
 * rapido y con menos falsos positivos que buscando todos los formatos.
 */
export default function BarcodeCameraModal({ open, onOpenChange, onScan }) {
    const videoRef = useRef(null);
    const controlsRef = useRef(null);
    const [error, setError] = useState(null);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        if (!open) return;

        let cancelled = false;
        setError(null);
        setStarting(true);

        import("@zxing/browser").then(async ({ BrowserMultiFormatReader }) => {
            const { DecodeHintType, BarcodeFormat } = await import("@zxing/library");
            if (cancelled) return;

            const hints = new Map();
            hints.set(DecodeHintType.POSSIBLE_FORMATS, [
                BarcodeFormat.CODE_128,
                BarcodeFormat.EAN_13,
                BarcodeFormat.EAN_8,
                BarcodeFormat.UPC_A,
            ]);
            const reader = new BrowserMultiFormatReader(hints);

            try {
                const controls = await reader.decodeFromConstraints(
                    { video: { facingMode: "environment" } },
                    videoRef.current,
                    (result) => {
                        if (result) onScan(result.getText());
                    }
                );
                if (cancelled) {
                    controls.stop();
                    return;
                }
                controlsRef.current = controls;
                setStarting(false);
            } catch (err) {
                if (!cancelled) {
                    setError("No se pudo acceder a la camara. Revisa los permisos del navegador.");
                    setStarting(false);
                }
            }
        });

        return () => {
            cancelled = true;
            controlsRef.current?.stop();
            controlsRef.current = null;
        };
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Escanear codigo de barras</DialogTitle>
                </DialogHeader>

                <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                    <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
                    {starting && !error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    )}
                </div>

                {error && (
                    <p className="flex items-center gap-1.5 text-xs text-red-600">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {error}
                    </p>
                )}
                {!error && <p className="text-center text-xs text-muted-foreground">Apunta la camara al codigo de barras.</p>}
            </DialogContent>
        </Dialog>
    );
}
