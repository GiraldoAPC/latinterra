import { useEffect } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ArrowRight, ListChecks, CheckCircle2, XCircle } from "lucide-react";

export default function ModuloQuiz({ course, module, lastAttempt }) {
    const { flash } = usePage().props;
    const questions = module.exam?.questions ?? [];
    const passingScore = Number(module.exam?.passing_score ?? 60);

    const { data, setData, post, processing } = useForm({ answers: {} });

    // El resultado (aprobado/reprobado) llega por flash tras el redirect;
    // subimos el scroll para que nunca pase desapercibido.
    useEffect(() => {
        if (flash?.success) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [flash?.success]);

    const selectAnswer = (questionId, optionId) => {
        setData("answers", { ...data.answers, [questionId]: optionId });
    };

    const submit = (e) => {
        e.preventDefault();
        post(`/aula/${course.slug}/modulo/${module.id}/quiz`);
    };

    return (
        <>
            <Head title={`Quiz: ${module.title} - ${course.title}`} />
            <StudentLayout>
                <div className="mx-auto max-w-2xl">
                    <p className="mb-1 text-sm text-slate-500">
                        <Link href={`/aula/${course.slug}`} className="hover:underline">
                            {course.title}
                        </Link>{" "}
                        / Quiz de modulo
                    </p>
                    <h1 className="mb-1 flex items-center gap-2 text-xl font-bold text-[#024A7D]">
                        <ListChecks className="h-5 w-5 text-[#024A7D]" />
                        Quiz: {module.title}
                    </h1>
                    <p className="mb-5 text-slate-500">
                        Necesitas al menos {passingScore}% para aprobar y desbloquear el siguiente modulo.
                    </p>

                    {flash?.success && (
                        <div
                            className={`mb-5 flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 font-semibold ${
                                lastAttempt?.passed
                                    ? "border-[#00ADEE]/30 bg-[#00ADEE]/10 text-[#024A7D]"
                                    : "border-red-200 bg-red-50 text-red-700"
                            }`}
                        >
                            {lastAttempt?.passed ? (
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                            ) : (
                                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                            )}
                            <div>
                                <p>{flash.success}</p>
                                {lastAttempt && !lastAttempt.passed && (
                                    <p className="mt-1 text-sm font-normal">
                                        Obtuviste {Number(lastAttempt.score)}% (necesitas {passingScore}%).
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {lastAttempt?.passed ? (
                        <Card>
                            <CardContent className="py-10 text-center">
                                <p className="font-semibold text-[#024A7D]">
                                    Ya aprobaste este quiz con {Number(lastAttempt.score)}%.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/aula-virtual/mis-cursos">
                                        Continuar con el curso
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
