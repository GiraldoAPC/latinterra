import { Head, useForm, router } from "@inertiajs/react";
import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Plus, Trash2, GripVertical, CheckCircle2 } from "lucide-react";

function CourseInfoForm({ course }) {
    const { data, setData, put, processing, errors } = useForm({
        title: course.title,
        summary: course.summary ?? "",
        description: course.description ?? "",
        price: String(course.price),
        is_free: course.is_free,
        is_published: course.is_published,
        passing_score: String(course.passing_score),
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/cursos/${course.id}`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Informacion del curso</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Titulo</label>
                        <input
                            type="text"
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                        />
                        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Resumen corto</label>
                        <input
                            type="text"
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            value={data.summary}
                            onChange={(e) => setData("summary", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Descripcion</label>
                        <textarea
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            rows={4}
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_free_edit"
                            checked={data.is_free}
                            onChange={(e) => setData("is_free", e.target.checked)}
                        />
                        <label htmlFor="is_free_edit" className="text-sm font-medium">Curso gratuito</label>
                    </div>

                    {!data.is_free && (
                        <div>
                            <label className="text-sm font-medium">Precio (S/)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                value={data.price}
                                onChange={(e) => setData("price", e.target.value)}
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium">Nota minima examen (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            value={data.passing_score}
                            onChange={(e) => setData("passing_score", e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_published"
                            checked={data.is_published}
                            onChange={(e) => setData("is_published", e.target.checked)}
                        />
                        <label htmlFor="is_published" className="text-sm font-medium">
                            Publicado (visible en el catalogo del aula)
                        </label>
                    </div>

                    <Button type="submit" disabled={processing}>
                        Guardar cambios
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function NewLessonForm({ moduleId, onDone }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title: "",
        youtube_video_id: "",
        duration_seconds: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/admin/modulos/${moduleId}/clases`, {
            onSuccess: () => {
                reset();
                onDone?.();
            },
        });
    };

    return (
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_auto] gap-2 items-start pt-2">
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
                />
                {errors.youtube_video_id && <p className="text-xs text-destructive mt-1">{errors.youtube_video_id}</p>}
            </div>
            <input
                type="number"
                placeholder="Seg."
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={data.duration_seconds}
                onChange={(e) => setData("duration_seconds", e.target.value)}
            />
            <Button type="submit" size="sm" disabled={processing}>
                <Plus className="h-4 w-4" />
                Agregar
            </Button>
        </form>
    );
}

function ModuleCard({ courseModule }) {
    const [showNewLesson, setShowNewLesson] = useState(false);

    const deleteModule = () => {
        if (!confirm(`¿Eliminar el modulo "${courseModule.title}" y todas sus clases?`)) return;
        router.delete(`/admin/modulos/${courseModule.id}`);
    };

    const deleteLesson = (lesson) => {
        if (!confirm(`¿Eliminar la clase "${lesson.title}"?`)) return;
        router.delete(`/admin/clases/${lesson.id}`);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    {courseModule.title}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={deleteModule}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-2">
                {courseModule.lessons.length === 0 && (
                    <p className="text-sm text-muted-foreground">Sin clases todavia.</p>
                )}
                {courseModule.lessons.map((lesson) => (
                    <div
                        key={lesson.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                        <div>
                            <div className="font-medium">{lesson.title}</div>
                            <div className="text-xs text-muted-foreground">
                                YouTube: {lesson.youtube_video_id}
                                {lesson.duration_seconds ? ` · ${Math.round(lesson.duration_seconds / 60)} min` : ""}
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteLesson(lesson)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}

                {showNewLesson ? (
                    <NewLessonForm moduleId={courseModule.id} onDone={() => setShowNewLesson(false)} />
                ) : (
                    <Button variant="outline" size="sm" onClick={() => setShowNewLesson(true)}>
                        <Plus className="h-4 w-4" />
                        Agregar clase
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

function NewModuleForm({ courseId }) {
    const { data, setData, post, processing, reset } = useForm({ title: "" });

    const submit = (e) => {
        e.preventDefault();
        post(`/admin/cursos/${courseId}/modulos`, { onSuccess: () => reset() });
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

function NewQuestionForm({ courseId, onDone }) {
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
        post(`/admin/cursos/${courseId}/examen/preguntas`, {
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

function ExamCard({ courseId, exam }) {
    const [showNew, setShowNew] = useState(false);
    const questions = exam?.questions ?? [];

    const deleteQuestion = (question) => {
        if (!confirm("¿Eliminar esta pregunta?")) return;
        router.delete(`/admin/examen/preguntas/${question.id}`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Examen final</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {questions.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        Sin preguntas todavia. El alumno necesita al menos una pregunta para poder rendir el examen.
                    </p>
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
                    <NewQuestionForm courseId={courseId} onDone={() => setShowNew(false)} />
                ) : (
                    <Button variant="outline" size="sm" onClick={() => setShowNew(true)}>
                        <Plus className="h-4 w-4" />
                        Agregar pregunta
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export default function Edit({ course }) {
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <CourseInfoForm course={course} />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Modulos y clases</h2>
                        {course.modules.map((m) => (
                            <ModuleCard key={m.id} courseModule={m} />
                        ))}
                        <NewModuleForm courseId={course.id} />

                        <h2 className="text-sm font-semibold text-muted-foreground uppercase pt-4">Examen final</h2>
                        <ExamCard courseId={course.id} exam={course.exam} />
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
