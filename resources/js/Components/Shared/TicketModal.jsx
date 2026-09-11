import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import PaymentTicket from "@/Components/Shared/PaymentTicket";
import { Loader2, Receipt, Printer, Download } from "lucide-react";

/**
 * Muestra el ticket de una cuota pagada en un modal (sin navegar a otra
 * pagina) - trae los datos con axios desde el endpoint "...-datos" (JSON)
 * la primera vez que se abre para cada cuota, y los cachea mientras el
 * modal sigue montado.
 *
 * El ticket (con muchos productos) hace scroll en su propio contenedor -
 * el boton "Imprimir" vive aca afuera, fijo, para que nunca quede tapado
 * por el limite de alto del modal (mismo patron que los demas modales
 * largos del panel). `autoPrint` dispara la impresion apenas cargan los
 * datos, para la accion rapida de "Imprimir" desde la tabla.
 */
export default function TicketModal({ open, onOpenChange, dataUrl, autoPrint = false }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const ticketRef = useRef(null);

    useEffect(() => {
        if (!open || !dataUrl) return;
        setData(null);
        setLoading(true);
        window.axios
            .get(dataUrl)
            .then((res) => {
                setData(res.data);
                if (autoPrint) {
                    setTimeout(() => window.print(), 200);
                }
            })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, dataUrl]);

    // Descarga como PDF en el navegador (sin backend) para cuando no hay
    // impresora tiketera a mano: renderiza el ticket ya visible a un canvas
    // y lo mete en un PDF del mismo tamaño, sin pasar por el dialogo de
    // impresion del sistema.
    const downloadPdf = async () => {
        if (!ticketRef.current || downloading) return;
        setDownloading(true);
        try {
            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
                import("html2canvas"),
                import("jspdf"),
            ]);
            const canvas = await html2canvas(ticketRef.current, { scale: 3, backgroundColor: "#ffffff" });
            const pdf = new jsPDF({ unit: "px", format: [canvas.width, canvas.height] });
            pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save(`ticket-${data?.installment?.receipt_code ?? "pago"}.pdf`);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-w-sm flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="h-4.5 w-4.5 text-sky-600" />
                        Ticket de pago
                    </DialogTitle>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto print:hidden">
                    {loading && (
                        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando ticket...
                        </div>
                    )}

                    {!loading && data && (
                        <div ref={ticketRef}>
                            <PaymentTicket student={data.student} installment={data.installment} hideActions />
                        </div>
                    )}
                </div>

                {!loading && data && (
                    <div className="flex shrink-0 flex-wrap justify-center gap-2 border-t pt-4 print:hidden">
                        <Button onClick={() => window.print()}>
                            <Printer className="h-4 w-4" />
                            Imprimir ticket
                        </Button>
                        <Button variant="outline" onClick={downloadPdf} disabled={downloading}>
                            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            Descargar PDF
                        </Button>
                    </div>
                )}
            </DialogContent>

            {/* El modal (fixed + overflow-hidden + max-h) recorta el ticket al
                imprimir porque #ticket-print queda anclado a ese contenedor
                clippeado. Se porta una copia directa a <body>, oculta en
                pantalla y visible solo en @media print (ver app.css), para
                que imprima completo sin depender del layout del modal. */}
            {!loading &&
                data &&
                createPortal(
                    <div className="hidden print:block">
                        <PaymentTicket student={data.student} installment={data.installment} hideActions />
                    </div>,
                    document.body
                )}
        </Dialog>
    );
}
