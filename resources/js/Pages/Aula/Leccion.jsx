import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import {
    CircleCheck,
    CirclePlay,
    ChevronDown,
    Clock,
    GraduationCap,
    Lock,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Paperclip,
    FileText,
    Download,
    SkipBack,
    SkipForward,
    Settings,
    Captions,
    Check,
    Eye,
    ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUALITY_LABELS = {
    auto: "Automatica",
    highres: "Maxima",
    hd2160: "2160p 4K",
    hd1440: "1440p",
    hd1080: "1080p",
    hd720: "720p",
    large: "480p",
    medium: "360p",
    small: "240p",
    tiny: "144p",
};

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Custom-branded YouTube player: loads the video via the IFrame Player API
 * with the native YouTube chrome hidden (controls:0, disablekb:1, fs:0) and
 * draws our own play/pause, progress bar, volume and fullscreen controls on
 * top. Also detects "video ended" to auto-mark the lesson as completed.
 */
function YouTubePlayer({ videoId, onEnded }) {
    const wrapperRef = useRef(null);
    const containerRef = useRef(null);
    const playerRef = useRef(null);
    const firedRef = useRef(false);
    const pollRef = useRef(null);

    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [current, setCurrent] = useState(0);
    const [duration, setDuration] = useState(0);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(100);
    const [captionsOn, setCaptionsOn] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [quality, setQuality] = useState("auto");
    const [availableQualities, setAvailableQualities] = useState([]);
    const [settingsPanel, setSettingsPanel] = useState(null); // null | "speed" | "quality"

    useEffect(() => {
        let cancelled = false;
        firedRef.current = false;
        setReady(false);
        setPlaying(false);
        setCurrent(0);
        setDuration(0);

        function createPlayer() {
            if (cancelled || !containerRef.current || !window.YT?.Player) return;
            playerRef.current = new window.YT.Player(containerRef.current, {
                videoId,
                host: "https://www.youtube-nocookie.com",
                playerVars: {
                    rel: 0,
                    modestbranding: 1,
                    iv_load_policy: 3,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    playsinline: 1,
                },
                events: {
                    onReady: (event) => {
                        if (cancelled) return;
                        setReady(true);
                        setDuration(event.target.getDuration());
                        setVolume(event.target.getVolume());
                        setAvailableQualities(event.target.getAvailableQualityLevels?.() ?? []);
                        setCaptionsOn(false);
                        setSpeed(1);
                        setQuality("auto");
                    },
                    onStateChange: (event) => {
                        if (cancelled) return;
                        const YT = window.YT.PlayerState;
                        setPlaying(event.data === YT.PLAYING);
                        if (event.data === YT.ENDED && !firedRef.current) {
                            firedRef.current = true;
                            setPlaying(false);
                            onEnded();
                        }
                    },
                },
            });
        }

        if (window.YT?.Player) {
            createPlayer();
        } else {
            if (!document.getElementById("youtube-iframe-api")) {
                const tag = document.createElement("script");
                tag.id = "youtube-iframe-api";
                tag.src = "https://www.youtube.com/iframe_api";
                document.body.appendChild(tag);
            }
            const previous = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                previous?.();
                createPlayer();
            };
        }

        return () => {
            cancelled = true;
            try {
                playerRef.current?.destroy?.();
            } catch {
                /* player already gone */
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId]);

    // Poll current time while playing (the API has no timeupdate event).
    useEffect(() => {
        clearInterval(pollRef.current);
        if (playing) {
            pollRef.current = setInterval(() => {
                const t = playerRef.current?.getCurrentTime?.();
                if (typeof t === "number") setCurrent(t);
            }, 400);
        }
        return () => clearInterval(pollRef.current);
    }, [playing]);

    const togglePlay = () => {
        if (!ready) return;
        playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
    };

    const seek = (value) => {
        setCurrent(value);
        playerRef.current?.seekTo(value, true);
    };

    const toggleMute = () => {
        if (!ready) return;
        if (muted) {
            playerRef.current.unMute();
            setMuted(false);
        } else {
            playerRef.current.mute();
            setMuted(true);
        }
    };

    const changeVolume = (value) => {
        setVolume(value);
        if (value === 0) {
            playerRef.current?.mute();
            setMuted(true);
        } else {
            playerRef.current?.unMute();
            setMuted(false);
            playerRef.current?.setVolume(value);
        }
    };

    const toggleFullscreen = () => {
        const el = wrapperRef.current;
        if (!el) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            el.requestFullscreen?.();
        }
    };

    const toggleCaptions = () => {
        if (!ready) return;
        if (captionsOn) {
            playerRef.current.unloadModule("captions");
            setCaptionsOn(false);
        } else {
            playerRef.current.loadModule("captions");
            playerRef.current.setOption("captions", "track", {});
            setCaptionsOn(true);
        }
    };

    const changeSpeed = (rate) => {
        playerRef.current?.setPlaybackRate(rate);
        setSpeed(rate);
        setSettingsPanel(null);
    };

    const changeQuality = (level) => {
        playerRef.current?.setPlaybackQuality(level);
        setQuality(level);
        setSettingsPanel(null);
    };

    const progressPct = duration ? (current / duration) * 100 : 0;

    return (
        <div ref={wrapperRef} className="group absolute inset-0 h-full w-full bg-black">
            <div ref={containerRef} className="absolute inset-0 h-full w-full" />

            {/* Transparent overlay: intercepts clicks so YouTube's own UI never shows */}
            <button
                type="button"
                aria-label={playing ? "Pausar" : "Reproducir"}
                onClick={togglePlay}
                className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
            />

            {!playing && (
                <>
                    {/* YouTube still draws its own title/channel row (top) and a
                        "Watch on YouTube" badge (bottom) while paused, even with
                        controls disabled. Mask both (pointer-events-none so clicks
                        still fall through to our own toggle button underneath). */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/70 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
                </>
            )}

            {/* Center play button, shown until playing starts (also covers the
                brief moment before the YT API is ready, so YouTube's own red
                play button never flashes through). */}
            {!playing && (
                <button
                    type="button"
                    onClick={togglePlay}
                    aria-label="Reproducir"
                    className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#024A7D] leading-none text-white shadow-lg shadow-black/30 transition-transform hover:scale-105 hover:bg-[#00ADEE]"
                >
                    <Play className="h-7 w-7 shrink-0 translate-x-[2px]" fill="currentColor" />
                </button>
            )}

            {/* Bottom control bar */}
            <div
                className={cn(
                    "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2 pt-8 transition-opacity",
                    playing
                        ? "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                        : "opacity-100"
                )}
            >
                <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={current}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="lt-video-seek mb-1.5 w-full"
                    style={{ "--progress": `${progressPct}%` }}
                    aria-label="Progreso del video"
                />

                <div className="flex items-center gap-3">
                    <button type="button" onClick={togglePlay} className="text-white">
                        {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </button>

                    <div className="flex items-center gap-1.5">
                        <button type="button" onClick={toggleMute} className="text-white">
                            {muted || volume === 0 ? (
                                <VolumeX className="h-4 w-4" />
                            ) : (
                                <Volume2 className="h-4 w-4" />
                            )}
                        </button>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={muted ? 0 : volume}
                            onChange={(e) => changeVolume(Number(e.target.value))}
                            className="lt-video-seek hidden w-16 sm:block"
                            style={{ "--progress": `${muted ? 0 : volume}%` }}
                            aria-label="Volumen"
                        />
                    </div>

                    <span className="text-xs tabular-nums text-white/80">
                        {formatTime(current)} / {formatTime(duration)}
                    </span>

                    <button
                        type="button"
                        onClick={toggleCaptions}
                        title="Subtitulos"
                        className={cn("ml-auto text-white", captionsOn && "text-[#59CAF4]")}
                    >
                        <Captions className="h-4 w-4" />
                    </button>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setSettingsPanel((p) => (p ? null : "menu"))}
                            title="Configuracion"
                            className="text-white"
                        >
                            <Settings className="h-4 w-4" />
                        </button>

                        {settingsPanel && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Cerrar menu"
                                    onClick={() => setSettingsPanel(null)}
                                    className="fixed inset-0 z-40 cursor-default"
                                />
                                <div className="absolute bottom-7 right-0 z-50 w-44 overflow-hidden rounded-md border border-slate-700 bg-[#0f1522] py-1 text-sm shadow-xl">
                                    {settingsPanel === "menu" && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setSettingsPanel("speed")}
                                                className="flex w-full items-center justify-between px-3 py-2 text-slate-200 hover:bg-white/5"
                                            >
                                                Velocidad
                                                <span className="text-slate-400">{speed}x</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSettingsPanel("quality")}
                                                className="flex w-full items-center justify-between px-3 py-2 text-slate-200 hover:bg-white/5"
                                            >
                                                Calidad
                                                <span className="text-slate-400">
                                                    {QUALITY_LABELS[quality] ?? quality}
                                                </span>
                                            </button>
                                        </>
                                    )}

                                    {settingsPanel === "speed" && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setSettingsPanel("menu")}
                                                className="w-full px-3 py-1.5 text-left text-xs text-slate-400 hover:text-white"
                                            >
                                                ← Velocidad
                                            </button>
                                            {SPEED_OPTIONS.map((r) => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => changeSpeed(r)}
                                                    className="flex w-full items-center justify-between px-3 py-2 text-slate-200 hover:bg-white/5"
                                                >
                                                    {r === 1 ? "Normal" : `${r}x`}
                                                    {speed === r && <Check className="h-3.5 w-3.5 text-[#59CAF4]" />}
                                                </button>
                                            ))}
                                        </>
                                    )}

                                    {settingsPanel === "quality" && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setSettingsPanel("menu")}
                                                className="w-full px-3 py-1.5 text-left text-xs text-slate-400 hover:text-white"
                                            >
                                                ← Calidad
                                            </button>
                                            {(availableQualities.length ? availableQualities : ["auto"]).map((q) => (
                                                <button
                                                    key={q}
                                                    type="button"
                                                    onClick={() => changeQuality(q)}
                                                    className="flex w-full items-center justify-between px-3 py-2 text-slate-200 hover:bg-white/5"
                                                >
                                                    {QUALITY_LABELS[q] ?? q}
                                                    {quality === q && <Check className="h-3.5 w-3.5 text-[#59CAF4]" />}
                                                </button>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <button type="button" onClick={toggleFullscreen} className="text-white">
                        <Maximize className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function formatDuration(seconds) {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

function fileExtension(material) {
    const fromName = material.original_name?.split(".").pop()?.toLowerCase();
    return fromName || "";
}

function isPreviewable(material) {
    return ["pdf", "ppt", "pptx", "doc", "docx", "xls", "xlsx"].includes(fileExtension(material));
}

/**
 * Inline preview modal for lesson materials. PDFs render directly in the
 * browser's native PDF viewer; Office formats go through Microsoft's Office
 * Online viewer, which requires the file to be reachable at a public HTTPS
 * URL (won't render on localhost, works once the site is deployed).
 */
function MaterialPreviewModal({ material, onClose }) {
    if (!material) return null;

    const ext = fileExtension(material);
    const isPdf = ext === "pdf";
    const viewerSrc = isPdf
        ? material.url
        : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(material.url)}`;

    return (
        <Dialog open={!!material} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="flex h-[85vh] max-w-4xl flex-col p-0">
                <DialogHeader className="border-b px-4 py-3">
                    <DialogTitle className="flex items-center gap-2 pr-6 text-base">
                        <FileText className="h-4 w-4 text-[#024A7D]" />
                        <span className="truncate">{material.title}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="relative flex-1 bg-muted">
                    <iframe
                        src={viewerSrc}
                        title={material.title}
                        className="absolute inset-0 h-full w-full border-0"
                    />
                </div>

                <div className="flex items-center justify-between gap-2 border-t px-4 py-2.5">
                    {!isPdf && (
                        <p className="text-xs text-muted-foreground">
                            Si la vista previa no carga, el archivo debe estar publicado en un dominio publico.
                        </p>
                    )}
                    <a
                        href={material.url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-[#024A7D] hover:underline"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Descargar
                    </a>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function moduleDuration(m) {
    const total = m.lessons.reduce((sum, l) => sum + (l.duration_seconds || 0), 0);
    if (!total) return null;
    const mins = Math.round(total / 60);
    return `${mins}m`;
}

export default function Leccion({ course, lesson, enrollment, completedLessonIds, allCompleted, passedModuleQuizIds = [] }) {
    const isCompleted = completedLessonIds.includes(lesson.id);
    const activeModuleId = course.modules.find((m) => m.lessons.some((l) => l.id === lesson.id))?.id;
    const [openModules, setOpenModules] = useState(() => new Set([activeModuleId]));
    const [previewMaterial, setPreviewMaterial] = useState(null);

    // Requisitos para poder completar la clase: ver el video hasta el final
    // y, si tiene material adjunto (PDF/PPT/Word), abrirlo al menos una vez.
    const [videoWatched, setVideoWatched] = useState(isCompleted);
    const [viewedMaterialIds, setViewedMaterialIds] = useState(() => new Set());

    useEffect(() => {
        setVideoWatched(isCompleted);
        setViewedMaterialIds(new Set());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lesson.id]);

    const lessonMaterials = lesson.materials ?? [];
    const allMaterialsViewed = lessonMaterials.every((m) => viewedMaterialIds.has(m.id));
    const canComplete = videoWatched && allMaterialsViewed;

    // Acceso secuencial: una clase solo se desbloquea cuando la anterior
    // (en el orden del temario) ya fue completada. Ademas, si el modulo al
    // que pertenece esta clase no es el primero, el quiz del modulo previo
    // (si tiene uno configurado) debe estar aprobado.
    const orderedLessons = course.modules.flatMap((m) => m.lessons);
    const moduleHasQuiz = (m) => (m.exam?.questions?.length ?? 0) > 0;
    const moduleQuizPassed = (m) => passedModuleQuizIds.includes(m.id);

    const isLocked = (lessonId) => {
        const idx = orderedLessons.findIndex((l) => l.id === lessonId);
        if (idx <= 0) return false;
        const previous = orderedLessons[idx - 1];
        if (!completedLessonIds.includes(previous.id)) return true;

        const targetModule = course.modules.find((m) => m.lessons.some((l) => l.id === lessonId));
        const isFirstOfModule = targetModule?.lessons[0]?.id === lessonId;
        if (isFirstOfModule) {
            const modIdx = course.modules.findIndex((m) => m.id === targetModule.id);
            const prevModule = course.modules[modIdx - 1];
            if (prevModule && moduleHasQuiz(prevModule) && !moduleQuizPassed(prevModule)) {
                return true;
            }
        }
        return false;
    };

    const currentModule = course.modules.find((m) => m.id === activeModuleId);
    const isLastLessonOfModule = currentModule?.lessons[currentModule.lessons.length - 1]?.id === lesson.id;
    const currentModuleQuizPending =
        currentModule &&
        moduleHasQuiz(currentModule) &&
        !moduleQuizPassed(currentModule) &&
        isLastLessonOfModule &&
        isCompleted;

    const toggleModule = (id) => {
        setOpenModules((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const markComplete = () => {
        if (!canComplete) return;
        router.post(`/aula/${course.slug}/clase/${lesson.id}/completar`);
    };

    const handleVideoEnded = () => {
        if (isCompleted) return;
        setVideoWatched(true);
        // Auto-completa solo si ya no falta revisar ningun material.
        if (allMaterialsViewed) {
            router.post(`/aula/${course.slug}/clase/${lesson.id}/completar`);
        }
    };

    const markMaterialViewed = (material) => {
        setViewedMaterialIds((prev) => {
            if (prev.has(material.id)) return prev;
            const next = new Set(prev).add(material.id);
            // Si el video ya termino y este era el ultimo material pendiente,
            // completa la clase automaticamente.
            if (!isCompleted && videoWatched && lessonMaterials.every((m) => next.has(m.id))) {
                router.post(`/aula/${course.slug}/clase/${lesson.id}/completar`);
            }
            return next;
        });
    };

    const openMaterial = (material) => {
        setPreviewMaterial(material);
        markMaterialViewed(material);
    };

    const currentIndex = orderedLessons.findIndex((l) => l.id === lesson.id);
    const prevLesson = currentIndex > 0 ? orderedLessons[currentIndex - 1] : null;
    const nextLessonRaw = currentIndex >= 0 ? orderedLessons[currentIndex + 1] : null;
    const nextLesson = nextLessonRaw && !isLocked(nextLessonRaw.id) ? nextLessonRaw : null;

    return (
        <>
            <Head title={`${lesson.title} - ${course.title}`} />
            <StudentLayout>
                <div className="-mx-4 -my-6 md:-mx-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
                        {/* Video column */}
                        <div className="bg-[#0b0f19]">
                            <div className="relative w-full bg-black" style={{ paddingTop: "56.25%" }}>
                                <YouTubePlayer
                                    key={lesson.id}
                                    videoId={lesson.youtube_video_id}
                                    onEnded={handleVideoEnded}
                                />

                                {prevLesson && (
                                    <Link
                                        href={`/aula/${course.slug}/clase/${prevLesson.id}`}
                                        title={`Anterior: ${prevLesson.title}`}
                                        className="pointer-events-auto absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 leading-none text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:border-[#00ADEE] hover:bg-[#00ADEE]"
                                    >
                                        <SkipBack className="h-4 w-4 shrink-0" fill="currentColor" />
                                    </Link>
                                )}

                                {nextLesson && (
                                    <Link
                                        href={`/aula/${course.slug}/clase/${nextLesson.id}`}
                                        title={`Siguiente: ${nextLesson.title}`}
                                        className="pointer-events-auto absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 leading-none text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:border-[#00ADEE] hover:bg-[#00ADEE]"
                                    >
                                        <SkipForward className="h-4 w-4 shrink-0" fill="currentColor" />
                                    </Link>
                                )}
                            </div>
                            {!isCompleted && (
                                <p className="px-4 pt-2 text-xs text-slate-500 md:px-8">
                                    {!videoWatched && !allMaterialsViewed
                                        ? "Debes terminar de ver el video y revisar el material adjunto para completar la clase."
                                        : !videoWatched
                                        ? "La clase se marca como completada automaticamente al terminar el video."
                                        : !allMaterialsViewed
                                        ? "Revisa el material adjunto para completar la clase."
                                        : null}
                                </p>
                            )}

                            <div className="px-4 py-5 md:px-8">
                                <p className="mb-1 text-xs text-slate-400">
                                    <Link href={`/aula/${course.slug}`} className="hover:underline">
                                        {course.title}
                                    </Link>
                                </p>
                                <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
                                {lesson.description && (
                                    <p className="mt-2 max-w-2xl text-sm text-slate-400">{lesson.description}</p>
                                )}

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Button onClick={markComplete} disabled={isCompleted || !canComplete}>
                                        <CircleCheck className="h-4 w-4" />
                                        {isCompleted ? "Clase completada" : "Marcar como completada"}
                                    </Button>
                                    {currentModuleQuizPending && (
                                        <Button asChild variant="secondary">
                                            <Link href={`/aula/${course.slug}/modulo/${currentModule.id}/quiz`}>
                                                <ListChecks className="h-4 w-4" />
                                                Rendir quiz del modulo
                                            </Link>
                                        </Button>
                                    )}
                                    {allCompleted && (
                                        <Button asChild variant="secondary">
                                            <Link href={`/aula/${course.slug}/examen`}>
                                                <GraduationCap className="h-4 w-4" />
                                                Rendir examen final
                                            </Link>
                                        </Button>
                                    )}
                                </div>

                                {lesson.materials?.length > 0 && (
                                    <div className="mt-6 max-w-2xl">
                                        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-white">
                                            <Paperclip className="h-4 w-4" />
                                            Material de la clase
                                        </h2>
                                        <div className="space-y-1.5">
                                            {lesson.materials.map((m) => (
                                                <div
                                                    key={m.id}
                                                    className="flex items-center gap-2.5 rounded-md border border-slate-800 bg-[#0f1522] px-3 py-2 text-sm text-slate-200 transition-colors hover:border-[#00ADEE]/40 hover:bg-white/5"
                                                >
                                                    <FileText className="h-4 w-4 shrink-0 text-[#59CAF4]" />
                                                    <span className="min-w-0 flex-1 truncate">{m.title}</span>

                                                    {isPreviewable(m) && (
                                                        <button
                                                            type="button"
                                                            title="Ver"
                                                            onClick={() => openMaterial(m)}
                                                            className="shrink-0 text-slate-400 hover:text-white"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <a
                                                        href={m.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        download
                                                        title="Descargar"
                                                        onClick={() => markMaterialViewed(m)}
                                                        className="shrink-0 text-slate-400 hover:text-white"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Syllabus sidebar */}
                        <aside className="border-t border-slate-800 bg-[#0f1522] lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-l lg:border-t-0">
                            <div className="sticky top-0 z-10 bg-[#0f1522] px-4 pb-3 pt-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-slate-300">Progreso del curso</span>
                                    <span className="font-semibold text-[#59CAF4]">{enrollment.progress}%</span>
                                </div>
                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#00ADEE] to-[#59CAF4] transition-all"
                                        style={{ width: `${enrollment.progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="divide-y divide-slate-800/80 border-t border-slate-800/80">
                                {course.modules.map((m) => {
                                    const open = openModules.has(m.id);
                                    const doneCount = m.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
                                    const moduleLocked =
                                        m.lessons.length > 0 &&
                                        !m.lessons.some((l) => l.id === lesson.id) &&
                                        isLocked(m.lessons[0].id);
                                    const moduleLessonsDone = m.lessons.length > 0 && doneCount === m.lessons.length;
                                    const quizPending = moduleHasQuiz(m) && !moduleQuizPassed(m) && moduleLessonsDone;

                                    return (
                                        <div key={m.id}>
                                            <div className="flex items-center gap-1 px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleModule(m.id)}
                                                    className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
                                                >
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        {moduleLocked && (
                                                            <Lock className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                                                        )}
                                                        <div className="min-w-0">
                                                            <div
                                                                className={cn(
                                                                    "truncate text-sm font-semibold",
                                                                    moduleLocked ? "text-slate-500" : "text-white"
                                                                )}
                                                            >
                                                                {m.title}
                                                            </div>
                                                            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                                                                <span>{doneCount}/{m.lessons.length} clases</span>
                                                                {moduleDuration(m) && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {moduleDuration(m)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronDown
                                                        className={cn(
                                                            "h-4 w-4 shrink-0 text-slate-500 transition-transform",
                                                            open && "rotate-180"
                                                        )}
                                                    />
                                                </button>
                                            </div>

                                            {quizPending && (
                                                <Link
                                                    href={`/aula/${course.slug}/modulo/${m.id}/quiz`}
                                                    className="mx-4 mb-2 flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-400 hover:bg-amber-500/15"
                                                >
                                                    <ListChecks className="h-3.5 w-3.5 shrink-0" />
                                                    Quiz pendiente: rinde para desbloquear el siguiente modulo
                                                </Link>
                                            )}

                                            {open && (
                                                <>
                                                {m.description && (
                                                    <p className="whitespace-pre-line px-4 pb-2 text-xs leading-relaxed text-slate-400">
                                                        {m.description}
                                                    </p>
                                                )}
                                                <ul className="pb-2">
                                                    {m.lessons.map((l) => {
                                                        const done = completedLessonIds.includes(l.id);
                                                        const active = l.id === lesson.id;
                                                        const locked = !done && !active && isLocked(l.id);
                                                        const dur = formatDuration(l.duration_seconds);

                                                        const rowClasses = cn(
                                                            "flex items-center gap-2.5 px-4 py-2 text-sm transition-colors",
                                                            active
                                                                ? "bg-[#00ADEE] font-medium text-white"
                                                                : locked
                                                                ? "cursor-not-allowed text-slate-500"
                                                                : "text-slate-300 hover:bg-white/5"
                                                        );

                                                        const icon = done ? (
                                                            <CircleCheck
                                                                className={cn(
                                                                    "h-4 w-4 shrink-0",
                                                                    active ? "text-white" : "text-[#59CAF4]"
                                                                )}
                                                            />
                                                        ) : locked ? (
                                                            <Lock className="h-4 w-4 shrink-0 text-slate-600" />
                                                        ) : (
                                                            <CirclePlay
                                                                className={cn(
                                                                    "h-4 w-4 shrink-0",
                                                                    active ? "text-white" : "text-slate-500"
                                                                )}
                                                            />
                                                        );

                                                        const materials = l.materials ?? [];
                                                        const hasMaterials = materials.length > 0;

                                                        const label = (
                                                            <>
                                                                {icon}
                                                                <span className="min-w-0 flex-1 truncate">{l.title}</span>
                                                                {hasMaterials && (
                                                                    <Paperclip
                                                                        className={cn(
                                                                            "h-3.5 w-3.5 shrink-0",
                                                                            active ? "text-white/80" : "text-slate-500"
                                                                        )}
                                                                        aria-label="Tiene material adjunto"
                                                                    />
                                                                )}
                                                                {dur && (
                                                                    <span
                                                                        className={cn(
                                                                            "shrink-0 text-xs tabular-nums",
                                                                            active ? "text-white/80" : "text-slate-500"
                                                                        )}
                                                                    >
                                                                        {dur}
                                                                    </span>
                                                                )}
                                                            </>
                                                        );

                                                        // Only expand the material sub-list for the lesson currently
                                                        // being viewed, so the syllabus doesn't get too tall.
                                                        const materialsList = hasMaterials && active && (
                                                            <ul className="space-y-0.5 pb-1.5 pl-11 pr-4">
                                                                {materials.map((mat) => (
                                                                    <li key={mat.id}>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openMaterial(mat)}
                                                                            className="flex w-full items-center gap-1.5 rounded py-1 text-left text-xs text-white/80 hover:text-white hover:underline"
                                                                        >
                                                                            <FileText className="h-3.5 w-3.5 shrink-0" />
                                                                            <span className="min-w-0 flex-1 truncate">
                                                                                {mat.title}
                                                                            </span>
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        );

                                                        if (locked) {
                                                            return (
                                                                <li key={l.id}>
                                                                    <div
                                                                        className={rowClasses}
                                                                        title="Completa la clase anterior para desbloquear esta"
                                                                    >
                                                                        {label}
                                                                    </div>
                                                                </li>
                                                            );
                                                        }

                                                        return (
                                                            <li key={l.id}>
                                                                <Link
                                                                    href={`/aula/${course.slug}/clase/${l.id}`}
                                                                    className={rowClasses}
                                                                >
                                                                    {label}
                                                                </Link>
                                                                {materialsList}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}

                                <div className="px-4 py-3">
                                    <Badge
                                        variant="outline"
                                        className="border-slate-700 text-slate-300"
                                    >
                                        {course.is_free ? "Gratis" : `S/ ${Number(course.price).toFixed(2)}`}
                                    </Badge>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                <MaterialPreviewModal
                    material={previewMaterial}
                    onClose={() => setPreviewMaterial(null)}
                />
            </StudentLayout>
        </>
    );
}
