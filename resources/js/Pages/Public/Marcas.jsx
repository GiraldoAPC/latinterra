import { Head, Link } from "@inertiajs/react";
import { useDeferredValue, useState } from "react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";
import brandsCatalogRaw from "@/data/brandsCatalog.json";

const WHATSAPP_PHONE = "51954178081";
const WHATSAPP_TEXT = "Hola Latin Terra, quisiera informacion de marcas y catalogos.";
const WHATSAPP_WEB_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

const CATEGORY_COLORS = {
    "Acceso por Cuerdas": "is-rope",
    "EPP y Seguridad": "is-epp",
    "Articulos de Ferreteria": "is-hardware",
    Herramientas: "is-tools",
    "Equipo Electrico": "is-electric",
    "Reparacion de Palas": "is-blades",
};

const brandsCatalog = [...brandsCatalogRaw].sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" })
);

export default function Marcas() {
    const [query, setQuery] = useState("");
    const deferredQuery = useDeferredValue(query);

    const normalized = deferredQuery.trim().toLowerCase();
    const filtered = brandsCatalog.filter((brand) => {
        if (!normalized) return true;

        const categoriesText = (brand.categories || []).join(" ").toLowerCase();
        return (
            brand.name.toLowerCase().includes(normalized) ||
            categoriesText.includes(normalized)
        );
    });

    return (
        <div className="catalog-page lt-public brands-page-lt">
            <Head title="Marcas | Latin Terra" />
            <meta
                name="description"
                content="Catalogo de marcas trabajadas por Latin Terra en sus categorias de productos, con busqueda y enlaces por categoria."
            />

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader current="brands" whatsappHref={WHATSAPP_WEB_URL} />

            <section className="catalog-hero" aria-label="Encabezado de marcas">
                <div
                    className="catalog-hero__bg"
                    style={{ backgroundImage: "url('/assets/img/encabezado/marca.jpg')" }}
                />
                <div className="catalog-hero__overlay" />
                <div className="catalog-hero__content">
                    <div className="catalog-hero__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M5 16V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8" stroke="currentColor" strokeWidth="1.8" />
                            <path d="M3 16h18M7 20h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M8 11h3M13 11h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h1 className="catalog-hero__title">Catalogo de Marcas</h1>
                    <p className="catalog-hero__subtitle">
                        Aliados estratégicos para soluciones seguras, confiables y de alto rendimiento
                    </p>
                    <p className="catalog-hero__crumb">
                        <Link href="/">INICIO</Link> / MARCAS
                    </p>
                </div>
                <div className="catalog-hero__curve" aria-hidden="true" />
            </section>

            <main className="catalog-main">
                <div className="container brands-page-lt__wrap">
                    <section className="brands-page-lt__toolbar reveal" aria-label="Buscador de marcas">
                        <div>
                            <p className="brands-page-lt__eyebrow">DIRECTORIO</p>
                            <h2>Busca una marca por nombre o categoria</h2>
                            <p>Encuentra rápidamente la marca ideal para tu operación.</p>
                        </div>

                        <label className="brands-page-lt__search">
                            <span aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                                    <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </span>
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar marca o categoria..."
                                aria-label="Buscar marca o categoria"
                            />
                        </label>
                    </section>

                    <section className="brands-page-lt__grid" aria-label="Catalogo de marcas">
                        {filtered.map((brand, idx) => (
                            <article
                                key={brand.name}
                                className="brands-page-lt__card reveal"
                                style={{ transitionDelay: `${(idx % 12) * 0.02}s` }}
                            >
                                <div className="brands-page-lt__logo">
                                    <img src={brand.logo} alt={`Logo ${brand.name}`} loading="lazy" />
                                </div>

                                <div className="brands-page-lt__body">
                                    <h3>{brand.name}</h3>
                                    <div className="brands-page-lt__chips">
                                        {(brand.categories || []).map((category, cIdx) => (
                                            <Link
                                                key={`${brand.name}-${category}`}
                                                href={brand.links?.[cIdx] || "/productos"}
                                                className={`brands-page-lt__chip ${CATEGORY_COLORS[category] || ""}`}
                                            >
                                                {category}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>

                    {filtered.length === 0 ? (
                        <div className="brands-page-lt__empty reveal">
                            <h3>No se encontraron marcas</h3>
                            <p>Prueba con otro nombre o busca por categoria (ej. EPP, Herramientas, Electrico).</p>
                        </div>
                    ) : null}
                </div>
            </main>

            <PublicFooter />

            <a
                className="wa-float"
                id="waFloat"
                href={WHATSAPP_WEB_URL}
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
