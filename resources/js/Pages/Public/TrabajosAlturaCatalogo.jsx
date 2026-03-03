import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

const products = [
    { name: "Aguerri", logo: "/assets/img/categorias/accesoporcuerdas/aguerri.jpg", desc: "Equipos y accesorios para seguridad y trabajo en altura." },
    { name: "Avanti", logo: "/assets/img/categorias/accesoporcuerdas/avanti.jpg", desc: "Soluciones para trabajo vertical, inspeccion y maniobras seguras." },
    { name: "Beal", logo: "/assets/img/categorias/accesoporcuerdas/beal.jpg", desc: "Cuerdas y equipos tecnicos para rescate, soporte y progresion en altura." },
    { name: "TRUPER", logo: "/assets/img/categorias/herramientas/Truper.jpg", desc: "Herramientas de apoyo para mantenimiento, instalacion y trabajo tecnico." },
    { name: "Edelweis", logo: "/assets/img/categorias/accesoporcuerdas/ELEWESI.jpg", desc: "Componentes de anclaje y sujecion para maniobras controladas." },
    { name: "Fenix", logo: "/assets/img/categorias/accesoporcuerdas/fenix.jpg", desc: "Iluminacion y accesorios para operaciones en campo y altura." },
    { name: "Forclaz", logo: "/assets/img/categorias/accesoporcuerdas/forclaz.jpg", desc: "Accesorios tecnicos para actividades de altura y exigencia operativa." },
    { name: "Irudek", logo: "/assets/img/categorias/accesoporcuerdas/irudek.jpg", desc: "Sistemas anticaidas y lineas de vida para trabajo vertical." },
    { name: "Kaya", logo: "/assets/img/categorias/accesoporcuerdas/kaya.jpg", desc: "Equipos para rescate, evacuacion y acceso por cuerdas." },
    { name: "Petzel", logo: "/assets/img/categorias/accesoporcuerdas/petzel.jpg", desc: "Sistemas de proteccion, iluminacion y progresion para altura." },
    { name: "Safeface", logo: "/assets/img/categorias/accesoporcuerdas/safeface.jpg", desc: "Proteccion personal complementaria para operaciones de riesgo." },
    { name: "Singing Rock", logo: "/assets/img/categorias/accesoporcuerdas/SINGINGROCK.jpg", desc: "Equipos para trabajo en altura, rescate y anclajes." },
    { name: "Yoke", logo: "/assets/img/categorias/accesoporcuerdas/YOKE.jpg", desc: "Herrajes y puntos de anclaje de alta resistencia." },
];

const whatsappNumber = "51954178081";
const whatsappDefaultText = "Hola Latin Terra, quisiera cotizar productos para trabajos en altura.";
const getWhatsAppUrl = (text = whatsappDefaultText) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
const getBrandId = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function TrabajosAlturaCatalogo() {
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
            <Head title="Trabajos en Altura | Latin Terra" />
            <meta
                name="description"
                content="Catalogo de marcas para trabajos en altura, rescate y sistemas de seguridad especializada."
            />

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader current="products" productHref="/trabajos-en-altura" whatsappHref={getWhatsAppUrl()} />

            <section className="catalog-hero" aria-label="Encabezado de categoria">
                <div
                    className="catalog-hero__bg"
                    style={{ backgroundImage: "url('/assets/img/encabezado/acceso-por-cuerdas.jpg')" }}
                />
                <div className="catalog-hero__overlay" />
                <div className="catalog-hero__content">
                    <div className="catalog-hero__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="1.8" />
                            <path d="M9 12l2 2 4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 className="catalog-hero__title">Trabajos en Altura</h1>
                    <p className="catalog-hero__subtitle">
                        Marcas para proteccion, rescate y operaciones seguras en altura
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
                            placeholder="Buscar por marca o descripcion..."
                            aria-label="Buscar por marca o descripcion"
                        />
                    </div>

                    <section className="product-grid" aria-label="Catalogo de trabajos en altura">
                        {products.map((item, idx) => {
                            const msg = `Hola Latin Terra, quisiera cotizar productos para trabajos en altura de la marca ${item.name}.`;

                            return (
                                <article
                                    id={getBrandId(item.name)}
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
