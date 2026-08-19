import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

const products = [
    { name: "Bahco", logo: "/assets/img/categorias/herramientas/Bahco.jpg", desc: "Herramientas manuales profesionales para uso industrial y tecnico." },
    { name: "Olfa", logo: "/assets/img/categorias/herramientas/Olfa.jpg", desc: "Corte profesional y herramientas de precision para uso tecnico." },
    { name: "Pretul", logo: "/assets/img/categorias/herramientas/Pretul.jpg", desc: "Herramienta utilitaria para trabajo diario, obra y servicio tecnico." },
    { name: "Toughbuilt", logo: "/assets/img/categorias/herramientas/Toughbuilt.jpg", desc: "Herramientas y accesorios robustos para obra y trabajo de campo." },
    { name: "Truper", logo: "/assets/img/categorias/herramientas/Truper.jpg", desc: "Herramientas y complementos para instalacion, construccion y taller." },
    { name: "Stanley", logo: "/assets/img/categorias/articulosdeferreteria/Stanley.jpg", desc: "Herramientas manuales y electricas de referencia para taller e industria." },
    { name: "Makita", logo: "/assets/img/categorias/electrico/Makita.jpg", desc: "Herramientas electricas profesionales para construccion e industria." },
    { name: "Bosch", logo: "/assets/img/categorias/electrico/Bosch.jpg", desc: "Linea Azul: herramientas electricas profesionales de alto rendimiento." },
    { name: "DeWalt", logo: "/assets/img/categorias/electrico/Dewalt.jpg", desc: "Herramientas electricas resistentes para uso profesional intensivo." },
    { name: "Milwaukee Tool", logo: "/assets/img/categorias/herramientas/milwauke.jpeg", desc: "Herramientas electricas profesionales de alto rendimiento para uso intensivo." },
    { name: "CAT", logo: "/assets/img/categorias/herramientas/cat.jpeg", desc: "Herramientas y equipos robustos con el respaldo de la marca Caterpillar." },
    { name: "Volteck", logo: "/assets/img/categorias/herramientas/volteck.jpeg", desc: "Herramientas y equipo electrico para instalacion, taller e industria." },
];

const whatsappNumber = "51954178081";
const whatsappDefaultText = "Hola Latin Terra, quisiera cotizar herramientas.";
const getWhatsAppUrl = (text = whatsappDefaultText) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

export default function Herramientas() {
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
            <Head title="Herramientas y Ferretería | Latin Terra">
                <meta
                    name="description"
                    content="Catalogo de marcas de herramientas y ferreteria para mantenimiento, taller e industria."
                />
                <meta property="og:title" content="Herramientas y Ferretería | Latin Terra" />
                <meta property="og:description" content="Catalogo de marcas de herramientas y ferreteria para mantenimiento, taller e industria." />
                <meta property="og:image" content="https://latin-terra.com/assets/img/categorias/Herramientas.jpg" />
            </Head>

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader current="products" productHref="/herramientas" whatsappHref={getWhatsAppUrl()} />

            

            <section className="catalog-hero" aria-label="Encabezado de categoria">
                <div className="catalog-hero__bg" style={{ backgroundImage: "url('/assets/img/categorias/Herramientas.jpg')" }} />
                <div className="catalog-hero__overlay" />
                <div className="catalog-hero__content">
                    <div className="catalog-hero__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M14 7l3 3-8 8H6v-3l8-8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M13 8l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h1 className="catalog-hero__title">Herramientas y Ferretería</h1>
                    <p className="catalog-hero__subtitle">
                        Marcas para herramientas, ferreteria, precision y mantenimiento tecnico
                    </p>
                    <p className="catalog-hero__crumb">
                        <Link href="/">INICIO</Link> / HERRAMIENTAS Y FERRETERÍA
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

                    <section className="product-grid" aria-label="Catalogo de herramientas">
                        {products.map((item, idx) => {
                            const msg = `Hola Latin Terra, quisiera cotizar herramientas de la marca ${item.name}.`;

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
