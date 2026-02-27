import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

const products = [
    { name: "Aguerri", logo: "/assets/img/categorias/accesoporcuerdas/aguerri.jpg", desc: "Equipos y accesorios para acceso por cuerdas y seguridad en altura." },
    { name: "Avanti", logo: "/assets/img/categorias/accesoporcuerdas/avanti.jpg", desc: "Soluciones para trabajo vertical y operaciones de acceso por cuerdas." },
    { name: "Beal", logo: "/assets/img/categorias/accesoporcuerdas/beal.jpg", desc: "Cuerdas y equipos tecnicos para rescate y acceso por cuerdas." },
    { name: "Climbing Technologies", logo: "/assets/img/categorias/accesoporcuerdas/climingteclogies.jpg", desc: "Equipamiento certificado para progresion y proteccion en altura." },
    { name: "Edelweis", logo: "/assets/img/categorias/accesoporcuerdas/ELEWESI.jpg", desc: "Componentes de anclaje y sujecion para maniobras seguras." },
    { name: "Fenix", logo: "/assets/img/categorias/accesoporcuerdas/fenix.jpg", desc: "Iluminacion y accesorios para trabajos tecnicos en campo." },
    { name: "Forclaz", logo: "/assets/img/categorias/accesoporcuerdas/forclaz.jpg", desc: "Accesorios tecnicos para actividades de altura y exigencia." },
    { name: "Irudek", logo: "/assets/img/categorias/accesoporcuerdas/irudek.jpg", desc: "Sistemas anticaidas y lineas de vida para trabajo vertical." },
    { name: "Juragjanka", logo: "/assets/img/categorias/accesoporcuerdas/juragjanka.jpg", desc: "Accesorios para seguridad industrial y trabajo en altura." },
    { name: "Kaya", logo: "/assets/img/categorias/accesoporcuerdas/kaya.jpg", desc: "Equipos para rescate, evacuacion y acceso por cuerdas." },
    { name: "Petzel", logo: "/assets/img/categorias/accesoporcuerdas/petzel.jpg", desc: "Sistemas de proteccion, iluminacion y progresion para altura." },
    { name: "Safeface", logo: "/assets/img/categorias/accesoporcuerdas/safeface.jpg", desc: "Proteccion personal complementaria para operaciones de riesgo." },
    { name: "Singing Rock", logo: "/assets/img/categorias/accesoporcuerdas/SINGINGROCK.jpg", desc: "Equipos para acceso por cuerda, rescate y anclajes." },
    { name: "Yoke", logo: "/assets/img/categorias/accesoporcuerdas/YOKE.jpg", desc: "Herrajes y puntos de anclaje de alta resistencia." },
];

const whatsappNumber = "51954178081";
const whatsappDefaultText = "Hola Latin Terra, quisiera cotizar productos de acceso por cuerdas.";
const getWhatsAppUrl = (text = whatsappDefaultText) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

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
        <div className="catalog-page lt-public">
            <Head title="Acceso por Cuerdas | Latin Terra" />
            <meta
                name="description"
                content="Catalogo de marcas para acceso por cuerdas, rescate y trabajo vertical."
            />

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader current="products" productHref="/acceso-por-cuerdas" whatsappHref={getWhatsAppUrl()} />

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
                    <h1 className="catalog-hero__title">Acceso por Cuerdas</h1>
                    <p className="catalog-hero__subtitle">
                        Marcas para trabajo vertical, rescate y sistemas de seguridad en altura
                    </p>
                    <p className="catalog-hero__crumb">
                        <Link href="/">INICIO</Link> / ACCESO POR CUERDAS
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

                    <section className="product-grid" aria-label="Catalogo de acceso por cuerdas">
                        {products.map((item, idx) => {
                            const msg = `Hola Latin Terra, quisiera cotizar productos de acceso por cuerdas de la marca ${item.name}.`;

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
