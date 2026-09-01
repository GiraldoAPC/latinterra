import { Head, Link } from "@inertiajs/react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

export default function Catalogo({ courses }) {
    return (
        <div className="catalog-page lt-public beal-page">
            <Head title="Aula Virtual | Latin Terra">
                <meta
                    name="description"
                    content="Cursos y capacitaciones online de Latin Terra: trabajo en altura, EPP, seguridad industrial y mas, con certificado al finalizar."
                />
            </Head>

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader current="aula" />

            <section className="catalog-hero" aria-label="Encabezado Aula Virtual">
                <div className="catalog-hero__bg" style={{ backgroundImage: "url('/assets/img/encabezado/epp-y-seguridad.jpg')" }} />
                <div className="catalog-hero__overlay" />
                <div className="catalog-hero__content">
                    <h1 className="catalog-hero__title">Aula Virtual</h1>
                    <p className="catalog-hero__subtitle">
                        Capacitate con nuestros cursos online y obten tu certificado al aprobar
                    </p>
                    <p className="catalog-hero__crumb">
                        <Link href="/">INICIO</Link> / AULA VIRTUAL
                    </p>
                </div>
                <div className="catalog-hero__curve" aria-hidden="true" />
            </section>

            <main className="catalog-main">
                <div className="container">
                    {courses.length === 0 && (
                        <p className="catalog-empty">Todavia no hay cursos publicados. Vuelve pronto.</p>
                    )}

                    <section className="product-grid" aria-label="Cursos disponibles">
                        {courses.map((course) => (
                            <article key={course.id} className="product-card reveal">
                                <div className="product-logo" style={{ height: 160 }}>
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} loading="lazy" />
                                    ) : (
                                        <i className="fa-solid fa-graduation-cap" aria-hidden="true" style={{ fontSize: 40, color: "#94a3b8" }} />
                                    )}
                                </div>
                                <span className="beal-card__tag">
                                    {course.is_free ? "Gratis" : `S/ ${Number(course.price).toFixed(2)}`}
                                </span>
                                <h3>{course.title}</h3>
                                <p>{course.summary || "Curso de capacitacion Latin Terra."}</p>
                                <div className="beal-card__meta">
                                    <span>{course.total_lessons} clases</span>
                                    <span>{course.enrollments_count} inscritos</span>
                                </div>
                                <a className="btn btn-primary product-quote-btn" href={`/aula/${course.slug}`}>
                                    Ver curso
                                </a>
                            </article>
                        ))}
                    </section>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
