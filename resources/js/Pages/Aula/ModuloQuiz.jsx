import { useCallback, useEffect, useRef, useState } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ArrowRight, ListChecks, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const PASSING_SCORE = 13;
const TIME_PER_QUESTION = 45;

export default function ModuloQuiz({ course, module, lastAttempt, attemptCount = 0 }) {
    const { flash } = usePage().props;
    const questions = module.exam?.questions ?? [];
    const alreadyPassed = !!lastAttempt?.passed;

    const { data, setData, post, processing } = useForm({ answers: {} });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
    const submittedRef = useRef(false);

    // El resultado (aprobado/reprobado) llega por flash tras el redirect;
    // subimos el scroll para que nunca pase desapercibido.
    useEffect(() => {
        if (flash?.success) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [flash?.success]);

    const submit = useCallback(() => {
        if (submittedRef.current) return;
        submittedRef.current = true;
        post(`/aula/${course.slug}/modulo/${module.id}/quiz`);
    }, [course.slug, module.id, post]);

    // Cronometro por pregunta: no corre si ya aprobo o no hay preguntas.
    // Se reinicia cada vez que cambia la pregunta actual.
    useEffect(() => {
        if (alreadyPassed || questions.length === 0) return;

        setTimeLeft(TIME_PER_QUESTION);
        const interval = setInterval(() => {
            setTimeLeft((t) => (t > 0 ? t - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [currentIndex, alreadyPassed, questions.length]);

    // Cuando se agota el tiempo: si quedaban blanco cuenta como fallada y
    // pasa sola a la siguiente, o envia el quiz si era la ultima.
    useEffect(() => {
        if (alreadyPassed || timeLeft > 0 || questions.length === 0) return;

        if (currentIndex < questions.length - 1) {
            setCurrentIndex((i) => i + 1);
        } else {
            submit();
        }
    }, [timeLeft, alreadyPassed, currentIndex, questions.length, submit]);

    const selectAnswer = (questionId, optionId) => {
        setData("answers", { ...data.answers, [questionId]: optionId });
    };

    const goNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((i) => i + 1);
        } else {
            submit();
        }
    };

    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

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
                    <p className="mb-1 text-slate-500">
                        Necesitas al menos {PASSING_SCORE}/20 para aprobar y desbloquear el siguiente modulo. Tienes{" "}
                        {TIME_PER_QUESTION} segundos por pregunta - si no alcanzas a responder pasa sola y cuenta
                        como fallada. Si no alcanzas la nota, el modulo se reinicia y hay que repasar las clases.
                    </p>
                    {attemptCount > 0 && (
                        <p className="mb-5 text-sm text-slate-400">
                            Llevas {attemptCount} {attemptCount === 1 ? "intento" : "intentos"}.
                        </p>
                    )}

                    {flash?.success && (
                        <div className="mb-5 flex items-start gap-3 rounded-xl border-2 border-[#00ADEE]/30 bg-[#00ADEE]/10 px-4 py-3.5 font-semibold text-[#024A7D]">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                            <p>{flash.success}</p>
                        </div>
                    )}

                    {alreadyPassed ? (
                        <Card>
                            <CardContent className="py-10 text-center">
                                <p className="font-semibold text-[#024A7D]">
                                    Ya aprobaste este quiz con {Number(lastAttempt.score)}/20.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/aula-virtual/mis-cursos">
                                        Continuar con el curso
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : currentQuestion ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">
                                    Pregunta {currentIndex + 1} de {questions.length}
                                </span>
                                <span
                                    className={cn(
                                        "flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold tabular-nums",
                                        timeLeft <= 10 ? "bg-red-100 text-red-700" : "bg-[#00ADEE]/10 text-[#024A7D]"
                                    )}
                                >
                                    <Clock className="h-4 w-4" />
                                    {timeLeft}s
                                </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 ease-linear",
                                        timeLeft <= 10 ? "bg-red-500" : "bg-[#00ADEE]"
                                    )}
                                    style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
                                />
                            </div>

                            <Card>
                                <CardContent className="p-4">
                                    <p className="mb-2.5 font-semibold text-[#024A7D]">
                                        {currentIndex + 1}. {currentQuestion.question}
                                    </p>
                                    {currentQuestion.type === "short_answer" ? (
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Escribe tu respuesta..."
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#00ADEE] focus:outline-none"
                                            value={data.answers[currentQuestion.id] ?? ""}
                                            onChange={(e) => selectAnswer(currentQuestion.id, e.target.value)}
                                        />
                                    ) : (
                                        <div className="grid gap-2">
                                            {currentQuestion.options.map((o) => (
                                                <label
                                                    key={o.id}
                                                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                                                        data.answers[currentQuestion.id] === o.id
                                                            ? "border-[#00ADEE] bg-[#00ADEE]/5"
                                                            : "border-slate-200"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question_${currentQuestion.id}`}
                                                        checked={data.answers[currentQuestion.id] === o.id}
                                                        onChange={() => selectAnswer(currentQuestion.id, o.id)}
                                                    />
                                                    {o.option_text}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Button type="button" className="w-full" disabled={processing} onClick={goNext}>
                                {isLastQuestion ? "Finalizar quiz" : "Siguiente pregunta"}
                            </Button>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-10 text-center text-slate-500">
                                Este modulo todavia no tiene el quiz configurado.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </StudentLayout>
        </>
    );
}
