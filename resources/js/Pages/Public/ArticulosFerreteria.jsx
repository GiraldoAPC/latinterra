import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

const products = [
    { name: "Atlas", logo: "/assets/img/categorias/articulosdeferreteria/Atlas.jpg", desc: "Articulos y accesorios de ferreteria para trabajo tecnico e industrial." },
    { name: "AZ Instrument", logo: "/assets/img/categorias/articulosdeferreteria/AZ Instrument.jpg", desc: "Instrumentos y accesorios para medicion y soporte en taller." },
    { name: "Bahco", logo: "/assets/img/categorias/articulosdeferreteria/Bahco.jpg", desc: "Herramientas y articulos de ferreteria para uso profesional." },
    { name: "Bremen", logo: "/assets/img/categorias/articulosdeferreteria/Bremen.jpg", desc: "Soluciones de ferreteria para obra, mantenimiento y taller." },
    { name: "Facom", logo: "/assets/img/categorias/articulosdeferreteria/Facom.jpg", desc: "Articulos tecnicos y herramientas para precision y servicio." },
    { name: "Kamasa", logo: "/assets/img/categorias/articulosdeferreteria/Kamasa.jpg", desc: "Sets y complementos de ferreteria para mantenimiento." },
    { name: "Kolor", logo: "/assets/img/categorias/articulosdeferreteria/Kolor.jpg", desc: "Accesorios y consumibles para instalacion y soporte." },
    { name: "Mennekes", logo: "/assets/img/categorias/articulosdeferreteria/Mennekes.jpg", desc: "Conectividad y componentes tecnicos para entornos industriales." },
    { name: "Olfa", logo: "/assets/img/categorias/articulosdeferreteria/Olfa.jpg", desc: "Cuchillas, corte y accesorios para trabajo profesional." },
    { name: "Parker Legris", logo: "/assets/img/categorias/articulosdeferreteria/Parker Legris.jpg", desc: "Conectores y piezas para montaje y mantenimiento." },
    { name: "Pretul", logo: "/assets/img/categorias/articulosdeferreteria/Pretul.jpg", desc: "Articulos de ferreteria para uso diario en obra y taller." },
    { name: "Stanley", logo: "/assets/img/categorias/articulosdeferreteria/Stanley.jpg", desc: "Herramientas y accesorios de ferreteria de alto uso." },
    { name: "Surtek", logo: "/assets/img/categorias/articulosdeferreteria/Surtek.jpg", desc: "Ferreteria y complementos para mantenimiento industrial." },
    { name: "Total", logo: "/assets/img/categorias/articulosdeferreteria/Total.jpg", desc: "Articulos y equipos para proyecto, obra y servicio tecnico." },
    { name: "Tramontina", logo: "/assets/img/categorias/articulosdeferreteria/Tramontina.jpg", desc: "Linea de ferreteria y accesorios para trabajo tecnico." },
    { name: "Truper", logo: "/assets/img/categorias/articulosdeferreteria/Truper.jpg", desc: "Herramientas y articulos para instalacion y mantenimiento." },
    { name: "Wurth", logo: "/assets/img/categorias/articulosdeferreteria/Wurth.jpg", desc: "Fijacion, consumibles y soluciones de ferreteria profesional." },
];

const whatsappNumber = "51954178081";
const whatsappDefaultText = "Hola Latin Terra, quisiera cotizar articulos de ferreteria.";
const getWhatsAppUrl = (text = whatsappDefaultText) =>
    `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(text)}`;

export default function ArticulosFerreteria() {
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
            <Head title="Articulos de Ferreteria | Latin Terra" />
            <meta
                name="description"
                content="Catalogo de marcas de articulos de ferreteria para industria, obra y mantenimiento."
            />

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader current="products" productHref="/articulos-de-ferreteria" whatsappHref={getWhatsAppUrl()} />

            <section className="catalog-hero" aria-label="Encabezado de categoria">
                <div className="catalog-hero__bg" style={{ backgroundImage: "url('/assets/img/categorias/Ferreteria.jpg')" }} />
                <div className="catalog-hero__overlay" />
                <div className="catalog-hero__content">
                    <div className="catalog-hero__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M3 21h6l12-12-6-6L3 15v6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M14 6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h1 className="catalog-hero__title">Articulos de Ferreteria</h1>
                    <p className="catalog-hero__subtitle">
                        Marcas de ferreteria, consumibles y accesorios para trabajo industrial
                    </p>
                    <p className="catalog-hero__crumb">
                        <Link href="/">INICIO</Link> / ARTICULOS DE FERRETERIA
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

                    <section className="product-grid" aria-label="Catalogo de articulos de ferreteria">
                        {products.map((item, idx) => {
                            const msg = `Hola Latin Terra, quisiera cotizar articulos de ferreteria de la marca ${item.name}.`;

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
