import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";

const products = [
    { name: "Aliyiqi", logo: "/assets/img/categorias/electrico/Aliyiqi.jpg", desc: "Equipos y accesorios de medicion y soporte electrico para trabajo tecnico." },
    { name: "Bauker", logo: "/assets/img/categorias/electrico/Bauker.jpg", desc: "Herramientas y equipos electricos para mantenimiento y operacion." },
    { name: "Bosch", logo: "/assets/img/categorias/electrico/Bosch.jpg", desc: "Equipos electricos y soluciones tecnicas para uso profesional." },
    { name: "Bosean", logo: "/assets/img/categorias/electrico/Bosean.jpg", desc: "Instrumentos de deteccion y monitoreo para seguridad industrial." },
    { name: "Center", logo: "/assets/img/categorias/electrico/Center.jpg", desc: "Instrumentacion electrica para medicion, prueba y diagnostico." },
    { name: "Dewalt", logo: "/assets/img/categorias/electrico/Dewalt.jpg", desc: "Herramientas electricas y accesorios de alto rendimiento." },
    { name: "Dong Cheng", logo: "/assets/img/categorias/electrico/Dong Cheng.jpg", desc: "Herramientas electricas para taller, obra y mantenimiento." },
    { name: "Ecoflow", logo: "/assets/img/categorias/electrico/Ecofolow.jpg", desc: "Energia portatil, respaldo electrico y soluciones moviles." },
    { name: "Energizer", logo: "/assets/img/categorias/electrico/Energizer.jpg", desc: "Baterias, linternas y soluciones de energia para campo y trabajo." },
    { name: "Halux", logo: "/assets/img/categorias/electrico/Halux.jpg", desc: "Iluminacion y componentes electricos para uso comercial e industrial." },
    { name: "Ineco", logo: "/assets/img/categorias/electrico/Ineco.jpg", desc: "Instrumentos y equipos electricos para verificacion tecnica." },
    { name: "Lutron", logo: "/assets/img/categorias/electrico/Lutron.jpg", desc: "Equipos de medicion ambiental y electrica para control y monitoreo." },
    { name: "Makita", logo: "/assets/img/categorias/electrico/Makita.jpg", desc: "Herramientas electricas profesionales para trabajo continuo." },
    { name: "Midland", logo: "/assets/img/categorias/electrico/Midland.jpg", desc: "Comunicacion y accesorios tecnicos para operacion en campo." },
    { name: "Motorola", logo: "/assets/img/categorias/electrico/Motorola.jpg", desc: "Radios y soluciones de comunicacion para seguridad y coordinacion." },
    { name: "Opalux", logo: "/assets/img/categorias/electrico/Opalux.jpg", desc: "Iluminacion y productos electricos para ambientes de trabajo." },
    { name: "Smart Sensor", logo: "/assets/img/categorias/electrico/Smart Sensor.jpg", desc: "Sensores e instrumentos de medicion para inspeccion tecnica." },
    { name: "Sndway", logo: "/assets/img/categorias/electrico/Sndway.jpg", desc: "Medicion laser y equipos de apoyo para levantamiento y control." },
    { name: "Steelpro Safety", logo: "/assets/img/categorias/electrico/Steelpro Safety.jpg", desc: "Seguridad industrial y accesorios para trabajo tecnico y electrico." },
    { name: "Taurus", logo: "/assets/img/categorias/electrico/Taurus.jpg", desc: "Equipos y herramientas para mantenimiento industrial y electrico." },
    { name: "Truper", logo: "/assets/img/categorias/electrico/Truper.jpg", desc: "Herramientas y complementos para instalacion y servicio tecnico." },
    { name: "Uyustools", logo: "/assets/img/categorias/electrico/Uyustools.jpg", desc: "Herramientas tecnicas para reparacion, pruebas y mantenimiento." },
    { name: "Value", logo: "/assets/img/categorias/electrico/Value.jpg", desc: "Instrumentacion y herramientas para trabajos de precision." },
    { name: "Yowexa", logo: "/assets/img/categorias/electrico/Yowexa.jpg", desc: "Medicion y monitoreo para aplicaciones tecnicas e industriales." },
];

const whatsappNumber = "51954178081";
const whatsappDefaultText = "Hola Latin Terra, quisiera cotizar equipos electricos.";
const getWhatsAppUrl = (text = whatsappDefaultText) =>
    `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(text)}`;

export default function EquipoElectrico() {
    useEffect(() => {
        const runInit = () => {
            if (typeof window.initProductCatalogs === "function") {
                window.initProductCatalogs();
            }
        };

        if (typeof window.initProductCatalogs === "function") {
            runInit();
            return;
        }

        const existing = document.getElementById("productos-js");
        if (existing) {
            runInit();
            return;
        }

        const script = document.createElement("script");
        script.id = "productos-js";
        script.src = "/assets/js/Productos.js";
        script.defer = true;
        script.onload = runInit;
        document.body.appendChild(script);
    }, []);

    return (
        <div className="catalog-page">
            <Head title="Equipo Electrico | Latin Terra" />
            <meta
                name="description"
                content="Catalogo de marcas de equipo electrico, medicion, energia y herramientas tecnicas."
            />

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <header className="site-header">
                <div className="container nav">
                    <Link className="brand" href="/" aria-label="Latin Terra - Inicio">
                        <img src="/assets/img/logo.png" alt="Latin Terra Logo" />
                        <div className="name">LATIN TERRA</div>
                    </Link>

                    <nav aria-label="Navegacion principal">
                        <ul className="menu" id="menu">
                            <li><Link href="/">Inicio</Link></li>
                            <li><Link href="/nosotros">Nosotros</Link></li>
                            <li><a className="active" href="/equipo-electrico">Productos</a></li>
                            <li><a href="/#marcas">Marcas</a></li>
                            <li><a href="/#cursos">Cursos</a></li>
                            <li><a href="/#faq">FAQ</a></li>
                            <li><a href="/#contacto">Contactanos</a></li>
                        </ul>
                    </nav>

                    <div className="nav-cta auth-cta">
                        <Link className="icon-btn icon-btn--ghost" href="/login" aria-label="Ingresar" data-tip="Ingresar">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M10 17l5-5-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15 12H3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M21 4v16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".55" />
                            </svg>
                        </Link>

                        <Link className="icon-btn icon-btn--primary" href="/register" aria-label="Registrarse" data-tip="Registrarse">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" fill="none" stroke="currentColor" strokeWidth="2" />
                                <path d="M4 20a8 8 0 0 1 16 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M19 8v6M16 11h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </Link>

                        <button className="burger" id="burger" aria-label="Abrir menu">
                            <span />
                        </button>
                    </div>
                </div>
            </header>

            <div className="drawer" id="drawer" aria-hidden="true">
                <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">
                    <div className="drawer-head">
                        <div className="brand" style={{ minWidth: "auto" }}>
                            <img src="/assets/img/logo.png" alt="Latin Terra Logo" />
                            <div className="name">LATIN TERRA</div>
                        </div>
                        <button className="burger" id="drawerClose" aria-label="Cerrar menu">
                            <span />
                        </button>
                    </div>

                    <ul>
                        <li><Link href="/" data-close="true">Inicio</Link></li>
                        <li><Link href="/nosotros" data-close="true">Nosotros</Link></li>
                        <li><a href="/equipo-electrico" data-close="true" className="active">Productos</a></li>
                        <li><a href="/#marcas" data-close="true">Marcas</a></li>
                        <li><a href="/#cursos" data-close="true">Cursos</a></li>
                        <li><a href="/#faq" data-close="true">FAQ</a></li>
                        <li><a href="/#contacto" data-close="true">Contactanos</a></li>
                    </ul>

                    <div className="drawer-cta">
                        <a className="btn btn-primary" href="/#contacto" data-close="true">Cotizar Ahora</a>
                        <a className="btn btn-dark" href={getWhatsAppUrl()} target="_blank" rel="noreferrer">
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            <section className="catalog-hero" aria-label="Encabezado de categoria">
                <div className="catalog-hero__bg" style={{ backgroundImage: "url('/assets/img/latin-terra2.jpg')" }} />
                <div className="catalog-hero__overlay" />
                <div className="catalog-hero__content">
                    <div className="catalog-hero__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M6 13h3l2-8 2 14 2-6h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3 12c0-4.5 3.5-8 9-8s9 3.5 9 8-3.5 8-9 8-9-3.5-9-8Z" stroke="currentColor" strokeWidth="1.8" />
                        </svg>
                    </div>
                    <h1 className="catalog-hero__title">Equipo Electrico</h1>
                    <p className="catalog-hero__subtitle">
                        Marcas para energia, medicion, herramientas y soporte tecnico
                    </p>
                    <p className="catalog-hero__crumb">
                        <Link href="/">INICIO</Link> / EQUIPO ELECTRICO
                    </p>
                </div>
                <div className="catalog-hero__curve" aria-hidden="true" />
            </section>

            <main className="catalog-main">
                <div className="container" data-product-catalog>
                    <div className="product-search reveal">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                            <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input
                            type="search"
                            className="js-product-search"
                            placeholder="Buscar por marca o descripcion..."
                            aria-label="Buscar por marca o descripcion"
                        />
                    </div>

                    <section className="product-grid" aria-label="Catalogo de equipo electrico">
                        {products.map((item, idx) => {
                            const msg = `Hola Latin Terra, quisiera cotizar equipo electrico de la marca ${item.name}.`;

                            return (
                                <article
                                    key={item.name}
                                    className="product-card js-product-card reveal"
                                    data-search={`${item.name} ${item.desc}`}
                                    style={{ transitionDelay: `${idx * 0.03}s` }}
                                >
                                    <div className="product-logo">
                                        <img src={item.logo} alt={`Logo ${item.name}`} loading="lazy" />
                                    </div>
                                    <h3>{item.name}</h3>
                                    <p>{item.desc}</p>
                                    <a className="btn btn-primary product-quote-btn" href={getWhatsAppUrl(msg)} target="_blank" rel="noreferrer">
                                        <img src="/assets/img/whatsapp.svg" alt="" aria-hidden="true" />
                                        Cotizar
                                    </a>
                                </article>
                            );
                        })}
                    </section>

                    <p className="catalog-empty js-product-empty" hidden>
                        No se encontraron resultados.
                    </p>
                </div>
            </main>

            <footer className="site-footer">
                <div className="container footer-inner">
                    <div className="footer-brand">
                        <img src="/assets/img/logo.png" alt="Latin Terra" />
                        <div>
                            <b>LATIN TERRA</b>
                            <div className="small">Productos industriales, comerciales y de seguridad</div>
                        </div>
                    </div>
                    <div className="footer-copy">
                        © <span id="year" /> Latin Terra. Todos los derechos reservados.
                    </div>
                </div>
            </footer>

            <a className="wa-float" id="waFloat" href={getWhatsAppUrl()} aria-label="WhatsApp" target="_blank" rel="noreferrer">
                <img src="/assets/img/whatsapp.svg" alt="" className="wa-svg" aria-hidden="true" />
                <span className="wa-dot" />
                WhatsApp
            </a>
        </div>
    );
}
