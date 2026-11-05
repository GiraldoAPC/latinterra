import { PageHeader } from '@/Components/Shared/PageDesign';
import { useEffect } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ArrowRight, ListChecks, CheckCircle2 } from "lucide-react";

export default function LeccionQuiz({ course, lesson, lastAttempt }) {
    const { flash } = usePage().props;
    const questions = lesson.exam?.questions ?? [];

    const { data, setData, post, processing } = useForm({ answers: {} });

    useEffect(() => {
        if (flash?.success || flash?.error) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [flash?.success, flash?.error]);

    const selectAnswer = (questionId, optionId) => {
        setData("answers", { ...data.answers, [questionId]: optionId });
    };

    const submit = (e) => {
        e.preventDefault();
        post(`/aula/${course.slug}/clase/${lesson.id}/quiz`);
    };

    return (
        <>
            <Head title={`Quiz: ${lesson.title} - ${course.title}`} />
            <StudentLayout>
                <div className="mx-auto max-w-2xl">
                    <p className="mb-1 text-sm text-slate-500">
                        <Link href={`/aula/${course.slug}/clase/${lesson.id}`} className="hover:underline">
                            {lesson.title}
                        </Link>{" "}
                        / Quiz de la clase
                    </p>
                    <PageHeader className="px-5 py-5 sm:px-5 sm:py-5" icon={ListChecks} title={`Quiz: ${lesson.title}`} description="Evaluación del aula virtual" />
                    <p className="mb-5 text-slate-500">
                        Debes responder todas las preguntas correctamente. Si fallas alguna, repasa el tema y vuelve
                        a intentarlo - no hay limite de intentos.
                    </p>

                    {flash?.success && (
                        <div className="mb-5 flex items-start gap-3 rounded-xl border-2 border-[#00ADEE]/30 bg-[#00ADEE]/10 px-4 py-3.5 font-semibold text-[#024A7D]">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                            <p>{flash.success}</p>
                        </div>
                    )}

                    {lastAttempt?.passed ? (
                        <Card>
                            <CardContent className="py-10 text-center">
                                <p className="font-semibold text-[#024A7D]">Ya aprobaste el quiz de esta clase.</p>
                                <Button asChild className="mt-4">
                                    <Link href={`/aula/${course.slug}/clase/${lesson.id}`}>
                                        Volver a la clase
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <form onSubmit={submit} className="space-y-4">
                            {questions.map((q, idx) => (
                                <Card key={q.id}>
                                    <CardContent className="p-4">
                                        <p className="mb-2.5 font-semibold text-[#024A7D]">
                                            {idx + 1}. {q.question}
                                        </p>
                                        {q.type === "short_answer" ? (
                                            <input
                                                type="text"
                                                placeholder="Escribe tu respuesta..."
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#00ADEE] focus:outline-none"
                                                value={data.answers[q.id] ?? ""}
                                                onChange={(e) => selectAnswer(q.id, e.target.value)}
                                            />
                                        ) : (
                                            <div className="grid gap-2">
                                                {q.options.map((o) => (
                                                    <label
                                                        key={o.id}
                                                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                                                            data.answers[q.id] === o.id
                                                                ? "border-[#00ADEE] bg-[#00ADEE]/5"
                                                                : "border-slate-200"
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question_${q.id}`}
                                                            checked={data.answers[q.id] === o.id}
                                                            onChange={() => selectAnswer(q.id, o.id)}
                                                        />
                                                        {o.option_text}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing || Object.keys(data.answers).length < questions.length}
                            >
                                Enviar quiz
                            </Button>
                        </form>
                    )}
                </div>
            </StudentLayout>
        </>
    );
}
