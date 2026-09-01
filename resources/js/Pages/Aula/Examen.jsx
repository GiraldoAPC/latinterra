import { Head, Link, useForm, usePage } from "@inertiajs/react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

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
            <div className="catalog-page lt-public beal-page">
                <Head title={`Examen - ${course.title}`} />
                <link rel="stylesheet" href="/assets/css/nosotros.css" />
                <PublicHeader current="aula" />
                <main className="catalog-main" style={{ paddingTop: "calc(var(--lt-header-h, 88px) + 40px)" }}>
                    <div className="container" style={{ textAlign: "center" }}>
                        <p>Este curso todavia no tiene el examen configurado. Vuelve mas tarde.</p>
                        <Link className="btn btn-primary" href={`/aula/${course.slug}`}>Volver al curso</Link>
                    </div>
                </main>
                <PublicFooter />
            </div>
        );
    }

    return (
        <div className="catalog-page lt-public beal-page">
            <Head title={`Examen final - ${course.title} | Latin Terra`} />

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader current="aula" />

            <main className="catalog-main" style={{ paddingTop: "calc(var(--lt-header-h, 88px) + 20px)" }}>
                <div className="container" style={{ maxWidth: 760, margin: "0 auto" }}>
                    <p className="catalog-hero__crumb" style={{ color: "#64748b", marginBottom: 8 }}>
                        <Link href="/">INICIO</Link> / <Link href={`/aula/${course.slug}`}>{course.title}</Link> / Examen final
                    </p>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 6px" }}>Examen final</h1>
                    <p style={{ color: "#64748b", marginBottom: 20 }}>
                        Necesitas al menos {Number(course.passing_score)}% para aprobar y obtener tu certificado.
                    </p>

                    {flash?.success && (
                        <div
                            style={{
                                padding: "12px 16px",
                                borderRadius: 12,
                                marginBottom: 20,
                                background: lastAttempt?.passed ? "rgba(88,178,45,.12)" : "rgba(239,68,68,.10)",
                                color: lastAttempt?.passed ? "var(--lt-green-2)" : "#b91c1c",
                                fontWeight: 700,
                            }}
                        >
                            {flash.success}
                        </div>
                    )}

                    {lastAttempt?.passed ? (
                        <div style={{ textAlign: "center", padding: "30px 0" }}>
                            <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                                Ya aprobaste este examen con {Number(lastAttempt.score)}%.
                            </p>
                            <Link className="btn btn-primary" href="/aula-virtual/mis-cursos" style={{ marginTop: 12 }}>
                                Ver mi certificado
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-6">
                            {questions.map((q, idx) => (
                                <div key={q.id} className="beal-modal__specs" style={{ display: "block", padding: 16 }}>
                                    <p style={{ fontWeight: 700, marginBottom: 10 }}>{idx + 1}. {q.question}</p>
                                    <div style={{ display: "grid", gap: 8 }}>
                                        {q.options.map((o) => (
                                            <label
                                                key={o.id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    padding: "8px 10px",
                                                    borderRadius: 10,
                                                    border: "1px solid rgba(15,23,42,.08)",
                                                    cursor: "pointer",
                                                    background: data.answers[q.id] === o.id ? "rgba(88,178,45,.08)" : "#fff",
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question_${q.id}`}
                                                    checked={data.answers[q.id] === o.id}
                                                    onChange={() => selectAnswer(q.id, o.id)}
                                                />
                                                <span style={{ fontSize: ".92rem" }}>{o.option_text}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={processing || Object.keys(data.answers).length < questions.length}
                                style={{ width: "100%" }}
                            >
                                Enviar examen
                            </button>
                        </form>
                    )}
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
