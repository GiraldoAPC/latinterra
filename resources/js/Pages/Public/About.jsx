import { Head, Link } from "@inertiajs/react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

const WHATSAPP_PHONE = "51954178081";
const WHATSAPP_TEXT = "Hola Latin Terra, quisiera cotizar sus productos.";
const WHATSAPP_WEB_URL = `https://web.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(WHATSAPP_TEXT)}`;

export default function About() {
    return (
        <>
            <Head title="Nosotros | Latin Terra" />
            <meta
                name="description"
                content="Conoce Latin Terra: empresa peruana de productos industriales, comerciales y de seguridad."
            />

            {/* CSS SOLO de esta página */}
            <link rel="stylesheet" href="/assets/css/nosotros.css" />

            {/* JS SOLO de esta página */}
            <script defer src="/assets/js/nosotros.js"></script>

            <div className="lt-public">
            {/* ============ HEADER (menú) ============ */}
            <PublicHeader current="about" whatsappHref={WHATSAPP_WEB_URL} />

            
            <section className="page-hero" aria-label="Encabezado Nosotros">
                <div
                    className="page-hero__bg"
                    style={{
                        backgroundImage:
                            "url('/assets/img/nosotros-latin-terra.jpg')",
                    }}
                />
                <div className="page-hero__overlay" />

                <div className="container page-hero__inner">
                    <div className="page-hero__left reveal">
                        <p className="breadcrumb">
                            <a href="/">Inicio</a>
                            <span className="sep">/</span>
                            <span>Nosotros</span>
                        </p>
                        <h1>Nosotros</h1>
                        <p className="subtitle">
                            Conoce quiénes somos, nuestra misión, visión y lo
                            que nos diferencia.
                        </p>
                    </div>

                    <div
                        className="page-hero__right reveal"
                        style={{ transitionDelay: ".06s" }}
                    >
                        <div className="hero-card">
                            <b>Latin Terra</b>
                            <p>
                                Suministro de equipos de protección personal
                                (EPP), herramientas, equipos para trabajo en
                                altura, artículos de ferretería industrial y
                                equipos de medición, con asesoría técnica
                                especializada y gestión logística eficiente.
                            </p>
                            <div className="hero-tags">
                                <span>EPP</span>
                                <span>Eléctricos</span>
                                <span>Herramientas</span>
                                <span>Altura</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero-wave" aria-hidden="true">
                    <svg viewBox="0 0 1440 160" preserveAspectRatio="none">
                        <path d="M0,96 C180,150 360,20 540,64 C720,108 900,150 1080,112 C1260,74 1350,36 1440,56 L1440,160 L0,160 Z" />
                    </svg>
                </div>
            </section>

            {/* ============ CONTENIDO NOSOTROS ============ */}
            <main className="page">
                <section className="about">
                    <div className="container">
                        <div className="about-grid">
                            <div className="about-copy reveal">
                                <h2>¿Quiénes somos?</h2>
                                <p>
                                    <b>Latin Terra</b> Latin Terra es una
                                    empresa peruana especializada en la
                                    comercialización de equipos de protección
                                    personal (EPP), herramientas, equipos para
                                    trabajo en altura, artículos de ferretería
                                    industrial y equipos de medición, dirigida a
                                    empresas de los sectores construcción,
                                    industria, minería, mantenimiento y
                                    servicios técnicos.
                                </p>
                                <p>
                                    Trabajamos con marcas reconocidas del
                                    mercado y ofrecemos productos certificados
                                    que cumplen con estándares de seguridad y
                                    calidad, asegurando soluciones confiables
                                    para operaciones en campo y planta.
                                </p>
                                <p>
                                    Brindamos asesoría técnica personalizada,
                                    cotizaciones formales en PDF y atención
                                    directa vía WhatsApp, garantizando rapidez
                                    en la gestión, opciones de descuento y
                                    facilidades de pago. Nuestro objetivo es
                                    convertirnos en un proveedor estratégico que
                                    aporte eficiencia, seguridad y continuidad
                                    operativa a nuestros clientes a nivel
                                    nacional.
                                </p>

                                <div className="about-features">
                                    <div className="feature-box">
                                        <div className="feature-icon quality">
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <path
                                                    d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                                <path
                                                    d="M9 12l2 2 4-5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                            </svg>
                                        </div>
                                        <h4>Calidad</h4>
                                        <p>Productos de marcas reconocidas.</p>
                                    </div>

                                    <div className="feature-box">
                                        <div className="feature-icon advice">
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <path
                                                    d="M12 3a7 7 0 0 0-4 12.7V21l4-2 4 2v-5.3A7 7 0 0 0 12 3Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                                <path
                                                    d="M12 8v4"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    strokeLinecap="round"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                                <path
                                                    d="M12 15h.01"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    strokeLinecap="round"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                            </svg>
                                        </div>
                                        <h4>Asesoría</h4>
                                        <p>Soporte técnico especializado.</p>
                                    </div>

                                    <div className="feature-box">
                                        <div className="feature-icon logistics">
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <path
                                                    d="M3 7h11v10H3z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                                <path
                                                    d="M14 10h4l3 3v4h-7z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                                <circle
                                                    cx="7"
                                                    cy="19"
                                                    r="2"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                                <circle
                                                    cx="17"
                                                    cy="19"
                                                    r="2"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                            </svg>
                                        </div>
                                        <h4>Logística</h4>
                                        <p>Stock y despachos eficientes.</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="about-media reveal"
                                style={{ transitionDelay: ".06s" }}
                            >
                                <div className="media-card">
                                    <img
                                        src="/assets/img/quienes-somos.jpg"
                                        alt="Latin Terra - entorno industrial"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Misión / Visión */}
                <section className="mv">
                    <div className="container">
                        <div className="section-head reveal">
                            <h2>Misión y Visión</h2>
                            <p>
                                Dirección estratégica y compromiso con la mejora
                                continua.
                            </p>
                        </div>

                        <div className="mv-grid">
                            <article className="mv-card reveal">
                                <div className="mv-icon" />
                                <h3>Misión</h3>
                                <p>
                                    Proveer productos industriales, comerciales
                                    y de seguridad que cumplan con los más altos
                                    estándares de calidad, seguridad y
                                    rendimiento, acompañados de una atención
                                    personalizada y asesoría técnica que
                                    contribuya al éxito y continuidad de las
                                    operaciones de nuestros clientes.
                                </p>
                            </article>

                            <article
                                className="mv-card reveal"
                                style={{ transitionDelay: ".06s" }}
                            >
                                <div className="mv-icon" />
                                <h3>Visión</h3>
                                <p>
                                    Ser una empresa líder en el mercado peruano
                                    en la comercialización de productos
                                    industriales y de seguridad, reconocida por
                                    la calidad, confiabilidad,
                                    atención al cliente y compromiso con la
                                    mejora continua.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Valores */}
                <section className="values-section">
                    <div
                        className="values-bg"
                        style={{
                            backgroundImage: "url('/assets/img/nosotros.jpg')",
                        }}
                    />
                    <div className="values-overlay" />

                    <div className="container values-wrap reveal">
                        <div className="values-head">
                            <h2>
                                <span>Nuestros</span> Valores
                            </h2>
                        </div>

                        <div className="values-strip">
                            <div className="value-pill">
                                <div className="value-circle">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <path d="M18 8l2 2m0-2l-2 2" />
                                    </svg>
                                </div>
                                <div className="value-label">
                                    ORIENTACIÓN AL CLIENTE
                                </div>
                            </div>

                            <div className="value-pill">
                                <div className="value-circle">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z" />
                                        <path d="M9 12l2 2 4-5" />
                                    </svg>
                                </div>
                                <div className="value-label">CALIDAD</div>
                            </div>

                            <div className="value-pill">
                                <div className="value-circle">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path d="M12 21s-7-4.4-7-11a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6.6-7 11-7 11Z" />
                                        <path d="M9.5 11.5l2 2 3-3.5" />
                                    </svg>
                                </div>
                                <div className="value-label">
                                    RESPONSABILIDAD
                                </div>
                            </div>

                            <div className="value-pill">
                                <div className="value-circle">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path d="M7 12l3 3 7-7" />
                                        <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10Z" />
                                    </svg>
                                </div>
                                <div className="value-label">COMPROMISO</div>
                            </div>

                            <div className="value-pill">
                                <div className="value-circle">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path d="M12 3l7 4v6c0 4.5-3 8.2-7 8.9-4-.7-7-4.4-7-8.9V7l7-4Z" />
                                        <path d="M12 10v5" />
                                        <path d="M12 18h.01" />
                                    </svg>
                                </div>
                                <div className="value-label">
                                    ÉTICA COMERCIAL
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Diferenciadores + compromiso */}
                <section className="diffpro">
                    <div className="container">
                        <div className="diffpro-head reveal">
                            <h2>¿Qué nos diferencia?</h2>
                            <p>
                                Soluciones confiables, atención personalizada y
                                cobertura nacional para operaciones y proyectos.
                            </p>
                        </div>

                        <div className="diffpro-grid">
                            <article className="dcard reveal">
                                <div
                                    className="dimg"
                                    style={{
                                        backgroundImage:
                                            "url('/assets/img/amplio-portafolio.jpg')",
                                    }}
                                />
                                <div className="dcontent">
                                    <h3>Amplio portafolio</h3>
                                    <p>
                                        Productos industriales, comerciales y de
                                        seguridad para diferentes sectores.
                                    </p>
                                </div>
                            </article>

                            <article
                                className="dcard reveal"
                                style={{ transitionDelay: ".03s" }}
                            >
                                <div
                                    className="dimg"
                                    style={{
                                        backgroundImage:
                                            "url('/assets/img/alianzas-con-marcas.jpg')",
                                    }}
                                />
                                <div className="dcontent">
                                    <h3>Alianzas con marcas</h3>
                                    <p>
                                        Marcas reconocidas a nivel nacional e
                                        internacional para calidad y
                                        rendimiento.
                                    </p>
                                </div>
                            </article>

                            <article
                                className="dcard reveal"
                                style={{ transitionDelay: ".06s" }}
                            >
                                <div
                                    className="dimg"
                                    style={{
                                        backgroundImage:
                                            "url('/assets/img/atencion-personalizada.jpg')",
                                    }}
                                />
                                <div className="dcontent">
                                    <h3>Atención personalizada</h3>
                                    <p>
                                        Enfoque en soluciones con asesoría
                                        técnica para cada requerimiento.
                                    </p>
                                </div>
                            </article>

                            <article
                                className="dcard reveal"
                                style={{ transitionDelay: ".09s" }}
                            >
                                <div
                                    className="dimg"
                                    style={{
                                        backgroundImage:
                                            "url('/assets/img/stock-y-logistica-eficiente.jpg')",
                                    }}
                                />
                                <div className="dcontent">
                                    <h3>Stock y logística eficiente</h3>
                                    <p>
                                        Disponibilidad y tiempos de entrega
                                        optimizados para tu operación.
                                    </p>
                                </div>
                            </article>

                            <article
                                className="dcard reveal"
                                style={{ transitionDelay: ".12s" }}
                            >
                                <div
                                    className="dimg"
                                    style={{
                                        backgroundImage:
                                            "url('/assets/img/cobertura-nacional.jpg')",
                                    }}
                                />
                                <div className="dcontent">
                                    <h3>Cobertura nacional</h3>
                                    <p>
                                        Despachos a nivel nacional con
                                        coordinación y seguimiento.
                                    </p>
                                </div>
                            </article>

                            <article
                                className="dcard reveal"
                                style={{ transitionDelay: ".15s" }}
                            >
                                <div
                                    className="dimg"
                                    style={{
                                        backgroundImage:
                                            "url('/assets/img/clientes-corporativos-y-proyectos.jpg')",
                                    }}
                                />
                                <div className="dcontent">
                                    <h3>Clientes corporativos y proyectos</h3>
                                    <p>
                                        Atención a empresas y obras con
                                        abastecimiento planificado.
                                    </p>
                                </div>
                            </article>
                        </div>

                        <div className="commitpro reveal">
                            <div
                                className="commitpro-bg"
                                style={{
                                    backgroundImage:
                                        "url('/assets/img/nuestro-compromiso.jpg')",
                                }}
                            />
                            <div className="commitpro-overlay" />

                            <div className="commitpro-inner">
                                <div>
                                    <h2>Nuestro compromiso</h2>
                                    <p>
                                        En Latin Terra trabajamos para ser más
                                        que un proveedor: somos un aliado
                                        comercial confiable, enfocado en brindar
                                        productos seguros, eficientes y
                                        alineados a las exigencias del mercado
                                        actual.
                                    </p>
                                </div>

                                <div className="commitpro-actions">
                                    <a
                                        className="btn btn-primary"
                                        href="/#contacto"
                                    >
                                        Cotizar ahora
                                    </a>
                                    <a
                                        className="btn btn-dark"
                                        href="/#productos"
                                    >
                                        Ver productos
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* ============ FOOTER ============ */}
            <PublicFooter />

            {/* WhatsApp flotante */}
            <a
                className="wa-float"
                id="waFloat"
                href={WHATSAPP_WEB_URL}
                aria-label="WhatsApp"
                target="_blank"
                rel="noreferrer"
            >
                <img
                    src="/assets/img/whatsapp.svg"
                    alt=""
                    className="wa-svg"
                    aria-hidden="true"
                />
                <span className="wa-dot" />
                WhatsApp
            </a>
            </div>
        </>
    );
}
