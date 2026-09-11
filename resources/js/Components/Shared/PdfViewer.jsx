import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, Maximize2, Minimize2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mismo spinner celeste que GlobalLoader, en tamano chico para usar inline. */
function Spinner({ className }) {
    return (
        <div
            className={cn("h-5 w-5 shrink-0 animate-spin rounded-full border-[3px] border-white/20", className)}
            style={{ borderTopColor: "#00ADEE" }}
        />
    );
}

/**
 * Visor de PDF propio (pdf.js renderizando a canvas) con controles en los
 * colores de Acceso Vertical Peru, en vez de depender del visor nativo del
 * navegador (que no se puede re-estilizar por ser UI del propio Chrome).
 * pdf.js se carga lazy (solo cuando se abre un PDF) para no pesar el bundle
 * inicial del panel. La pagina se ajusta automaticamente al espacio
 * disponible del visor (recalcula al entrar/salir de pantalla completa o
 * redimensionar), hasta que el usuario haga zoom manual.
 */
export default function PdfViewer({ url, onPageSize }) {
    const containerRef = useRef(null);
    const viewportBoxRef = useRef(null);
    const canvasRef = useRef(null);
    const docRef = useRef(null);
    const renderTaskRef = useRef(null);
    const [page, setPage] = useState(1);
    const [pageInput, setPageInput] = useState("1");
    const [numPages, setNumPages] = useState(0);
    const [scale, setScale] = useState(1);
    const [autoFit, setAutoFit] = useState(true);
    const [resizeTick, setResizeTick] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pageRendering, setPageRendering] = useState(false);
    const [error, setError] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const onChange = () => {
            setIsFullscreen(document.fullscreenElement === containerRef.current);
            setResizeTick((t) => t + 1);
        };
        document.addEventListener("fullscreenchange", onChange);
        window.addEventListener("resize", onChange);
        return () => {
            document.removeEventListener("fullscreenchange", onChange);
            window.removeEventListener("resize", onChange);
        };
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
        setAutoFit(true);

        if (!url) {
            setLoading(false);
            setError(true);
            return;
        }

        import("pdfjs-dist")
            .then((pdfjs) => {
                if (cancelled) return;
                pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).href;

                return pdfjs
                    .getDocument({ url })
                    .promise.then((doc) => {
                        if (cancelled) return;
                        docRef.current = doc;
                        setNumPages(doc.numPages);
                        setLoading(false);
                    });
            })
            .catch(() => {
                if (!cancelled) {
                    setLoading(false);
                    setError(true);
                }
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

            const base = pdfPage.getViewport({ scale: 1 });
            onPageSize?.(base.width, base.height);

            let renderScale = scale;
            if (autoFit && viewportBoxRef.current) {
                const box = viewportBoxRef.current.getBoundingClientRect();
                // getBoundingClientRect incluye el padding (p-4 = 16px por
                // lado = 32px por eje) - restarlo mal dejaba el canvas unos
                // pixeles mas grande que el espacio real, generando scroll
                // interno de sobra que bloqueaba el cambio de pagina con la
                // rueda (ver handleWheel).
                const fit = Math.min((box.width - 32) / base.width, (box.height - 32) / base.height);
                renderScale = Math.max(0.25, fit);
                setScale(renderScale);
            }

            const viewport = pdfPage.getViewport({ scale: renderScale });
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, numPages, resizeTick, autoFit, scale]);

    const goToPage = (n) => {
        const clamped = Math.min(Math.max(1, n), numPages || 1);
        setPage(clamped);
        setPageInput(String(clamped));
    };

    // Scroll de rueda/trackpad cambia de pagina, como un lector normal -
    // solo cuando la pagina entra entera en el visor (sin scroll propio),
    // que es el caso por defecto con el auto-ajuste. Si el usuario hizo
    // zoom manual y el contenido ya tiene su propio scroll, se deja que
    // la rueda haga scroll normal en vez de saltar de pagina.
    const wheelLockRef = useRef(false);
    const handleWheel = (e) => {
        const box = viewportBoxRef.current;
        if (box && box.scrollHeight > box.clientHeight + 10) return;
        if (wheelLockRef.current || Math.abs(e.deltaY) < 15) return;

        if (e.deltaY > 0 && page < numPages) {
            goToPage(page + 1);
        } else if (e.deltaY < 0 && page > 1) {
            goToPage(page - 1);
        } else {
            return;
        }
        wheelLockRef.current = true;
        setTimeout(() => {
            wheelLockRef.current = false;
        }, 500);
    };

    const submitPageInput = () => {
        const n = parseInt(pageInput, 10);
        goToPage(Number.isFinite(n) ? n : page);
    };

    const zoom = (delta) => {
        setAutoFit(false);
        setScale((s) => Math.min(3, Math.max(0.25, +(s + delta).toFixed(2))));
    };

    return (
        <div ref={containerRef} className="flex h-full flex-col bg-slate-600">
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
                        onClick={() => zoom(-0.15)}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/15"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-sm text-white/80">{Math.round(scale * 100)}%</span>
                    <button
                        type="button"
                        onClick={() => zoom(0.15)}
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

            <div ref={viewportBoxRef} onWheel={handleWheel} className="relative flex-1 overflow-auto p-4">
                {loading && (
                    <div className="flex h-full items-center justify-center gap-2 text-sm text-white/60">
                        <Spinner />
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
                                    <Spinner className="h-4 w-4 border-2" />
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
