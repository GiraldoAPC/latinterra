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

function touchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
}

/**
 * Visor de PDF propio (pdf.js renderizando a canvas por cada pagina) con
 * controles en los colores de Acceso Vertical Peru, en vez de depender del
 * visor nativo del navegador (que no se puede re-estilizar por ser UI del
 * propio Chrome). pdf.js se carga lazy (solo cuando se abre un PDF).
 *
 * Scroll continuo real: todas las paginas se renderizan apiladas en una
 * sola columna (como un lector normal), no "una pagina a la vez" - el
 * numero de pagina arriba se actualiza solo segun cual esta mas visible.
 * En touch (celular/tablet) se puede hacer zoom con pellizco de dos dedos,
 * ademas del +/- de la barra.
 */
export default function PdfViewer({ url }) {
    const containerRef = useRef(null);
    const viewportBoxRef = useRef(null);
    const docRef = useRef(null);
    const canvasRefs = useRef({});
    const pageWrapRefs = useRef({});
    const pinchRef = useRef(null);

    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageInput, setPageInput] = useState("1");
    const [scale, setScale] = useState(1);
    const [autoFit, setAutoFit] = useState(true);
    const [resizeTick, setResizeTick] = useState(0);
    const [renderedUpTo, setRenderedUpTo] = useState(0);
    const [loading, setLoading] = useState(true);
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

    // Carga el documento.
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);
        setNumPages(0);
        setCurrentPage(1);
        setPageInput("1");
        setScale(1);
        setAutoFit(true);
        setRenderedUpTo(0);
        canvasRefs.current = {};
        pageWrapRefs.current = {};

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

    // Renderiza todas las paginas, en orden, apiladas.
    useEffect(() => {
        if (!docRef.current || !numPages || !viewportBoxRef.current) return;

        let cancelled = false;

        async function renderAll() {
            const box = viewportBoxRef.current.getBoundingClientRect();
            const availWidth = box.width - 32;

            for (let i = 1; i <= numPages; i++) {
                if (cancelled) return;
                const pdfPage = await docRef.current.getPage(i);
                if (cancelled) return;

                const base = pdfPage.getViewport({ scale: 1 });
                const renderScale = autoFit ? Math.max(0.25, availWidth / base.width) : scale;
                if (autoFit && i === 1) setScale(renderScale);

                const viewport = pdfPage.getViewport({ scale: renderScale });
                const canvas = canvasRefs.current[i];
                if (!canvas) continue;
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext("2d");

                await pdfPage.render({ canvasContext: ctx, viewport }).promise.catch(() => {});
                if (!cancelled) setRenderedUpTo(i);
            }
        }

        renderAll();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numPages, resizeTick, autoFit, scale]);

    // Detecta que pagina esta mas visible para actualizar el numero de
    // pagina mientras se scrollea (sin esto, solo cambiaria al usar los
    // botones/el input).
    useEffect(() => {
        if (!viewportBoxRef.current || !numPages) return;
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]) {
                    const n = Number(visible[0].target.dataset.page);
                    setCurrentPage(n);
                    setPageInput(String(n));
                }
            },
            { root: viewportBoxRef.current, threshold: [0.4, 0.6, 0.8] }
        );
        Object.values(pageWrapRefs.current).forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, [numPages, renderedUpTo]);

    const goToPage = (n) => {
        const clamped = Math.min(Math.max(1, n), numPages || 1);
        pageWrapRefs.current[clamped]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const submitPageInput = () => {
        const n = parseInt(pageInput, 10);
        goToPage(Number.isFinite(n) ? n : currentPage);
    };

    const zoom = (delta) => {
        setAutoFit(false);
        setScale((s) => Math.min(3, Math.max(0.25, +(s + delta).toFixed(2))));
    };

    // Zoom con pellizco de 2 dedos (touch) - el zoom manual desactiva el
    // auto-ajuste, igual que los botones +/-.
    useEffect(() => {
        const box = viewportBoxRef.current;
        if (!box) return;

        const onTouchStart = (e) => {
            if (e.touches.length === 2) {
                pinchRef.current = { startDist: touchDistance(e.touches), startScale: scale };
            }
        };
        const onTouchMove = (e) => {
            if (e.touches.length === 2 && pinchRef.current) {
                e.preventDefault();
                const ratio = touchDistance(e.touches) / pinchRef.current.startDist;
                setAutoFit(false);
                setScale(Math.min(3, Math.max(0.25, +(pinchRef.current.startScale * ratio).toFixed(2))));
            }
        };
        const onTouchEnd = () => {
            pinchRef.current = null;
        };

        box.addEventListener("touchstart", onTouchStart, { passive: true });
        box.addEventListener("touchmove", onTouchMove, { passive: false });
        box.addEventListener("touchend", onTouchEnd);
        return () => {
            box.removeEventListener("touchstart", onTouchStart);
            box.removeEventListener("touchmove", onTouchMove);
            box.removeEventListener("touchend", onTouchEnd);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scale]);

    return (
        <div ref={containerRef} className="flex h-full flex-col bg-slate-300">
            <div className="flex shrink-0 items-center justify-between gap-2 bg-gradient-to-r from-[#024A7D] to-[#00ADEE] px-3 py-2 text-white">
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage <= 1}
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
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= numPages}
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

            <div ref={viewportBoxRef} className="relative flex-1 touch-pan-y overflow-auto overscroll-contain p-4">
                {loading && (
                    <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-600">
                        <Spinner className="border-slate-400/50" />
                        Cargando PDF...
                    </div>
                )}
                {error && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-slate-600">
                        <AlertTriangle className="h-5 w-5" />
                        No se pudo cargar el PDF.
                    </div>
                )}
                {!loading && !error && (
                    <div className="mx-auto flex w-fit flex-col items-center gap-4">
                        {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
                            <div key={n} ref={(el) => (pageWrapRefs.current[n] = el)} data-page={n} className="relative">
                                <canvas ref={(el) => (canvasRefs.current[n] = el)} className="block shadow-2xl" />
                                {renderedUpTo < n && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-300/80">
                                        <Spinner className="border-slate-400/50" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
