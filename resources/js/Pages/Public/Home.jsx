import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import PublicLayout from "@/Layouts/PublicLayout";

export default function Home() {
    useEffect(() => {
        // Cargar el JS del home (para que funcione slider, whatsapp, reveal, etc.)
        const script = document.createElement("script");
        script.src = "/assets/js/home.js";
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            document.body.classList.remove("menu-open");
            document.body.removeChild(script);
        };
    }, []);

    return (
        <PublicLayout title="Inicio">
            <Head title="Inicio" />
            <link rel="stylesheet" href="/assets/css/home.css" />

            {/* ====== HEADER ====== */}
            <header>
                <div className="container nav">
                    <a
                        className="brand"
                        href="#inicio"
                        aria-label="Latin Terra - Inicio"
                    >
                        <img
                            src="/assets/img/logo.png"
                            alt="Latin Terra Logo"
                        />
                        <div className="name">LATIN TERRA</div>
                    </a>

                    <nav aria-label="NavegaciÃ³n principal">
                        <ul className="menu" id="menu">
                            <li>
                                <a href="#inicio" className="active">
                                    Inicio
                                </a>
                            </li>
                            <li>
                                <Link href="/nosotros">Nosotros</Link>
                            </li>
                            <li>
                                <a href="#productos">Productos</a>
                            </li>
                            <li>
                                <a href="#marcas">Marcas</a>
                            </li>
                            <li>
                                <a href="#cursos">Cursos</a>
                            </li>
                            <li>
                                <a href="#faq">FAQ</a>
                            </li>
                            <li>
                                <a href="#contacto">ContÃ¡ctanos</a>
                            </li>
                        </ul>
                    </nav>

                    <div className="nav-cta">
                        <a
                            className="btn btn-primary"
                            href="#contacto"
                            id="btnCotizar"
                        >
                            Cotizar Ahora
                            <svg
                                className="icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M14 5l7 7-7 7"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M21 12H3"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </a>

                        <a
                            className="whats"
                            href="#"
                            id="btnWhatsTop"
                            aria-label="WhatsApp"
                        >
                            <svg
                                className="icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M20 11.6A8 8 0 1 1 6.5 5.5 8 8 0 0 1 20 11.6Z"
                                    stroke="var(--lt-green-2)"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M7.2 19.9l.8-3.1"
                                    stroke="var(--lt-green-2)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M9.3 8.8c.3-.7.6-.7 1-.7h.6c.2 0 .5 0 .7.5.3.5 1 1.7 1 1.8.1.1.1.3 0 .5-.1.2-.2.3-.3.4l-.4.4c-.1.1-.2.2-.1.4.1.2.6 1.1 1.3 1.7.9.9 1.7 1.2 2 .1l.7-.7c.2-.2.3-.2.5-.1.2.1 1.5.7 1.7.9.2.1.4.2.4.3 0 .1 0 .8-.3 1.1-.3.3-.7.7-1.5.7-.8 0-1.7-.3-2.9-.9-1.2-.6-2.2-1.5-3-2.6-.8-1.1-1.1-2-1.1-2.7 0-.7.2-1.1.4-1.5Z"
                                    fill="var(--lt-green-2)"
                                    opacity=".9"
                                />
                            </svg>
                        </a>

                        <button
                            className="burger"
                            id="burger"
                            aria-label="Abrir menÃº"
                        >
                            <span></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ====== MOBILE DRAWER ====== */}
            <div className="drawer" id="drawer" aria-hidden="true">
                <div
                    className="drawer-panel"
                    role="dialog"
                    aria-modal="true"
                    aria-label="MenÃº"
                >
                    <div className="drawer-head">
                        <div className="brand" style={{ minWidth: "auto" }}>
                            <img
                                src="/assets/img/logo.png"
                                alt="Latin Terra Logo"
                            />
                            <div className="name">LATIN TERRA</div>
                        </div>
                        <button
                            className="burger"
                            id="drawerClose"
                            aria-label="Cerrar menÃº"
                        >
                            <span></span>
                        </button>
                    </div>

                    <ul>
                        <li>
                            <a href="#inicio" data-close="1">
                                Inicio
                            </a>
                        </li>
                        <li>
                            <a href="#nosotros" data-close="1">
                                Nosotros
                            </a>
                        </li>
                        <li>
                            <a href="#productos" data-close="1">
                                Productos
                            </a>
                        </li>
                        <li>
                            <a href="#marcas" data-close="1">
                                Marcas
                            </a>
                        </li>
                        <li>
                            <a href="#cursos" data-close="1">
                                Cursos
                            </a>
                        </li>
                        <li>
                            <a href="#faq" data-close="1">
                                FAQ
                            </a>
                        </li>
                        <li>
                            <a href="#contacto" data-close="1">
                                ContÃ¡ctanos
                            </a>
                        </li>
                    </ul>

                    <div className="drawer-cta">
                        <a
                            className="btn btn-primary"
                            href="#contacto"
                            data-close="1"
                        >
                            Cotizar Ahora
                        </a>
                        <a
                            className="btn btn-dark"
                            href="#"
                            id="btnWhatsDrawer"
                        >
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            {/* ====== HERO / SLIDER ====== */}
            <main id="inicio" className="hero">
                <div className="slides" id="slides">
                    <div
                        className="slide active"
                        style={{
                            backgroundImage: "url(/assets/img/latin-terra.jpg)",
                        }}
                    />
                    <div
                        className="slide"
                        style={{
                            backgroundImage:
                                "url(/assets/img/latin-terra2.jpg)",
                        }}
                    />
                    <div
                        className="slide"
                        style={{
                            backgroundImage:
                                "url(/assets/img/latin-terra3.jpg)",
                        }}
                    />
                </div>

                <div className="container hero-content">
                    <div>
                        <span className="pill reveal">
                            Abastecimiento confiable â€¢ EPP â€¢ Herramientas â€¢
                            ElÃ©ctricos
                        </span>

                        <h1
                            className="reveal"
                            style={{ transitionDelay: ".05s" }}
                        >
                            Soluciones integrales en productos industriales,
                            <br />
                            comerciales y de seguridad
                        </h1>

                        <p
                            className="reveal"
                            style={{ transitionDelay: ".1s" }}
                        >
                            Abastecimiento confiable en herramientas, equipos
                            elÃ©ctricos, EPP, trabajos en altura y mÃ¡s.
                        </p>

                        <div
                            className="hero-actions reveal"
                            style={{ transitionDelay: ".15s" }}
                        >
                            <a className="btn btn-primary" href="#productos">
                                Ver productos
                                <svg
                                    className="icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M4 7h16M4 12h16M4 17h16"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </a>
                            <a className="btn btn-dark" href="#contacto">
                                ContÃ¡ctanos
                                <svg
                                    className="icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M4 4h16v12H5.5L4 17.5V4Z"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M7 8h10M7 11h7"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <aside
                        className="hero-card reveal"
                        style={{ transitionDelay: ".2s" }}
                    >
                        <h3>Todo en un solo proveedor</h3>
                        <p className="mini">
                            Cotiza rÃ¡pido por WhatsApp y recibe atenciÃ³n
                            personalizada para tu obra, industria o comercio.
                        </p>
                        <div className="chips">
                            <span className="chip">EPP</span>
                            <span className="chip">ElÃ©ctricos</span>
                            <span className="chip">Herramientas</span>
                            <span className="chip">Trabajos en altura</span>
                        </div>
                        <div
                            style={{
                                marginTop: 14,
                                display: "flex",
                                gap: 10,
                                flexWrap: "wrap",
                            }}
                        >
                            <a className="btn btn-ghost" href="#marcas">
                                Ver marcas
                            </a>
                            <a className="btn btn-ghost" href="#cursos">
                                Ver cursos
                            </a>
                        </div>
                    </aside>
                </div>

                <div className="hero-controls">
                    <button className="arrow" id="prev" aria-label="Anterior">
                        <svg
                            className="icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M14 6l-6 6 6 6"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    <div id="dots" style={{ display: "flex", gap: 10 }}></div>
                    <button className="arrow" id="next" aria-label="Siguiente">
                        <svg
                            className="icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M10 6l6 6-6 6"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            </main>

            {/* ====== PRODUCTOS ====== */}
            <section
                id="productos"
                style={{
                    background:
                        "linear-gradient(180deg, #f6f7fb 0%, #ffffff 100%)",
                }}
            >
                <div className="container">
                    <div className="section-head">
                        <div>
                            <h2 className="section-title reveal">
                                CategorÃ­as Principales de Productos
                            </h2>
                            <p
                                className="section-sub reveal"
                                style={{ transitionDelay: ".05s" }}
                            >
                                CategorÃ­as destacadas. Cada una con imagen/Ã­cono
                                y enlace a productos.
                            </p>
                        </div>
                        <a
                            className="btn btn-primary reveal"
                            href="/productos"
                            style={{ transitionDelay: ".08s" }}
                        >
                            Ver catÃ¡logo
                        </a>
                    </div>

                    <div className="grid">
                        {/* 1) TRABAJOS EN ALTURA */}
                        <article className="card reveal">
                            {/* âœ… Imagen arriba */}
                            <div className="card-media">
                                <img
                                    src="/assets/img/categorias/Trabajos-en-Altura.jpg"
                                    alt="Trabajos en Altura"
                                    loading="lazy"
                                />
                            </div>

                            <div className="kicker">
                                <span className="badge">Altura</span>
                                <span
                                    className="badge"
                                    style={{
                                        background: "rgba(88,178,45,.12)",
                                        borderColor: "rgba(88,178,45,.22)",
                                        color: "var(--lt-green-2)",
                                    }}
                                >
                                    Destacado
                                </span>
                            </div>

                            {/* Tu Ã­cono + tÃ­tulo (igual al anterior) */}
                            <div className="cat-head">
                                <div className="cat-ico">
                                    <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            opacity=".75"
                                        />
                                        <path
                                            d="M9 12l2 2 4-5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <h4>Trabajos en Altura</h4>
                            </div>

                            <p>
                                Equipos tÃ©cnicos de acceso por cuerda, escalada
                                deportiva e industrial. Sistemas anticaÃ­das,
                                arneses, lÃ­neas de vida, mosquetones, conectores
                                y kits.
                            </p>

                            <a className="link" href="/trabajos-en-altura">
                                Ver productos â†’{/* (tu opciÃ³n pro) */}
                            </a>
                        </article>

                        {/* 2) EPP Y SEGURIDAD */}
                        <article
                            className="card reveal"
                            style={{ transitionDelay: ".04s" }}
                        >
                            <div className="card-media">
                                <img
                                    src="/assets/img/categorias/EPP-y-seguridad.jpg"
                                    alt="EPP y Seguridad"
                                    loading="lazy"
                                />
                            </div>

                            <div className="kicker">
                                <span className="badge">EPP</span>
                            </div>

                            <div className="cat-head cat-green">
                                <div className="cat-ico">
                                    <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M12 3l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V7l8-4Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M9 12l2 2 4-5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <h4>EPP y Seguridad</h4>
                            </div>

                            <p>
                                Cascos, guantes, ropa de seguridad y equipos de
                                protecciÃ³n personal.
                            </p>

                            <a className="link" href="/productos?cat=epp">
                                Ver productos â†’
                            </a>
                        </article>

                        {/* 3) FERRETERÃA */}
                        <article
                            className="card reveal"
                            style={{ transitionDelay: ".08s" }}
                        >
                            <div className="card-media">
                                <img
                                    src="/assets/img/categorias/Ferreteria.jpg"
                                    alt="ArtÃ­culos de FerreterÃ­a"
                                    loading="lazy"
                                />
                            </div>

                            <div className="kicker">
                                <span className="badge">FerreterÃ­a</span>
                            </div>

                            <div className="cat-head">
                                <div className="cat-ico">
                                    <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M3 21h6l12-12-6-6L3 15v6Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M14 6l4 4"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <h4>ArtÃ­culos de FerreterÃ­a</h4>
                            </div>

                            <p>
                                Materiales, consumibles y accesorios
                                industriales.
                            </p>

                            <a
                                className="link"
                                href="/productos?cat=ferreteria"
                            >
                                Ver productos â†’
                            </a>
                        </article>

                        {/* 4) HERRAMIENTAS */}
                        <article className="card reveal">
                            <div className="card-media">
                                <img
                                    src="/assets/img/categorias/Herramientas.jpg"
                                    alt="Herramientas"
                                    loading="lazy"
                                />
                            </div>

                            <div className="kicker">
                                <span className="badge">Herramientas</span>
                            </div>

                            <div className="cat-head">
                                <div className="cat-ico">
                                    <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M14 7l3 3-8 8H6v-3l8-8Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M13 8l3 3"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <h4>Herramientas</h4>
                            </div>

                            <p>Manuales, elÃ©ctricas y especializadas.</p>

                            <a
                                className="link"
                                href="/productos?cat=herramientas"
                            >
                                Ver productos â†’
                            </a>
                        </article>

                        {/* 5) MEDICIÃ“N */}
                        <article
                            className="card reveal"
                            style={{ transitionDelay: ".04s" }}
                        >
                            <div className="card-media">
                                <img
                                    src="/assets/img/categorias/Equipos-digitales-y-de-mediciÃ³n.jpg"
                                    alt="Equipos Digitales y de MediciÃ³n"
                                    loading="lazy"
                                />
                            </div>

                            <div className="kicker">
                                <span className="badge">MediciÃ³n</span>
                            </div>

                            <div className="cat-head cat-green">
                                <div className="cat-ico">
                                    <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M8 7h8M8 11h8M8 15h6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <h4>Equipos Digitales y de MediciÃ³n</h4>
                            </div>

                            <p>
                                Instrumentos de mediciÃ³n, control y monitoreo.
                            </p>

                            <a className="link" href="/productos?cat=medicion">
                                Ver productos â†’
                            </a>
                        </article>
                    </div>
                </div>
            </section>

            {/* ====== MARCAS 
            <section id="marcas">
                <div className="container">
                    <div className="section-head">
                        <div>
                            <h2 className="section-title reveal">Marcas</h2>
                            <p
                                className="section-sub reveal"
                                style={{ transitionDelay: ".05s" }}
                            >
                                Integra tus marcas favoritas. (AquÃ­ puedes poner
                                logos reales en una grilla).
                            </p>
                        </div>
                    </div>

                    <div className="grid">
                        <div
                            className="card reveal"
                            style={{
                                gridColumn: "span 3",
                                textAlign: "center",
                            }}
                        >
                            <h4>Marca 1</h4>
                            <p>Logo aquÃ­</p>
                        </div>
                        <div
                            className="card reveal"
                            style={{
                                gridColumn: "span 3",
                                textAlign: "center",
                                transitionDelay: ".03s",
                            }}
                        >
                            <h4>Marca 2</h4>
                            <p>Logo aquÃ­</p>
                        </div>
                        <div
                            className="card reveal"
                            style={{
                                gridColumn: "span 3",
                                textAlign: "center",
                                transitionDelay: ".06s",
                            }}
                        >
                            <h4>Marca 3</h4>
                            <p>Logo aquÃ­</p>
                        </div>
                        <div
                            className="card reveal"
                            style={{
                                gridColumn: "span 3",
                                textAlign: "center",
                                transitionDelay: ".09s",
                            }}
                        >
                            <h4>Marca 4</h4>
                            <p>Logo aquÃ­</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== CURSOS ====== 
            <section
                id="cursos"
                style={{
                    background:
                        "linear-gradient(180deg, #ffffff 0%, #f6f7fb 100%)",
                }}
            >
                <div className="container">
                    <div className="section-head">
                        <div>
                            <h2 className="section-title reveal">Cursos</h2>
                            <p
                                className="section-sub reveal"
                                style={{ transitionDelay: ".05s" }}
                            >
                                CapacitaciÃ³n y asesorÃ­a (seguridad, EPP,
                                trabajos en altura, uso de equipos).
                            </p>
                        </div>
                    </div>

                    <div className="grid">
                        <article className="card reveal">
                            <div className="kicker">
                                <span className="badge">Seguridad</span>
                            </div>
                            <h4>InducciÃ³n de EPP</h4>
                            <p>
                                SelecciÃ³n correcta, inspecciÃ³n, mantenimiento y
                                normas de seguridad.
                            </p>
                            <a className="link" href="#contacto">
                                Pedir informaciÃ³n â†’
                            </a>
                        </article>

                        <article
                            className="card reveal"
                            style={{ transitionDelay: ".05s" }}
                        >
                            <div className="kicker">
                                <span className="badge">Altura</span>
                            </div>
                            <h4>Trabajos en Altura</h4>
                            <p>
                                ArnÃ©s, anclajes, lÃ­neas de vida y prevenciÃ³n de
                                caÃ­das (teorÃ­a + prÃ¡ctica).
                            </p>
                            <a className="link" href="#contacto">
                                Solicitar agenda â†’
                            </a>
                        </article>

                        <article
                            className="card reveal"
                            style={{ transitionDelay: ".1s" }}
                        >
                            <div className="kicker">
                                <span className="badge">ElÃ©ctrico</span>
                            </div>
                            <h4>Seguridad ElÃ©ctrica</h4>
                            <p>
                                Procedimientos, riesgos, seÃ±alizaciÃ³n,
                                bloqueo/etiquetado (segÃºn necesidad).
                            </p>
                            <a className="link" href="#contacto">
                                Consultar â†’
                            </a>
                        </article>
                    </div>
                </div>
            </section>====== */}

            {/* ====== FAQ ====== */}
            <section id="faq">
                <div className="container">
                    <div className="section-head">
                        <div>
                            <h2 className="section-title reveal">
                                Preguntas frecuentes
                            </h2>
                            <p
                                className="section-sub reveal"
                                style={{ transitionDelay: ".05s" }}
                            >
                                Respuestas rÃ¡pidas para cotizaciones, envÃ­os y
                                disponibilidad.
                            </p>
                        </div>
                    </div>

                    <div className="faq">
                        <details className="reveal">
                            <summary>
                                Â¿CÃ³mo cotizo por WhatsApp? <span>+</span>
                            </summary>
                            <p>
                                EnvÃ­anos tu lista o foto de requerimientos. Te
                                respondemos con precios y disponibilidad.
                            </p>
                        </details>

                        <details
                            className="reveal"
                            style={{ transitionDelay: ".04s" }}
                        >
                            <summary>
                                Â¿Hacen envÃ­os y entregas? <span>+</span>
                            </summary>
                            <p>
                                SÃ­. Coordinamos entrega segÃºn zona, volumen y
                                urgencia.
                            </p>
                        </details>

                        <details
                            className="reveal"
                            style={{ transitionDelay: ".08s" }}
                        >
                            <summary>
                                Â¿Venden por volumen a empresas? <span>+</span>
                            </summary>
                            <p>
                                SÃ­. Armamos propuestas para obras, industria y
                                compras recurrentes.
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* ====== CONTACTO ====== */}
            <section
                id="contacto"
                style={{
                    background:
                        "linear-gradient(180deg, #f6f7fb 0%, #ffffff 100%)",
                }}
            >
                <div className="container">
                    <div className="section-head">
                        <div>
                            <h2 className="section-title reveal">
                                ContÃ¡ctanos
                            </h2>
                            <p
                                className="section-sub reveal"
                                style={{ transitionDelay: ".05s" }}
                            >
                                DÃ©janos tu requerimiento o escrÃ­benos directo
                                por WhatsApp.
                            </p>
                        </div>
                    </div>

                    <div className="contact">
                        <form className="form reveal" id="contactForm">
                            <div className="row">
                                <div>
                                    <label htmlFor="name">Nombres</label>
                                    <input
                                        id="name"
                                        name="name"
                                        placeholder="Tu nombre"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone">TelÃ©fono</label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        placeholder="+51 999 999 999"
                                    />
                                </div>
                            </div>

                            <div className="row" style={{ marginTop: 12 }}>
                                <div>
                                    <label htmlFor="email">Correo</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="topic">Tema</label>
                                    <input
                                        id="topic"
                                        name="topic"
                                        placeholder="CotizaciÃ³n / CatÃ¡logo / Curso"
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: 12 }}>
                                <label htmlFor="message">Mensaje</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="Escribe tu lista o requerimiento..."
                                    required
                                ></textarea>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    flexWrap: "wrap",
                                    marginTop: 14,
                                }}
                            >
                                <button
                                    className="btn btn-primary"
                                    type="submit"
                                >
                                    Enviar a WhatsApp
                                </button>
                                <button
                                    className="btn btn-dark"
                                    type="button"
                                    id="btnCopy"
                                >
                                    Copiar mensaje
                                </button>
                            </div>

                            <p
                                id="formHint"
                                style={{
                                    margin: "12px 0 0",
                                    color: "var(--muted)",
                                    lineHeight: 1.6,
                                    fontSize: ".95rem",
                                }}
                            >
                                Al enviar, se abrirÃ¡ WhatsApp con el texto listo
                                para mandar.
                            </p>
                        </form>

                        <aside
                            className="contact-info reveal"
                            style={{ transitionDelay: ".06s" }}
                        >
                            <div className="info-item">
                                <div style={{ fontSize: "1.25rem" }}></div>
                                <div>
                                    <b>UbicaciÃ³n</b>
                                    <span>Huaraz, Ãncash</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div style={{ fontSize: "1.25rem" }}></div>
                                <div>
                                    <b>Horario</b>
                                    <span>Lunâ€“SÃ¡b: 8:00 a.m. â€“ 6:00 p.m.</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div style={{ fontSize: "1.25rem" }}></div>
                                <div>
                                    <b>Ventas</b>
                                    <span>+51 954 178 081</span>
                                </div>
                            </div>
                            <div
                                className="info-item"
                                style={{ marginBottom: 0 }}
                            >
                                <div style={{ fontSize: "1.25rem" }}></div>
                                <div>
                                    <b>AtenciÃ³n rÃ¡pida</b>
                                    <span>
                                        Respuesta por WhatsApp y seguimiento a
                                        cotizaciones.
                                    </span>
                                </div>
                            </div>

                            <div
                                style={{
                                    marginTop: 14,
                                    display: "flex",
                                    gap: 10,
                                    flexWrap: "wrap",
                                }}
                            >
                                <a
                                    className="btn btn-primary"
                                    href="#"
                                    id="btnWhatsContact"
                                >
                                    WhatsApp
                                </a>
                                <a className="btn btn-dark" href="#inicio">
                                    Volver arriba
                                </a>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            <footer>
                <div className="container fgrid">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <img
                            src="/assets/img/logo.png"
                            alt="Latin Terra"
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 12,
                                background: "#fff",
                                padding: 4,
                            }}
                        />
                        <b>LATIN TERRA</b>
                    </div>
                    <div style={{ opacity: 0.9 }}>
                        Â© <span id="year"></span> Latin Terra. Todos los
                        derechos reservados.
                    </div>
                </div>
            </footer>

            {/* WhatsApp flotante */}
            <a className="wa-float" id="waFloat" href="#" aria-label="WhatsApp">
                <svg
                    className="icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M20 11.6A8 8 0 1 1 6.5 5.5 8 8 0 0 1 20 11.6Z"
                        fill="white"
                        opacity=".25"
                    />
                    <path
                        d="M7.2 19.9l.8-3.1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M9.3 8.8c.3-.7.6-.7 1-.7h.6c.2 0 .5 0 .7.5.3.5 1 1.7 1 1.8.1.1.1.3 0 .5-.1.2-.2.3-.3.4l-.4.4c-.1.1-.2.2-.1.4.1.2.6 1.1 1.3 1.7.9.9 1.7 1.2 2 .1l.7-.7c.2-.2.3-.2.5-.1.2.1 1.5.7 1.7.9.2.1.4.2.4.3 0 .1 0 .8-.3 1.1-.3.3-.7.7-1.5.7-.8 0-1.7-.3-2.9-.9-1.2-.6-2.2-1.5-3-2.6-.8-1.1-1.1-2-1.1-2.7 0-.7.2-1.1.4-1.5Z"
                        fill="white"
                    />
                </svg>
                WhatsApp
            </a>
        </PublicLayout>
    );
}

