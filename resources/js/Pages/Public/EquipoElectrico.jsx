import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

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
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

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
        <div className="catalog-page lt-public">
            <Head title="Equipo Electrico | Latin Terra" />
            <meta
                name="description"
                content="Catalogo de marcas de equipo electrico, medicion, energia y herramientas tecnicas."
            />

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader current="products" productHref="/equipo-electrico" whatsappHref={getWhatsAppUrl()} />

            

            <section className="catalog-hero" aria-label="Encabezado de categoria">
                <div className="catalog-hero__bg" style={{ backgroundImage: "url('/assets/img/encabezado/equipo-electrico.jpg')" }} />
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

            <PublicFooter />

            <a className="wa-float" id="waFloat" href={getWhatsAppUrl()} aria-label="WhatsApp" target="_blank" rel="noreferrer">
                <img src="/assets/img/whatsapp.svg" alt="" className="wa-svg" aria-hidden="true" />
                <span className="wa-dot" />
                WhatsApp
            </a>
        </div>
    );
}
