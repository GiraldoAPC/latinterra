import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

const products = [
    { name: "Airtech", logo: "/assets/img/categorias/reparaciondepalas/Airtech.jpg", desc: "Materiales y soporte tecnico para mantenimiento de componentes eolicos." },
    { name: "Comind", logo: "/assets/img/categorias/reparaciondepalas/Comind.jpg", desc: "Soluciones tecnicas para mantenimiento industrial y trabajo especializado." },
    { name: "Eclipse", logo: "/assets/img/categorias/reparaciondepalas/Eclipse.jpg", desc: "Consumibles y equipos para reparacion y mantenimiento tecnico." },
    { name: "Hont", logo: "/assets/img/categorias/reparaciondepalas/Hont.jpg", desc: "Accesorios y materiales para intervenciones en campo y mantenimiento." },
    { name: "Kuhlmann", logo: "/assets/img/categorias/reparaciondepalas/Kuhlmann.jpg", desc: "Componentes de precision para reparacion tecnica y soporte operativo." },
    { name: "Lund & Sorensen", logo: "/assets/img/categorias/reparaciondepalas/Lund & Sorensen.jpg", desc: "Soluciones para reparacion, mantenimiento y soporte de estructuras." },
    { name: "Wurth", logo: "/assets/img/categorias/epp/Wurth.jpg", desc: "Lubricantes, limpiadores y soluciones tecnicas para mantenimiento industrial." },
    { name: "Total", logo: "/assets/img/categorias/articulosdeferreteria/Total.jpg", desc: "Herramientas, consumibles y apoyo para labores de mantenimiento en campo." },
    { name: "Smart Sensor", logo: "/assets/img/categorias/electrico/Smart Sensor.jpg", desc: "Equipos de medicion y diagnostico para inspeccion tecnica." },
    { name: "Lutron", logo: "/assets/img/categorias/electrico/Lutron.jpg", desc: "Instrumentos de medicion para control, monitoreo y verificacion." },
];

const whatsappNumber = "51954178081";
const whatsappDefaultText = "Hola Latin Terra, quisiera cotizar productos para parques eolicos.";
const getWhatsAppUrl = (text = whatsappDefaultText) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

export default function ParquesEolicos() {
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
            <Head title="Parques Eolicos | Latin Terra" />
            <meta
                name="description"
                content="Marcas y soluciones para parques eolicos, mantenimiento tecnico, limpieza industrial y equipos de medicion."
            />

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader current="products" productHref="/parques-eolicos" whatsappHref={getWhatsAppUrl()} />

            <section className="catalog-hero" aria-label="Encabezado de categoria">
                <div
                    className="catalog-hero__bg"
                    style={{ backgroundImage: "url('/assets/img/encabezado/reparacion-de-palas.jpg')" }}
                />
                <div className="catalog-hero__overlay" />
                <div className="catalog-hero__content">
                    <div className="catalog-hero__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 3v13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M12 8l-5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M12 8l5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.8" />
                        </svg>
                    </div>
                    <h1 className="catalog-hero__title">Parques Eolicos</h1>
                    <p className="catalog-hero__subtitle">
                        Marcas para mantenimiento, limpieza tecnica y soporte operativo en parques eolicos
                    </p>
                    <p className="catalog-hero__crumb">
                        <Link href="/">INICIO</Link> / PARQUES EOLICOS
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

                    <section className="product-grid" aria-label="Catalogo de parques eolicos">
                        {products.map((item, idx) => {
                            const msg = `Hola Latin Terra, quisiera cotizar productos para parques eolicos de la marca ${item.name}.`;

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
