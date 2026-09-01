import { Head, Link, router } from "@inertiajs/react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

export default function Leccion({ course, lesson, enrollment, completedLessonIds, allCompleted }) {
    const isCompleted = completedLessonIds.includes(lesson.id);

    const markComplete = () => {
        router.post(`/aula/${course.slug}/clase/${lesson.id}/completar`);
    };

    return (
        <div className="catalog-page lt-public beal-page">
            <Head title={`${lesson.title} - ${course.title} | Latin Terra`} />

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader current="aula" />

            <main className="catalog-main" style={{ paddingTop: "calc(var(--lt-header-h, 88px) + 20px)" }}>
                <div className="container">
                    <p className="catalog-hero__crumb" style={{ color: "#64748b", marginBottom: 12 }}>
                        <Link href="/">INICIO</Link> / <Link href={`/aula/${course.slug}`}>{course.title}</Link> / {lesson.title}
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }} className="lesson-layout">
                        <div>
                            <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 16, overflow: "hidden", background: "#000" }}>
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${lesson.youtube_video_id}`}
                                    title={lesson.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                                />
                            </div>

                            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "16px 0 6px" }}>{lesson.title}</h1>
                            {lesson.description && <p style={{ color: "#64748b" }}>{lesson.description}</p>}

                            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={markComplete}
                                    disabled={isCompleted}
                                >
                                    {isCompleted ? "Clase completada" : "Marcar como completada"}
                                </button>
                                {allCompleted && (
                                    <Link className="btn btn-dark" href={`/aula/${course.slug}/examen`}>
                                        Rendir examen final
                                    </Link>
                                )}
                            </div>
                        </div>

                        <aside>
                            <div className="beal-modal__specs" style={{ marginBottom: 14 }}>
                                <div className="beal-modal__spec beal-modal__spec--wide">
                                    <i className="fa-solid fa-chart-simple" aria-hidden="true" />
                                    <span>Progreso: {enrollment.progress}%</span>
                                </div>
                            </div>

                            {course.modules.map((m) => (
                                <div key={m.id} style={{ marginBottom: 14 }}>
                                    <h4 style={{ fontWeight: 800, fontSize: ".9rem", margin: "0 0 6px" }}>{m.title}</h4>
                                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                        {m.lessons.map((l) => {
                                            const done = completedLessonIds.includes(l.id);
                                            const active = l.id === lesson.id;
                                            return (
                                                <li key={l.id}>
                                                    <Link
                                                        href={`/aula/${course.slug}/clase/${l.id}`}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 8,
                                                            padding: "8px 10px",
                                                            borderRadius: 10,
                                                            fontSize: ".86rem",
                                                            fontWeight: active ? 800 : 500,
                                                            color: active ? "var(--lt-green-2)" : "#334155",
                                                            background: active ? "rgba(88,178,45,.10)" : "transparent",
                                                        }}
                                                    >
                                                        <i
                                                            className={`fa-solid ${done ? "fa-circle-check" : "fa-circle-play"}`}
                                                            style={{ color: done ? "var(--lt-green)" : "#94a3b8" }}
                                                            aria-hidden="true"
                                                        />
                                                        {l.title}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </aside>
                    </div>
                </div>
            </main>

            <PublicFooter />

            <style>{`
                @media (max-width: 900px) {
                    .lesson-layout { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
