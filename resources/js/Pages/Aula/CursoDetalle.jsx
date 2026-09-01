import { Head, Link, usePage, router } from "@inertiajs/react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

export default function CursoDetalle({ course, enrollment, pendingOrder }) {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;

    const enroll = () => {
        router.post(`/aula/${course.slug}/inscribirme`);
    };

    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

    return (
        <div className="catalog-page lt-public beal-page">
            <Head title={`${course.title} | Aula Virtual | Latin Terra`}>
                <meta name="description" content={course.summary || course.title} />
            </Head>

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader current="aula" />

            <section className="catalog-hero" aria-label={`Encabezado ${course.title}`}>
                <div className="catalog-hero__bg" style={{ backgroundImage: "url('/assets/img/encabezado/epp-y-seguridad.jpg')" }} />
                <div className="catalog-hero__overlay" />
                <div className="catalog-hero__content">
                    <h1 className="catalog-hero__title">{course.title}</h1>
                    <p className="catalog-hero__subtitle">{course.summary}</p>
                    <p className="catalog-hero__crumb">
                        <Link href="/">INICIO</Link> / <Link href="/aula">AULA VIRTUAL</Link> / {course.title.toUpperCase()}
                    </p>
                </div>
                <div className="catalog-hero__curve" aria-hidden="true" />
            </section>

            <main className="catalog-main">
                <div className="container">
                    <div className="beal-modal__body" style={{ maxWidth: 760, margin: "0 auto" }}>
                        {course.description && (
                            <p className="beal-modal__description" style={{ whiteSpace: "pre-line" }}>
                                {course.description}
                            </p>
                        )}

                        <div className="beal-modal__specs" style={{ marginBottom: 20 }}>
                            <div className="beal-modal__spec">
                                <i className="fa-solid fa-list-check" aria-hidden="true" />
                                <span>Contenido</span>
                                <strong>{course.modules.length} modulos · {totalLessons} clases</strong>
                            </div>
                            <div className="beal-modal__spec">
                                <i className="fa-solid fa-tag" aria-hidden="true" />
                                <span>Precio</span>
                                <strong>{course.is_free ? "Gratis" : `S/ ${Number(course.price).toFixed(2)}`}</strong>
                            </div>
                        </div>

                        <h2 className="beal-categories__title">Contenido del curso</h2>
                        {course.modules.map((m) => (
                            <div key={m.id} style={{ marginBottom: 12 }}>
                                <h4 style={{ fontWeight: 800, margin: "10px 0 6px" }}>{m.title}</h4>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                    {m.lessons.map((l) => (
                                        <li
                                            key={l.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                padding: "8px 0",
                                                borderBottom: "1px solid rgba(15,23,42,.06)",
                                                color: "#334155",
                                                fontSize: ".92rem",
                                            }}
                                        >
                                            <i className="fa-solid fa-circle-play" style={{ color: "var(--lt-green)" }} aria-hidden="true" />
                                            {l.title}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        <div style={{ marginTop: 28, textAlign: "center" }}>
                            {!isLoggedIn && (
                                <a className="btn btn-primary" href="/login">
                                    Inicia sesion para inscribirte
                                </a>
                            )}

                            {isLoggedIn && enrollment && (
                                <Link className="btn btn-primary" href="/aula-virtual/mis-cursos">
                                    Ir a mis cursos
                                </Link>
                            )}

                            {isLoggedIn && !enrollment && pendingOrder && (
                                <p style={{ color: "#64748b" }}>
                                    Ya registramos tu solicitud de este curso. Te contactaremos para coordinar el pago
                                    y activar tu acceso.
                                </p>
                            )}

                            {isLoggedIn && !enrollment && !pendingOrder && (
                                <button className="btn btn-primary" onClick={enroll}>
                                    {course.is_free ? "Inscribirme gratis" : "Solicitar acceso"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
