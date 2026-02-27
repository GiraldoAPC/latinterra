import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

const products = [
    {
        name: "3M",
        logo: "/assets/img/categorias/epp/3m.jpg",
        desc: "Protección respiratoria, auditiva y soluciones EPP para uso industrial.",
    },
    {
        name: "Absolute Zero",
        logo: "/assets/img/categorias/epp/Absolute zero.jpg",
        desc: "Ropa y accesorios de protección para ambientes de trabajo exigentes.",
    },
    {
        name: "Activex",
        logo: "/assets/img/categorias/epp/Activex.jpg",
        desc: "Implementos de seguridad y protección personal para operación diaria.",
    },
    {
        name: "Ansell",
        logo: "/assets/img/categorias/epp/Ansel.jpg",
        desc: "Guantes y soluciones de protección para manos en industria y laboratorio.",
    },
    {
        name: "Climbing Technologies",
        logo: "/assets/img/categorias/epp/Climbing Tecnologies.jpg",
        desc: "Equipos técnicos y elementos de seguridad para trabajos especializados.",
    },
    {
        name: "Delta Plus",
        logo: "/assets/img/categorias/epp/Delta plus.jpg",
        desc: "Amplio portafolio de EPP para cabeza, manos, cuerpo y altura.",
    },
    {
        name: "Edge",
        logo: "/assets/img/categorias/epp/Edge.jpg",
        desc: "Protección visual y accesorios para seguridad ocupacional.",
    },
    {
        name: "Eternety Safety",
        logo: "/assets/img/categorias/epp/Eternety Safety.jpg",
        desc: "Línea de seguridad industrial con enfoque en protección y cumplimiento.",
    },
    {
        name: "Full Risk",
        logo: "/assets/img/categorias/epp/Full Risk.jpg",
        desc: "Equipamiento de seguridad para ambientes de riesgo y operación continua.",
    },
    {
        name: "Honeywell",
        logo: "/assets/img/categorias/epp/Honeywell.jpg",
        desc: "Sistemas de seguridad industrial y EPP de alto desempeño.",
    },
    {
        name: "HW - Hard Word",
        logo: "/assets/img/categorias/epp/HW - Hard Word.jpg",
        desc: "Equipos y accesorios de protección para trabajo pesado.",
    },
    {
        name: "Martell",
        logo: "/assets/img/categorias/epp/Martell.jpg",
        desc: "Soluciones de seguridad y componentes para uso industrial.",
    },
    {
        name: "Norseg",
        logo: "/assets/img/categorias/epp/Norseg.jpg",
        desc: "Implementos de protección personal para faena, obra e industria.",
    },
    {
        name: "Portwest",
        logo: "/assets/img/categorias/epp/Portwest.jpg",
        desc: "Vestimenta laboral y seguridad ocupacional para múltiples sectores.",
    },
    {
        name: "Rockbros",
        logo: "/assets/img/categorias/epp/Rockbros.jpg",
        desc: "Accesorios de protección y equipamiento para actividades técnicas.",
    },
    {
        name: "Safeyear",
        logo: "/assets/img/categorias/epp/Safeyear.jpg",
        desc: "Lentes y protección visual para seguridad en campo y planta.",
    },
    {
        name: "Stanley",
        logo: "/assets/img/categorias/epp/Stanley.jpg",
        desc: "Herramientas y complementos con enfoque en seguridad y rendimiento.",
    },
    {
        name: "Steelpro Safety",
        logo: "/assets/img/categorias/epp/Steelpro Safety.jpg",
        desc: "Protección personal certificada para minería, construcción e industria.",
    },
    {
        name: "Tyvex",
        logo: "/assets/img/categorias/epp/Tyvex.jpg",
        desc: "Indumentaria de protección y barrera para trabajos especiales.",
    },
    {
        name: "Wurth",
        logo: "/assets/img/categorias/epp/Wurth.jpg",
        desc: "Productos técnicos y soluciones para seguridad industrial y mantenimiento.",
    },
];

const whatsappNumber = "51954178081";
const whatsappDefaultText = "Hola Latin Terra, quisiera cotizar productos de EPP y seguridad.";
const getWhatsAppUrl = (text = whatsappDefaultText) =>
    `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(text)}`;

export default function EppSeguridad() {
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
        <div className="catalog-page lt-public">
            <Head title="EPP y Seguridad | Latin Terra" />
            <meta
                name="description"
                content="Marcas de EPP y seguridad industrial: protección personal, visual, respiratoria y vestimenta de trabajo."
            />

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader current="products" productHref="/epp-y-seguridad" whatsappHref={getWhatsAppUrl()} />

            

            <section className="catalog-hero" aria-label="Encabezado de categoría">
                <div
                    className="catalog-hero__bg"
                    style={{ backgroundImage: "url('/assets/img/encabezado/epp-y-seguridad.jpg')" }}
                />
                <div className="catalog-hero__overlay" />
                <div className="catalog-hero__content">
                    <div className="catalog-hero__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 3l7 3v5c0 5-2.9 8.1-7 10-4.1-1.9-7-5-7-10V6l7-3Z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M9.5 12.2l1.7 1.7 3.3-3.6"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <h1 className="catalog-hero__title">EPP y Seguridad</h1>
                    <p className="catalog-hero__subtitle">
                        Marcas y soluciones para protección personal e industrial
                    </p>
                    <p className="catalog-hero__crumb">
                        <Link href="/">INICIO</Link> / EPP Y SEGURIDAD
                    </p>
                </div>
                <div className="catalog-hero__curve" aria-hidden="true" />
            </section>

            <main className="catalog-main">
                <div className="container" data-product-catalog>
                    <div className="product-search reveal">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                            <path
                                d="M20 20l-3.2-3.2"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                        <input
                            type="search"
                            className="js-product-search"
                            placeholder="Buscar por marca o descripción..."
                            aria-label="Buscar por marca o descripción"
                        />
                    </div>

                    <section className="product-grid" aria-label="Catálogo de EPP y seguridad">
                        {products.map((item, idx) => {
                            const msg = `Hola Latin Terra, quisiera cotizar productos EPP de la marca ${item.name}.`;

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
                                        href={getWhatsAppUrl(msg)}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
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

            <PublicFooter />

            <a
                className="wa-float"
                id="waFloat"
                href={getWhatsAppUrl()}
                aria-label="WhatsApp"
                target="_blank"
                rel="noreferrer"
            >
                <img src="/assets/img/whatsapp.svg" alt="" className="wa-svg" aria-hidden="true" />
                <span className="wa-dot" />
                WhatsApp
            </a>
        </div>
    );
}
