import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";

const products = [
    {
        name: "Aguerri",
        logo: "/assets/img/categorias/trabajoenaltura/aguerri.jpg",
        desc: "Marca de seguridad en altura para operaciones técnicas y trabajos verticales.",
    },
    {
        name: "Avanti",
        logo: "/assets/img/categorias/trabajoenaltura/avanti.jpg",
        desc: "Soluciones para trabajo y acceso en altura con foco en seguridad operacional.",
    },
    {
        name: "Beal",
        logo: "/assets/img/categorias/trabajoenaltura/beal.jpg",
        desc: "Especialistas en cuerdas y equipos técnicos para rescate y altura.",
    },
    {
        name: "Climbing Technologies",
        logo: "/assets/img/categorias/trabajoenaltura/climingteclogies.jpg",
        desc: "Equipamiento técnico certificado para protección y progresión en altura.",
    },
    {
        name: "Edelweis",
        logo: "/assets/img/categorias/trabajoenaltura/ELEWESI.jpg",
        desc: "Componentes y accesorios para sistemas de anclaje y sujeción segura.",
    },
    {
        name: "Fenix",
        logo: "/assets/img/categorias/trabajoenaltura/fenix.jpg",
        desc: "Iluminación y accesorios para trabajos exigentes en campo y altura.",
    },
    {
        name: "Forclaz",
        logo: "/assets/img/categorias/trabajoenaltura/forclaz.jpg",
        desc: "Equipos funcionales para actividades técnicas y condiciones de exigencia.",
    },
    {
        name: "Irudek",
        logo: "/assets/img/categorias/trabajoenaltura/irudek.jpg",
        desc: "Sistemas anticaídas y soluciones profesionales para trabajo en altura.",
    },
    {
        name: "Juragjanka",
        logo: "/assets/img/categorias/trabajoenaltura/juragjanka.jpg",
        desc: "Accesorios y componentes orientados a seguridad industrial en altura.",
    },
    {
        name: "Kaya",
        logo: "/assets/img/categorias/trabajoenaltura/kaya.jpg",
        desc: "Equipamiento técnico para rescate, evacuación y trabajos verticales.",
    },
    {
        name: "Petzel",
        logo: "/assets/img/categorias/trabajoenaltura/petzel.jpg",
        desc: "Marca reconocida en protección, iluminación y sistemas para altura.",
    },
    {
        name: "Safeface",
        logo: "/assets/img/categorias/trabajoenaltura/safeface.jpg",
        desc: "Protección personal para operaciones de riesgo en ambientes industriales.",
    },
    {
        name: "Singing Rock",
        logo: "/assets/img/categorias/trabajoenaltura/SINGINGROCK.jpg",
        desc: "Equipos para acceso por cuerda, rescate y sujeción de alto desempeño.",
    },
    {
        name: "Yoke",
        logo: "/assets/img/categorias/trabajoenaltura/YOKE.jpg",
        desc: "Herrajes y puntos de anclaje de alta resistencia para uso profesional.",
    },
];

const whatsappNumber = "51954178081";

export default function Trabajosenaltura() {
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
            <Head title="Trabajos en Altura | Latin Terra" />
            <meta
                name="description"
                content="Equipos para trabajos en altura: arneses, líneas de vida, anclajes y sistemas de rescate."
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

                    <nav aria-label="Navegación principal">
                        <ul className="menu" id="menu">
                            <li>
                                <Link href="/">Inicio</Link>
                            </li>
                            <li>
                                <Link href="/nosotros">Nosotros</Link>
                            </li>
                            <li>
                                <a className="active" href="/trabajos-en-altura">
                                    Productos
                                </a>
                            </li>
                            <li>
                                <a href="/#marcas">Marcas</a>
                            </li>
                            <li>
                                <a href="/#cursos">Cursos</a>
                            </li>
                            <li>
                                <a href="/#faq">FAQ</a>
                            </li>
                            <li>
                                <a href="/#contacto">Contáctanos</a>
                            </li>
                        </ul>
                    </nav>

                    <div className="nav-cta auth-cta">
                        <Link
                            className="icon-btn icon-btn--ghost"
                            href="/login"
                            aria-label="Ingresar"
                            data-tip="Ingresar"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M10 17l5-5-5-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M15 12H3"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M21 4v16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    opacity=".55"
                                />
                            </svg>
                        </Link>

                        <Link
                            className="icon-btn icon-btn--primary"
                            href="/register"
                            aria-label="Registrarse"
                            data-tip="Registrarse"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M4 20a8 8 0 0 1 16 0"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M19 8v6M16 11h6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </Link>

                        <button className="burger" id="burger" aria-label="Abrir menú">
                            <span />
                        </button>
                    </div>
                </div>
            </header>

            <div className="drawer" id="drawer" aria-hidden="true">
                <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Menú">
                    <div className="drawer-head">
                        <div className="brand" style={{ minWidth: "auto" }}>
                            <img src="/assets/img/logo.png" alt="Latin Terra Logo" />
                            <div className="name">LATIN TERRA</div>
                        </div>
                        <button className="burger" id="drawerClose" aria-label="Cerrar menú">
                            <span />
                        </button>
                    </div>

                    <ul>
                        <li>
                            <Link href="/" data-close="true">
                                Inicio
                            </Link>
                        </li>
                        <li>
                            <Link href="/nosotros" data-close="true">
                                Nosotros
                            </Link>
                        </li>
                        <li>
                            <a href="/trabajos-en-altura" data-close="true" className="active">
                                Productos
                            </a>
                        </li>
                        <li>
                            <a href="/#marcas" data-close="true">
                                Marcas
                            </a>
                        </li>
                        <li>
                            <a href="/#cursos" data-close="true">
                                Cursos
                            </a>
                        </li>
                        <li>
                            <a href="/#faq" data-close="true">
                                FAQ
                            </a>
                        </li>
                        <li>
                            <a href="/#contacto" data-close="true">
                                Contáctanos
                            </a>
                        </li>
                    </ul>

                    <div className="drawer-cta">
                        <a className="btn btn-primary" href="/#contacto" data-close="true">
                            Cotizar Ahora
                        </a>
                        <a className="btn btn-dark" href={`https://wa.me/${whatsappNumber}?text=Hola%20Latin%20Terra`}>
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
            <section className="catalog-hero" aria-label="Encabezado de categoría">
                <div
                    className="catalog-hero__bg"
                    style={{ backgroundImage: "url('/assets/img/latin-terra.jpg')" }}
                />
                <div className="catalog-hero__overlay" />
                <div className="catalog-hero__content">
                    <div className="catalog-hero__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M5 16h14M7 12h10M9 8h6"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                            <path
                                d="M4 18V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <h1 className="catalog-hero__title">Trabajos en Altura</h1>
                    <p className="catalog-hero__subtitle">
                        Equipos certificados para trabajo seguro en altura
                    </p>
                    <p className="catalog-hero__crumb">
                        <Link href="/">INICIO</Link> / TRABAJOS EN ALTURA
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
                            placeholder="Buscar por título o nombre..."
                            aria-label="Buscar por título o nombre"
                        />
                    </div>

                    <section className="product-grid" aria-label="Catálogo de trabajos en altura">
                        {products.map((item, idx) => {
                            const msg = encodeURIComponent(
                                `Hola Latin Terra, deseo cotizar: ${item.name}.`
                            );

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

                                    <a
                                        className="btn btn-primary product-quote-btn"
                                        href={`https://wa.me/${whatsappNumber}?text=${msg}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path
                                                d="M20 11.6A8 8 0 1 1 6.5 5.5 8 8 0 0 1 20 11.6Z"
                                                stroke="white"
                                                strokeWidth="2"
                                            />
                                            <path
                                                d="M7.2 19.9l.8-3.1"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
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

            <a className="wa-float" id="waFloat" href={`https://wa.me/${whatsappNumber}`} aria-label="WhatsApp">
                <img src="/assets/img/whatsapp.svg" alt="" className="wa-svg" aria-hidden="true" />
                <span className="wa-dot" />
                WhatsApp
            </a>
        </div>
    );
}


