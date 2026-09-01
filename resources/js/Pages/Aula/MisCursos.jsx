import { Head, Link } from "@inertiajs/react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

export default function MisCursos({ enrollments }) {
    return (
        <div className="catalog-page lt-public beal-page">
            <Head title="Mis Cursos | Aula Virtual | Latin Terra" />

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader current="aula" />

            <section className="catalog-hero" aria-label="Mis cursos" style={{ minHeight: 220 }}>
                <div className="catalog-hero__bg" style={{ backgroundImage: "url('/assets/img/encabezado/epp-y-seguridad.jpg')" }} />
                <div className="catalog-hero__overlay" />
                <div className="catalog-hero__content">
                    <h1 className="catalog-hero__title">Mis Cursos</h1>
                    <p className="catalog-hero__crumb">
                        <Link href="/">INICIO</Link> / <Link href="/aula">AULA VIRTUAL</Link> / MIS CURSOS
                    </p>
                </div>
                <div className="catalog-hero__curve" aria-hidden="true" />
            </section>

            <main className="catalog-main">
                <div className="container">
                    {enrollments.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                            <p className="catalog-empty" style={{ display: "block" }}>
                                Aun no estas inscrito en ningun curso.
                            </p>
                            <Link className="btn btn-primary" href="/aula" style={{ marginTop: 12 }}>
                                Ver catalogo de cursos
                            </Link>
                        </div>
                    )}

                    <section className="product-grid" aria-label="Mis cursos">
                        {enrollments.map((e) => (
                            <article key={e.id} className="product-card reveal">
                                <span className="beal-card__tag">
                                    {e.status === "completed" ? "Completado" : "En curso"}
                                </span>
                                <h3>{e.course.title}</h3>
                                <div style={{ margin: "8px 0" }}>
                                    <div style={{ height: 8, borderRadius: 999, background: "rgba(15,23,42,.08)", overflow: "hidden" }}>
                                        <div
                                            style={{
                                                height: "100%",
                                                width: `${e.progress}%`,
                                                background: "var(--lt-green)",
                                                borderRadius: 999,
                                            }}
                                        />
                                    </div>
                                    <span style={{ fontSize: ".8rem", color: "#64748b" }}>{e.progress}% completado</span>
                                </div>

                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    <Link className="btn btn-primary product-quote-btn" href={`/aula/${e.course.slug}`}>
                                        {e.progress >= 100 ? "Revisar curso" : "Continuar"}
                                    </Link>
                                    {e.progress >= 100 && (
                                        <Link className="btn btn-dark product-quote-btn" href={`/aula/${e.course.slug}/examen`}>
                                            Rendir examen
                                        </Link>
                                    )}
                                    {e.has_certificate && (
                                        <Link className="btn btn-outline product-quote-btn" href={`/aula/certificado/${e.id}`}>
                                            Ver certificado
                                        </Link>
                                    )}
                                </div>
                            </article>
                        ))}
                    </section>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
