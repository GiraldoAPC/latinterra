import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, Maximize2, Minimize2, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Visor de PDF propio (pdf.js renderizando a canvas) con controles en los
 * colores de Acceso Vertical Peru, en vez de depender del visor nativo del
 * navegador (que no se puede re-estilizar por ser UI del propio Chrome).
 * pdf.js se carga lazy (solo cuando se abre un PDF) para no pesar el bundle
 * inicial del panel.
 */
export default function PdfViewer({ url }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const docRef = useRef(null);
    const renderTaskRef = useRef(null);
    const [page, setPage] = useState(1);
    const [pageInput, setPageInput] = useState("1");
    const [numPages, setNumPages] = useState(0);
    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(true);
    const [pageRendering, setPageRendering] = useState(false);
    const [error, setError] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const onChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            containerRef.current?.requestFullscreen?.();
        }
    };

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);
        setPage(1);
        setPageInput("1");
        setScale(1);

        if (!url) {
            setLoading(false);
            setError(true);
            return;
        }

        import("pdfjs-dist").then((pdfjs) => {
            if (cancelled) return;
            pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).href;

            pdfjs
                .getDocument(url)
                .promise.then((doc) => {
                    if (cancelled) return;
                    docRef.current = doc;
                    setNumPages(doc.numPages);
                    setLoading(false);
                })
                .catch(() => {
                    if (!cancelled) {
                        setLoading(false);
                        setError(true);
                    }
                });
        });

        return () => {
            cancelled = true;
            docRef.current?.destroy?.();
            docRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    useEffect(() => {
        if (!docRef.current || !canvasRef.current) return;

        let cancelled = false;
        setPageRendering(true);
        docRef.current.getPage(page).then((pdfPage) => {
            if (cancelled) return;
            const viewport = pdfPage.getViewport({ scale });
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            renderTaskRef.current?.cancel();
            const task = pdfPage.render({ canvasContext: context, viewport });
            renderTaskRef.current = task;
            task.promise
                .catch(() => {})
                .finally(() => {
                    if (!cancelled) setPageRendering(false);
                });
        });

        return () => {
            cancelled = true;
        };
    }, [page, scale, numPages]);

    const goToPage = (n) => {
        const clamped = Math.min(Math.max(1, n), numPages || 1);
        setPage(clamped);
        setPageInput(String(clamped));
    };

    const submitPageInput = () => {
        const n = parseInt(pageInput, 10);
        goToPage(Number.isFinite(n) ? n : page);
    };

    return (
        <div ref={containerRef} className="flex h-full flex-col bg-[#0b0f19]">
            <div className="flex shrink-0 items-center justify-between gap-2 bg-gradient-to-r from-[#024A7D] to-[#00ADEE] px-3 py-2 text-white">
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => goToPage(page - 1)}
                        disabled={page <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/15 disabled:opacity-30"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <input
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        onBlur={submitPageInput}
                        onKeyDown={(e) => e.key === "Enter" && submitPageInput()}
                        className="h-8 w-12 rounded-md border border-white/25 bg-white/10 text-center text-sm outline-none focus:border-white/60"
                    />
                    <span className="text-sm text-white/80">/ {numPages || "-"}</span>
                    <button
                        type="button"
                        onClick={() => goToPage(page + 1)}
                        disabled={page >= numPages}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/15 disabled:opacity-30"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => setScale((s) => Math.max(0.5, +(s - 0.15).toFixed(2)))}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/15"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-sm text-white/80">{Math.round(scale * 100)}%</span>
                    <button
                        type="button"
                        onClick={() => setScale((s) => Math.min(3, +(s + 0.15).toFixed(2)))}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/15"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="ml-1 flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/15"
                        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                    >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="relative flex-1 overflow-auto p-4">
                {loading && (
                    <div className="flex h-full items-center justify-center gap-2 text-sm text-white/60">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando PDF...
                    </div>
                )}
                {error && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-white/60">
                        <AlertTriangle className="h-5 w-5" />
                        No se pudo cargar el PDF.
                    </div>
                )}
                {!loading && !error && (
                    <>
                        <canvas ref={canvasRef} className={cn("mx-auto block shadow-2xl transition-opacity", pageRendering && "opacity-40")} />
                        {pageRendering && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <span className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Cargando pagina...
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
