import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

const products = [
    { name: "Airtech", logo: "/assets/img/categorias/reparaciondepalas/Airtech.jpg", desc: "Materiales y soporte para reparacion de palas y componentes compuestos." },
    { name: "Comind", logo: "/assets/img/categorias/reparaciondepalas/Comind.jpg", desc: "Soluciones tecnicas para reparacion y mantenimiento de palas." },
    { name: "Eclipse", logo: "/assets/img/categorias/reparaciondepalas/Eclipse.jpg", desc: "Equipos y consumibles para procesos de reparacion especializada." },
    { name: "Hont", logo: "/assets/img/categorias/reparaciondepalas/Hont.jpg", desc: "Accesorios y materiales para mantenimiento industrial de palas." },
    { name: "Kuhlmann", logo: "/assets/img/categorias/reparaciondepalas/Kuhlmann.jpg", desc: "Componentes para reparacion tecnica y trabajo de precision." },
    { name: "Lund & Sorensen", logo: "/assets/img/categorias/reparaciondepalas/Lund & Sorensen.jpg", desc: "Soluciones de reparacion y soporte para palas y estructuras." },
];

const whatsappNumber = "51954178081";
const whatsappDefaultText = "Hola Latin Terra, quisiera cotizar productos para reparacion de palas.";
const getWhatsAppUrl = (text = whatsappDefaultText) =>
    `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(text)}`;

export default function ReparacionPalas() {
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
            <Head title="Reparacion de Palas | Latin Terra" />
            <meta
                name="description"
                content="Catalogo de marcas para reparacion de palas, mantenimiento y consumibles especializados."
            />

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader current="products" productHref="/reparacion-de-palas" whatsappHref={getWhatsAppUrl()} />

            <section className="catalog-hero" aria-label="Encabezado de categoria">
                <div className="catalog-hero__bg" style={{ backgroundImage: "url('/assets/img/encabezado/reparacion-de-palas.jpg')" }} />
                <div className="catalog-hero__overlay" />
                <div className="catalog-hero__content">
                    <div className="catalog-hero__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2Z" stroke="currentColor" strokeWidth="2" />
                            <path d="M8 7h8M8 11h8M8 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h1 className="catalog-hero__title">Reparacion de Palas</h1>
                    <p className="catalog-hero__subtitle">
                        Marcas y soluciones para reparacion y mantenimiento especializado
                    </p>
                    <p className="catalog-hero__crumb">
                        <Link href="/">INICIO</Link> / REPARACION DE PALAS
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

                    <section className="product-grid" aria-label="Catalogo de reparacion de palas">
                        {products.map((item, idx) => {
                            const msg = `Hola Latin Terra, quisiera cotizar productos para reparacion de palas de la marca ${item.name}.`;

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

            <PublicFooter />

            <a className="wa-float" id="waFloat" href={getWhatsAppUrl()} aria-label="WhatsApp" target="_blank" rel="noreferrer">
                <img src="/assets/img/whatsapp.svg" alt="" className="wa-svg" aria-hidden="true" />
                <span className="wa-dot" />
                WhatsApp
            </a>
        </div>
    );
}
