import { Head, Link, useForm, usePage } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";

export default function Examen({ course, enrollment, lastAttempt }) {
    const { flash } = usePage().props;
    const questions = course.exam?.questions ?? [];

    const { data, setData, post, processing } = useForm({ answers: {} });

    const selectAnswer = (questionId, optionId) => {
        setData("answers", { ...data.answers, [questionId]: optionId });
    };

    const submit = (e) => {
        e.preventDefault();
        post(`/aula/${course.slug}/examen`);
    };

    if (questions.length === 0) {
        return (
            <>
                <Head title={`Examen - ${course.title}`} />
                <StudentLayout title="Examen final">
                    <h1 className="mb-4 text-xl font-bold text-[#024A7D]">Examen final</h1>
                    <Card>
                        <CardContent className="py-10 text-center text-slate-500">
                            Este curso todavia no tiene el examen configurado. Vuelve mas tarde.
                            <div className="mt-4">
                                <Button asChild>
                                    <Link href={`/aula/${course.slug}`}>Volver al curso</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </StudentLayout>
            </>
        );
    }

    return (
        <>
            <Head title={`Examen final - ${course.title}`} />
            <StudentLayout>
                <div className="mx-auto max-w-2xl">
                    <p className="mb-1 text-sm text-slate-500">
                        <Link href={`/aula/${course.slug}`} className="hover:underline">{course.title}</Link> / Examen final
                    </p>
                    <h1 className="mb-1 text-xl font-bold text-[#024A7D]">Examen final</h1>
                    <p className="mb-5 text-slate-500">
                        Necesitas al menos {Number(course.passing_score)}% para aprobar y obtener tu certificado.
                    </p>

                    {flash?.success && (
                        <div
                            className={`mb-5 rounded-xl px-4 py-3 font-semibold ${
                                lastAttempt?.passed
                                    ? "bg-[#00ADEE]/10 text-[#024A7D]"
                                    : "bg-red-50 text-red-700"
                            }`}
                        >
                            {flash.success}
                        </div>
                    )}

                    {lastAttempt?.passed ? (
                        <Card>
                            <CardContent className="py-10 text-center">
                                <p className="font-semibold text-[#024A7D]">
                                    Ya aprobaste este examen con {Number(lastAttempt.score)}%.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/aula-virtual/mis-cursos">Ver mi certificado</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <form onSubmit={submit} className="space-y-4">
                            {questions.map((q, idx) => (
                                <Card key={q.id}>
                                    <CardContent className="p-4">
                                        <p className="mb-2.5 font-semibold text-[#024A7D]">{idx + 1}. {q.question}</p>
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
                                Enviar examen
                            </Button>
                        </form>
                    )}
                </div>
            </StudentLayout>
        </>
    );
}
