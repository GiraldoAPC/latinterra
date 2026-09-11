import { Head, useForm, router, Link } from "@inertiajs/react";
import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import CourseStepper from "@/Components/Admin/CourseStepper";
import CourseInfoFields from "@/Components/Admin/CourseInfoFields";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Plus,
    Trash2,
    Pencil,
    GripVertical,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    Eye,
    EyeOff,
    Paperclip,
    FileText,
    Upload,
    ListChecks,
    Loader2,
    ChevronDown,
} from "lucide-react";

/**
 * Fetches a YouTube video's real duration (in seconds) via the IFrame
 * Player API, using a 1x1 offscreen player instead of the Data API so it
 * doesn't need an API key/quota.
 */
function fetchYoutubeDuration(videoId) {
    return new Promise((resolve, reject) => {
        function create() {
            const el = document.createElement("div");
            el.style.position = "fixed";
            el.style.left = "-9999px";
            el.style.top = "-9999px";
            el.style.width = "1px";
            el.style.height = "1px";
            document.body.appendChild(el);

            const cleanup = (player) => {
                try {
                    player?.destroy?.();
                } catch {
                    /* already gone */
                }
                el.remove();
            };

            const player = new window.YT.Player(el, {
                videoId,
                events: {
                    onReady: (e) => {
                        const duration = Math.round(e.target.getDuration());
                        cleanup(player);
                        duration > 0 ? resolve(duration) : reject(new Error("Duracion invalida"));
                    },
                    onError: () => {
                        cleanup(player);
                        reject(new Error("No se pudo cargar el video"));
                    },
                },
            });
        }

        if (window.YT?.Player) {
            create();
            return;
        }

        if (!document.getElementById("youtube-iframe-api")) {
            const tag = document.createElement("script");
            tag.id = "youtube-iframe-api";
            tag.src = "https://www.youtube.com/iframe_api";
            document.body.appendChild(tag);
        }
        const previous = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            previous?.();
            create();
        };
    });
}

function formatMinSec(totalSeconds) {
    if (!totalSeconds) return null;
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

function formatFileSize(bytes) {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function NewMaterialForm({ lessonId, onDone }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title: "",
        file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/admin/clases/${lessonId}/materiales`, {
            forceFormData: true,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onDone?.();
            },
        });
    };

    return (
        <form onSubmit={submit} className="grid grid-cols-1 gap-2 rounded-md border bg-muted/30 p-2 md:grid-cols-[1fr_1fr_auto]">
            <div>
                <input
                    type="text"
                    placeholder="Nombre del material (Ej. Diapositivas)"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
            </div>
            <div>
                <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip"
                    className="w-full rounded-md border px-2.5 py-1.5 text-sm"
                    onChange={(e) => setData("file", e.target.files?.[0] ?? null)}
                />
                {errors.file && <p className="text-xs text-destructive mt-1">{errors.file}</p>}
            </div>
            <Button type="submit" size="sm" disabled={processing}>
                <Upload className="h-4 w-4" />
                Subir
            </Button>
        </form>
    );
}

function LessonMaterials({ lesson }) {
    const [showUpload, setShowUpload] = useState(false);
    const materials = lesson.materials ?? [];

    const deleteMaterial = (material) => {
        if (!confirm(`¿Eliminar el material "${material.title}"?`)) return;
        router.delete(`/admin/materiales/${material.id}`, { preserveState: true, preserveScroll: true });
    };

    return (
        <div className="mt-2 space-y-1.5 border-t pt-2">
            {materials.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5 text-xs">
                    <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 items-center gap-1.5 text-foreground hover:underline"
                    >
                        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium">{m.title}</span>
                        <span className="shrink-0 text-muted-foreground">{formatFileSize(m.size)}</span>
                    </a>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteMaterial(m)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                </div>
            ))}

            {showUpload ? (
                <NewMaterialForm lessonId={lesson.id} onDone={() => setShowUpload(false)} />
            ) : (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowUpload(true)}>
                    <Paperclip className="h-3.5 w-3.5" />
                    Agregar material (PDF, PPT, Word...)
                </Button>
            )}
        </div>
    );
}

const STEPS = [
    { id: 1, label: "Informacion general" },
    { id: 2, label: "Modulos y clases" },
    { id: 3, label: "Examen final" },
    { id: 4, label: "Revisar y publicar" },
];

function CourseInfoForm({ course, onSaved }) {
    const { data, setData, put, processing, errors } = useForm({
        title: course.title,
        summary: course.summary ?? "",
        description: course.description ?? "",
        price: String(course.price),
        is_free: course.is_free,
        billing_type: course.billing_type ?? "unico",
        enrollment_fee: course.enrollment_fee ?? "",
        monthly_fee: course.monthly_fee ?? "",
        duration_months: course.duration_months ?? "",
        payment_required: course.payment_required ?? true,
        min_age: course.min_age ?? "",
        is_published: course.is_published,
        passing_score: String(course.passing_score),
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/cursos/${course.id}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => onSaved?.(),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <CourseInfoFields data={data} setData={setData} errors={errors} showPublish />

            <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                    Guardar cambios
                </Button>
            </div>
        </form>
    );
}

function NewLessonForm({ moduleId, onDone }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title: "",
        youtube_video_id: "",
        duration_seconds: "",
    });
    const [fetchingDuration, setFetchingDuration] = useState(false);

    const autoFillDuration = async () => {
        const videoId = data.youtube_video_id.trim();
        if (!videoId) return null;
        setFetchingDuration(true);
        try {
            const seconds = await fetchYoutubeDuration(videoId);
            setData("duration_seconds", seconds);
            return seconds;
        } catch {
            return null;
        } finally {
            setFetchingDuration(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        const seconds = data.duration_seconds || (await autoFillDuration());
        post(`/admin/modulos/${moduleId}/clases`, {
            // setData() no refresca `data` de forma sincronica dentro de este
            // mismo submit, asi que forzamos el valor recien calculado aqui.
            transform: (formData) => ({ ...formData, duration_seconds: seconds || formData.duration_seconds }),
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onDone?.();
            },
        });
    };

    return (
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_90px_auto] gap-2 items-center pt-2">
            <div>
                <input
                    type="text"
                    placeholder="Titulo de la clase"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
            </div>
            <div>
                <input
                    type="text"
                    placeholder="ID del video de YouTube"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={data.youtube_video_id}
                    onChange={(e) => setData("youtube_video_id", e.target.value)}
                    onBlur={autoFillDuration}
                />
                {errors.youtube_video_id && <p className="text-xs text-destructive mt-1">{errors.youtube_video_id}</p>}
            </div>
            <div
                className="flex items-center justify-center gap-1 rounded-md border bg-muted/40 px-2 py-2 text-xs text-muted-foreground"
                title="Duracion calculada automaticamente"
            >
                {fetchingDuration ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    formatMinSec(data.duration_seconds) ?? "—"
                )}
            </div>
            <Button type="submit" size="sm" disabled={processing}>
                <Plus className="h-4 w-4" />
                Agregar
            </Button>
        </form>
    );
}

function EditLessonForm({ lesson, onDone }) {
    const { data, setData, put, processing, errors } = useForm({
        title: lesson.title,
        youtube_video_id: lesson.youtube_video_id,
        duration_seconds: lesson.duration_seconds ?? "",
    });
    const [fetchingDuration, setFetchingDuration] = useState(false);

    const autoFillDuration = async () => {
        const videoId = data.youtube_video_id.trim();
        if (!videoId) return null;
        setFetchingDuration(true);
        try {
            const seconds = await fetchYoutubeDuration(videoId);
            setData("duration_seconds", seconds);
            return seconds;
        } catch {
            return null;
        } finally {
            setFetchingDuration(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        const seconds = data.duration_seconds || (await autoFillDuration());
        put(`/admin/clases/${lesson.id}`, {
            transform: (formData) => ({ ...formData, duration_seconds: seconds || formData.duration_seconds }),
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => onDone?.(),
        });
    };

    return (
        <form onSubmit={submit} className="grid grid-cols-1 items-center gap-2 rounded-md border bg-muted/30 p-2 md:grid-cols-[1fr_1fr_90px_auto_auto]">
            <div>
                <input
                    type="text"
                    placeholder="Titulo de la clase"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
            </div>
            <div>
                <input
                    type="text"
                    placeholder="ID del video de YouTube"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={data.youtube_video_id}
                    onChange={(e) => setData("youtube_video_id", e.target.value)}
                    onBlur={autoFillDuration}
                />
                {errors.youtube_video_id && <p className="text-xs text-destructive mt-1">{errors.youtube_video_id}</p>}
            </div>
            <div
                className="flex items-center justify-center gap-1 rounded-md border bg-muted/40 px-2 py-2 text-xs text-muted-foreground"
                title="Duracion calculada automaticamente"
            >
                {fetchingDuration ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    formatMinSec(data.duration_seconds) ?? "—"
                )}
            </div>
            <Button type="submit" size="sm" disabled={processing}>
                Guardar
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onDone}>
                Cancelar
            </Button>
        </form>
    );
}

function EditModuleTitleForm({ courseModule, onDone }) {
    const { data, setData, put, processing, errors } = useForm({ title: courseModule.title });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/modulos/${courseModule.id}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => onDone?.(),
        });
    };

    return (
        <form onSubmit={submit} className="flex flex-1 items-center gap-2">
            <input
                type="text"
                className="flex-1 rounded-md border px-3 py-1.5 text-sm font-semibold"
                value={data.title}
                onChange={(e) => setData("title", e.target.value)}
                autoFocus
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            <Button type="submit" size="sm" disabled={processing}>
                Guardar
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onDone}>
                Cancelar
            </Button>
        </form>
    );
}

function ModuleDescription({ courseModule }) {
    const [editing, setEditing] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        title: courseModule.title,
        description: courseModule.description ?? "",
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/modulos/${courseModule.id}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    if (editing) {
        return (
            <form onSubmit={submit} className="space-y-2 rounded-md border bg-muted/30 p-3">
                <label className="text-xs font-medium text-muted-foreground">
                    Descripcion del modulo
                </label>
                <textarea
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    rows={5}
                    placeholder="Explica el contenido de este modulo (se muestra al alumno)."
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    autoFocus
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={processing}>
                        Guardar
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
                        Cancelar
                    </Button>
                </div>
            </form>
        );
    }

    if (courseModule.description) {
        return (
            <button
                type="button"
                onClick={() => setEditing(true)}
                className="w-full rounded-md border border-dashed p-3 text-left text-sm text-muted-foreground hover:border-solid hover:bg-muted/30"
                title="Editar descripcion"
            >
                <p className="whitespace-pre-line">{courseModule.description}</p>
            </button>
        );
    }

    return (
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Agregar descripcion del modulo
        </Button>
    );
}

function ModuleCard({ courseModule, open, onToggle }) {
    const [showNewLesson, setShowNewLesson] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [editingTitle, setEditingTitle] = useState(false);

    const deleteModule = () => {
        if (!confirm(`¿Eliminar el modulo "${courseModule.title}" y todas sus clases?`)) return;
        router.delete(`/admin/modulos/${courseModule.id}`, { preserveState: true, preserveScroll: true });
    };

    const deleteLesson = (lesson) => {
        if (!confirm(`¿Eliminar la clase "${lesson.title}"?`)) return;
        router.delete(`/admin/clases/${lesson.id}`, { preserveState: true, preserveScroll: true });
    };

    const totalMinutes = Math.round(
        courseModule.lessons.reduce((sum, l) => sum + (l.duration_seconds || 0), 0) / 60
    );

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
                {editingTitle ? (
                    <EditModuleTitleForm
                        courseModule={courseModule}
                        onDone={() => setEditingTitle(false)}
                    />
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={onToggle}
                            className="flex flex-1 items-center gap-2 text-left"
                        >
                            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <CardTitle className="text-base">{courseModule.title}</CardTitle>
                            <span className="text-xs font-normal text-muted-foreground">
                                {courseModule.lessons.length} clases
                                {totalMinutes > 0 ? ` · ${totalMinutes} min` : ""}
                            </span>
                            <ChevronDown
                                className={cn(
                                    "ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                                    open && "rotate-180"
                                )}
                            />
                        </button>
                        <div className="ml-2 flex shrink-0 items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setEditingTitle(true)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={deleteModule}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </>
                )}
            </CardHeader>
            {open && (
            <CardContent className="space-y-2 border-t pt-4">
                <ModuleDescription courseModule={courseModule} />

                {courseModule.lessons.length === 0 && (
                    <p className="text-sm text-muted-foreground">Sin clases todavia.</p>
                )}
                {courseModule.lessons.map((lesson) =>
                    editingLessonId === lesson.id ? (
                        <EditLessonForm
                            key={lesson.id}
                            lesson={lesson}
                            onDone={() => setEditingLessonId(null)}
                        />
                    ) : (
                        <div key={lesson.id} className="rounded-md border px-3 py-2 text-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{lesson.title}</div>
                                    <div className="text-xs text-muted-foreground">
                                        YouTube: {lesson.youtube_video_id}
                                        {lesson.duration_seconds ? ` · ${Math.round(lesson.duration_seconds / 60)} min` : ""}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingLessonId(lesson.id)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteLesson(lesson)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>

                            <LessonMaterials lesson={lesson} />
                        </div>
                    )
                )}

                {showNewLesson ? (
                    <NewLessonForm moduleId={courseModule.id} onDone={() => setShowNewLesson(false)} />
                ) : (
                    <Button variant="outline" size="sm" onClick={() => setShowNewLesson(true)}>
                        <Plus className="h-4 w-4" />
                        Agregar clase
                    </Button>
                )}

                <div>
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <ListChecks className="h-3.5 w-3.5" />
                        Quiz del modulo (opcional)
                    </div>
                    <ExamCard
                        compact
                        emptyHint="Sin preguntas. Si agregas al menos una, el alumno debera aprobar este quiz para desbloquear el siguiente modulo."
                        postUrl={`/admin/modulos/${courseModule.id}/examen/preguntas`}
                        exam={courseModule.exam}
                    />
                </div>
            </CardContent>
            )}
        </Card>
    );
}

function NewModuleForm({ courseId }) {
    const { data, setData, post, processing, reset } = useForm({ title: "" });

    const submit = (e) => {
        e.preventDefault();
        post(`/admin/cursos/${courseId}/modulos`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={submit} className="flex gap-2">
            <input
                type="text"
                placeholder="Titulo del nuevo modulo"
                className="flex-1 rounded-md border px-3 py-2 text-sm"
                value={data.title}
                onChange={(e) => setData("title", e.target.value)}
            />
            <Button type="submit" disabled={processing}>
                <Plus className="h-4 w-4" />
                Agregar modulo
            </Button>
        </form>
    );
}

function NewQuestionForm({ postUrl, onDone }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        question: "",
        options: [
            { option_text: "", is_correct: true },
            { option_text: "", is_correct: false },
        ],
    });

    const updateOption = (i, field, value) => {
        const options = [...data.options];
        options[i] = { ...options[i], [field]: value };
        setData("options", options);
    };

    const setCorrect = (i) => {
        setData(
            "options",
            data.options.map((o, idx) => ({ ...o, is_correct: idx === i }))
        );
    };

    const addOption = () => {
        setData("options", [...data.options, { option_text: "", is_correct: false }]);
    };

    const removeOption = (i) => {
        setData("options", data.options.filter((_, idx) => idx !== i));
    };

    const submit = (e) => {
        e.preventDefault();
        post(postUrl, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onDone?.();
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3 rounded-md border p-4">
            <div>
                <label className="text-sm font-medium">Pregunta</label>
                <textarea
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    rows={2}
                    value={data.question}
                    onChange={(e) => setData("question", e.target.value)}
                />
                {errors.question && <p className="text-xs text-destructive mt-1">{errors.question}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Opciones (marca la correcta)</label>
                {data.options.map((option, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="correct_option"
                            checked={option.is_correct}
                            onChange={() => setCorrect(i)}
                        />
                        <input
                            type="text"
                            placeholder={`Opcion ${i + 1}`}
                            className="flex-1 rounded-md border px-3 py-2 text-sm"
                            value={option.option_text}
                            onChange={(e) => updateOption(i, "option_text", e.target.value)}
                        />
                        {data.options.length > 2 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(i)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        )}
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4" />
                    Agregar opcion
                </Button>
            </div>

            <Button type="submit" disabled={processing}>Guardar pregunta</Button>
        </form>
    );
}

function ExamCard({ title, emptyHint, postUrl, exam, compact = false }) {
    const [showNew, setShowNew] = useState(false);
    const questions = exam?.questions ?? [];

    const deleteQuestion = (question) => {
        if (!confirm("¿Eliminar esta pregunta?")) return;
        router.delete(`/admin/examen/preguntas/${question.id}`, { preserveState: true, preserveScroll: true });
    };

    const body = (
        <div className="space-y-3">
            {questions.length === 0 && (
                <p className="text-sm text-muted-foreground">{emptyHint}</p>
            )}
            {questions.map((q, idx) => (
                <div key={q.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium">{idx + 1}. {q.question}</div>
                        <Button variant="ghost" size="icon" onClick={() => deleteQuestion(q)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                    <ul className="mt-2 space-y-1">
                        {q.options.map((o) => (
                            <li key={o.id} className="text-sm flex items-center gap-2">
                                {o.is_correct ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                    <span className="h-4 w-4 inline-block" />
                                )}
                                {o.option_text}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            {showNew ? (
                <NewQuestionForm postUrl={postUrl} onDone={() => setShowNew(false)} />
            ) : (
                <Button variant="outline" size="sm" onClick={() => setShowNew(true)}>
                    <Plus className="h-4 w-4" />
                    Agregar pregunta
                </Button>
            )}
        </div>
    );

    if (compact) {
        return <div className="mt-2 border-t pt-2">{body}</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>{body}</CardContent>
        </Card>
    );
}

function ReviewStep({ course }) {
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const totalQuestions = course.exam?.questions?.length ?? 0;

    const togglePublish = () => {
        router.put(
            `/admin/cursos/${course.id}`,
            {
                title: course.title,
                summary: course.summary ?? "",
                description: course.description ?? "",
                price: String(course.price),
                is_free: course.is_free,
                passing_score: String(course.passing_score),
                is_published: !course.is_published,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const canPublish = course.modules.length > 0 && totalLessons > 0 && totalQuestions > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Revisar y publicar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-md border p-3">
                        <div className="text-2xl font-semibold">{course.modules.length}</div>
                        <div className="text-xs text-muted-foreground">Modulos</div>
                    </div>
                    <div className="rounded-md border p-3">
                        <div className="text-2xl font-semibold">{totalLessons}</div>
                        <div className="text-xs text-muted-foreground">Clases</div>
                    </div>
                    <div className="rounded-md border p-3">
                        <div className="text-2xl font-semibold">{totalQuestions}</div>
                        <div className="text-xs text-muted-foreground">Preguntas de examen</div>
                    </div>
                    <div className="rounded-md border p-3">
                        <div className="text-2xl font-semibold">
                            {course.is_free ? "Gratis" : `S/ ${Number(course.price).toFixed(2)}`}
                        </div>
                        <div className="text-xs text-muted-foreground">Precio</div>
                    </div>
                </div>

                {!canPublish && (
                    <p className="text-sm text-amber-600">
                        Para publicar necesitas al menos un modulo con una clase y una
                        pregunta en el examen final.
                    </p>
                )}

                <div className="flex items-center gap-3 rounded-md border p-4">
                    <div className="flex-1">
                        <div className="text-sm font-medium">
                            Estado actual:{" "}
                            <Badge variant={course.is_published ? "default" : "secondary"}>
                                {course.is_published ? "Publicado" : "Borrador"}
                            </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {course.is_published
                                ? "El curso es visible en el catalogo del aula virtual."
                                : "El curso solo es visible para ti en el panel de administracion."}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant={course.is_published ? "outline" : "default"}
                        disabled={!course.is_published && !canPublish}
                        onClick={togglePublish}
                    >
                        {course.is_published ? (
                            <>
                                <EyeOff className="h-4 w-4" />
                                Despublicar
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4" />
                                Publicar curso
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Edit({ course }) {
    const initialStep = Number(new URLSearchParams(window.location.search).get("step")) || 1;
    const [step, setStep] = useState(STEPS.some((s) => s.id === initialStep) ? initialStep : 1);
    const [openModuleId, setOpenModuleId] = useState(() => course.modules[0]?.id ?? null);

    const goTo = (id) => setStep(id);

    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const totalQuestions = course.exam?.questions?.length ?? 0;

    const step1Valid = Boolean(course.title?.trim());
    const step2Valid = course.modules.length > 0 && totalLessons > 0;
    const step3Valid = totalQuestions > 0;

    let completedUntil = 1;
    if (step1Valid) completedUntil = 2;
    if (step1Valid && step2Valid) completedUntil = 3;
    if (step1Valid && step2Valid && step3Valid) completedUntil = 4;

    const nextBlockedReason =
        step === 2 && !step2Valid
            ? "Agrega al menos un modulo con una clase para continuar."
            : step === 3 && !step3Valid
            ? "Agrega al menos una pregunta al examen para continuar."
            : null;

    return (
        <>
            <Head title={`Editar curso: ${course.title}`} />
            <AdminLayout title={course.title}>
                <div className="mb-4 flex items-center gap-2">
                    <Badge variant={course.is_published ? "default" : "secondary"}>
                        {course.is_published ? "Publicado" : "Borrador"}
                    </Badge>
                    {!course.is_free && <Badge variant="outline">S/ {Number(course.price).toFixed(2)}</Badge>}
                </div>

                <CourseStepper steps={STEPS} current={step} completedUntil={completedUntil} onStepClick={goTo} />

                <div className="max-w-3xl">
                    {step === 1 && <CourseInfoForm course={course} onSaved={() => goTo(2)} />}

                    {step === 2 && (
                        <div className="space-y-4">
                            {course.modules.map((m) => (
                                <ModuleCard
                                    key={m.id}
                                    courseModule={m}
                                    open={openModuleId === m.id}
                                    onToggle={() =>
                                        setOpenModuleId((prev) => (prev === m.id ? null : m.id))
                                    }
                                />
                            ))}
                            <Card>
                                <CardContent className="p-4">
                                    <NewModuleForm courseId={course.id} />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {step === 3 && (
                        <ExamCard
                            title="Examen final"
                            emptyHint="Sin preguntas todavia. El alumno necesita al menos una pregunta para poder rendir el examen."
                            postUrl={`/admin/cursos/${course.id}/examen/preguntas`}
                            exam={course.exam}
                        />
                    )}

                    {step === 4 && <ReviewStep course={course} />}

                    <div className="mt-6 flex items-center justify-between gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={step === 1}
                            onClick={() => goTo(step - 1)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Anterior
                        </Button>

                        {nextBlockedReason && (
                            <p className="flex-1 text-right text-xs text-amber-600">
                                {nextBlockedReason}
                            </p>
                        )}

                        {step < 4 ? (
                            <Button
                                type="button"
                                disabled={Boolean(nextBlockedReason)}
                                onClick={() => goTo(step + 1)}
                            >
                                Siguiente
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button type="button" asChild>
                                <Link href="/admin/cursos">Finalizar</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
