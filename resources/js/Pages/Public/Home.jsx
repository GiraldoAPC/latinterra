import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import PublicLayout from "@/Layouts/PublicLayout";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

const WHATSAPP_PHONE = "51954178081";
const WHATSAPP_TEXT = "Hola Latin Terra, quisiera cotizar sus productos.";
const WHATSAPP_WEB_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

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

            <PublicHeader current="home" whatsappHref={WHATSAPP_WEB_URL} />
            {/* ====== HERO / SLIDER ====== */}
            <main id="inicio" className="hero">
                <div className="slides" id="slides">
                    <div
                        className="slide active"
                        style={{
                            backgroundImage: "url(/assets/img/slider/slider1.jpg)",
                        }}
                    />
                    <div
                        className="slide"
                        style={{
                            backgroundImage:
                                "url(/assets/img/slider/slider2.jpg)",
                        }}
                    />
                    <div
                        className="slide"
                        style={{
                            backgroundImage:
                                "url(/assets/img/slider/slider3.jpg)",
                        }}
                    />
                    <div
                        className="slide"
                        style={{
                            backgroundImage:
                                "url(/assets/img/slider/slider4.jpg)",
                        }}
                    />
                </div>

                <div className="container hero-content">
                    <div>
                        <span className="pill reveal">
                            Abastecimiento confiable • EPP • Herramientas •
                            Eléctricos
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
                            eléctricos, EPP, trabajos en altura y más.
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
                            <a className="btn btn-dark" href="/contacto">
                                Contáctanos
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
                        <h3>Atencion comercial directa</h3>
                        <p className="mini">
                            Escribenos por WhatsApp y recibe respuesta
                            comercial para cotizaciones, marcas y proyectos.
                        </p>
                        <div
                            style={{
                                marginTop: 14,
                                display: "flex",
                                gap: 10,
                                flexWrap: "wrap",
                            }}
                        >
                            <a className="btn btn-ghost" href={WHATSAPP_WEB_URL} target="_blank" rel="noreferrer">
                                Contactenos
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
                                Categorías Principales de Productos
                            </h2>
                            <p
                                className="section-sub reveal"
                                style={{ transitionDelay: ".05s" }}
                            >
                                Categorías destacadas. Cada una con imagen/ícono
                                y enlace a productos.
                            </p>
                        </div>
                        <a
                            className="btn btn-primary reveal"
                            href="#productos"
                            style={{ transitionDelay: ".08s" }}
                        >
                            Ver categorías
                        </a>
                    </div>

                    <div className="grid">
                        {/* 1) ACCESO POR CUERDAS */}
                        <article className="card reveal">
                            {/* 1º. Imagen arriba */}
                            <div className="card-media">
                                <img
                                    src="/assets/img/categorias/Trabajos-en-Altura.jpg"
                                    alt="Acceso por Cuerdas"
                                    loading="lazy"
                                />
                            </div>

                            <div className="kicker">
                                <span className="badge">Cuerdas</span>
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

                            {/* Tu ícono + título (igual al anterior) */}
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
                                <h4>Acceso por Cuerdas</h4>
                            </div>

                            <p>
                                Equipos y accesorios para trabajo vertical,
                                rescate, anclajes y sistemas de seguridad para
                                acceso por cuerdas.
                            </p>

                            <a className="link" href="/acceso-por-cuerdas">
                                Ver productos →{/* (tu opción pro) */}
                            </a>
                        </article>

                        <article
                            className="card reveal"
                            style={{ transitionDelay: ".02s" }}
                        >
                            <div className="card-media">
                                <img
                                    src="/assets/img/categorias/Trabajos-en-Altura.jpg"
                                    alt="Trabajos en Altura"
                                    loading="lazy"
                                />
                            </div>

                            <div className="kicker">
                                <span className="badge">Altura</span>
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
                                Marcas y soluciones para proteccion,
                                rescate y seguridad especializada en altura.
                            </p>

                            <a className="link" href="/trabajos-en-altura">
                                Ver productos ->
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
                                protección personal.
                            </p>

                            <a className="link" href="/epp-y-seguridad">
                                Ver productos →
                            </a>
                        </article>

                        {/* 3) ARTÍCULOS DE FERRETERÍA */}
                        <article
                            className="card reveal"
                            style={{ transitionDelay: ".08s" }}
                        >
                            <div className="card-media">
                                <img
                                    src="/assets/img/categorias/Ferreteria.jpg"
                                    alt="Artículos de Ferretería"
                                    loading="lazy"
                                />
                            </div>

                            <div className="kicker">
                                <span className="badge">Ferretería</span>
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
                                <h4>Artículos de Ferretería</h4>
                            </div>

                            <p>
                                Materiales, consumibles y accesorios
                                industriales.
                            </p>

                            <a
                                className="link"
                                href="/articulos-de-ferreteria"
                            >
                                Ver productos →
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

                            <p>Manuales, eléctricas y especializadas.</p>

                            <a
                                className="link"
                                href="/herramientas"
                            >
                                Ver productos →
                            </a>
                        </article>

                        <article
                            className="card reveal"
                            style={{ transitionDelay: ".02s" }}
                        >
                            <div className="card-media">
                                <img
                                    src="/assets/img/encabezado/equipo-electrico.jpg"
                                    alt="Equipo Eléctrico"
                                    loading="lazy"
                                />
                            </div>

                            <div className="kicker">
                                <span className="badge">Eléctrico</span>
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
                                            d="M13 2L5 14h5l-1 8 8-12h-5l1-8Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <h4>Equipo Eléctrico</h4>
                            </div>

                            <p>
                                Energía, medición, diagnóstico y herramientas
                                eléctricas para uso técnico.
                            </p>

                            <a className="link" href="/equipo-electrico">
                                Ver productos →
                            </a>
                        </article>

                        {/* 6) REPARACIÓN DE PALAS */}
                        <article
                            className="card reveal"
                            style={{ transitionDelay: ".04s" }}
                        >
                            <div className="card-media">
                                <img
                                    src="/assets/img/encabezado/reparacion-de-palas.jpg"
                                    alt="Reparación de Palas"
                                    loading="lazy"
                                />
                            </div>

                            <div className="kicker">
                                <span className="badge">Palas</span>
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
                                <h4>Reparación de Palas</h4>
                            </div>

                            <p>
                                Marcas y soluciones para reparación,
                                mantenimiento y soporte técnico de palas.
                            </p>

                            <a className="link" href="/reparacion-de-palas">
                                Ver productos →
                            </a>
                        </article>

                        <article
                            className="card reveal"
                            style={{ transitionDelay: ".06s" }}
                        >
                            <div className="card-media">
                                <img
                                    src="/assets/img/encabezado/reparacion-de-palas.jpg"
                                    alt="Parques Eolicos"
                                    loading="lazy"
                                />
                            </div>

                            <div className="kicker">
                                <span className="badge">Eolicos</span>
                            </div>

                            <div className="cat-head">
                                <div className="cat-ico">
                                    <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path d="M12 3v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M12 8l-5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M12 8l5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                                <h4>Parques Eolicos</h4>
                            </div>

                            <p>
                                Marcas para mantenimiento, limpieza tecnica
                                y equipos de medicion en parques eolicos.
                            </p>

                            <a className="link" href="/parques-eolicos">
                                Ver productos ->
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
                                Integra tus marcas favoritas. (Aquí puedes poner
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
                            <p>Logo aquí</p>
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
                            <p>Logo aquí</p>
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
                            <p>Logo aquí</p>
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
                            <p>Logo aquí</p>
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
                                Capacitación y asesoría (seguridad, EPP,
                                trabajos en altura, uso de equipos).
                            </p>
                        </div>
                    </div>

                    <div className="grid">
                        <article className="card reveal">
                            <div className="kicker">
                                <span className="badge">Seguridad</span>
                            </div>
                            <h4>Inducción de EPP</h4>
                            <p>
                                Selección correcta, inspección, mantenimiento y
                                normas de seguridad.
                            </p>
                            <a className="link" href="/contacto">
                                Pedir información →
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
                                Arnés, anclajes, líneas de vida y prevención de
                                caídas (teoría + práctica).
                            </p>
                            <a className="link" href="/contacto">
                                Solicitar agenda →
                            </a>
                        </article>

                        <article
                            className="card reveal"
                            style={{ transitionDelay: ".1s" }}
                        >
                            <div className="kicker">
                                <span className="badge">Eléctrico</span>
                            </div>
                            <h4>Seguridad Eléctrica</h4>
                            <p>
                                Procedimientos, riesgos, señalización,
                                bloqueo/etiquetado (según necesidad).
                            </p>
                            <a className="link" href="/contacto">
                                Consultar →
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
                                Respuestas rápidas para cotizaciones, envíos y
                                disponibilidad.
                            </p>
                        </div>
                    </div>

                    <div className="faq">
                        <details className="reveal">
                            <summary>
                                ¿Cómo cotizo por WhatsApp? <span>+</span>
                            </summary>
                            <p>
                                Envíanos tu lista o foto de requerimientos. Te
                                respondemos con precios y disponibilidad.
                            </p>
                        </details>

                        <details
                            className="reveal"
                            style={{ transitionDelay: ".04s" }}
                        >
                            <summary>
                                ¿Hacen envíos y entregas? <span>+</span>
                            </summary>
                            <p>
                                Sí. Coordinamos entrega según zona, volumen y
                                urgencia.
                            </p>
                        </details>

                        <details
                            className="reveal"
                            style={{ transitionDelay: ".08s" }}
                        >
                            <summary>
                                ¿Venden por volumen a empresas? <span>+</span>
                            </summary>
                            <p>
                                Sí. Armamos propuestas para obras, industria y
                                compras recurrentes.
                            </p>
                        </details>
                    </div>
                </div>
            </section>


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
                    className="icon"
                    aria-hidden="true"
                />
                WhatsApp
            </a>
        </PublicLayout>
    );
}
