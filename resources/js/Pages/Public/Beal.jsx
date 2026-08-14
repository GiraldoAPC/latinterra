import { Head, Link } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";
import bealData from "../../../data/beal-products.json";

const whatsappNumber = "51954178081";
const getWhatsAppUrl = (text) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

const LINES = [
    {
        key: "pro",
        label: "Profesional",
        icon: "fa-solid fa-shield-halved",
        tagline: "Equipos técnicos certificados para acceso por cuerdas, rescate y trabajo en altura.",
    },
    {
        key: "sport",
        label: "Sport",
        icon: "fa-solid fa-mountain",
        tagline: "Línea deportiva Beal para escalada y montaña.",
    },
];

const CATEGORY_GROUPS = [
    {
        key: "escalada",
        label: "Escalada",
        icon: "fa-solid fa-mountain",
        subcats: ["Arnés", "Anillos de Cinta", "Anillo Autobloqueante", "Bloqueador de Mano", "Bloqueador Ventral", "Polea", "Polea Bloqueadora", "Descensor", "Dispositivo Anticaída", "Dispositivo de Aseguramiento", "Asegurador", "Elemeto de Amarre", "Elemento de amarre", "Anclaje Movil", "Asiento", "Conector", "Cordino"],
    },
    {
        key: "cuerdas",
        label: "Cuerdas",
        icon: "fa-solid fa-link",
        subcats: ["Cuerda", "Cuerda Dinamica", "Cuerda Auxiliar", "Cinta", "Cinta Tubular", "Cinta Adhesiva", "Cinta exprés", "Protector de cuerda"],
    },
    {
        key: "mosquetones",
        label: "Mosquetones",
        icon: "fa-solid fa-circle-notch",
        subcats: ["Mosquetón", "Mosqueton", "Mosquetón de Rosca", "Mosquetón Automatico"],
    },
    {
        key: "proteccion",
        label: "Protección",
        icon: "fa-solid fa-hard-hat",
        subcats: ["Casco", "Magnesio", "Magnesiera", "Magnesio Liquido", "Cepillo"],
    },
    {
        key: "ropa",
        label: "Ropa",
        icon: "fa-solid fa-shirt",
        subcats: ["Camiseta", "Sudadera", "Gorro"],
    },
    {
        key: "accesorios",
        label: "Accesorios",
        icon: "fa-solid fa-bag-shopping",
        subcats: ["Bolsa", "Bolsa Portacuerdas", "Mochila"],
    },
];

const SORT_OPTIONS = [
    { key: "relevancia", label: "Relevancia" },
    { key: "az", label: "Nombre A-Z" },
    { key: "za", label: "Nombre Z-A" },
];

const SIZE_LINE_PATTERNS = [
    { label: "Talla", icon: "fa-solid fa-shirt", match: /^Talla:?\s*/i },
    { label: "Cintura", icon: "fa-solid fa-ruler-horizontal", match: /^Cintura:?\s*/i },
    { label: "Pernera", icon: "fa-solid fa-ruler-vertical", match: /^Pernera:?\s*/i },
];

function parseSizeSpecs(sizeText) {
    if (!sizeText) return { specs: [], note: null };
    const lines = sizeText
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean);

    if (lines.length <= 1) {
        return { specs: [], note: null, plain: lines[0] ?? null };
    }

    const specs = [];
    let note = null;
    lines.forEach((line) => {
        const found = SIZE_LINE_PATTERNS.find((p) => p.match.test(line));
        if (found) {
            specs.push({ label: found.label, value: line.replace(found.match, "").trim(), icon: found.icon });
        } else {
            note = note ? `${note} ${line}` : line;
        }
    });

    return { specs, note, plain: null };
}

export default function Beal({ initialLine = "pro" }) {
    const line = initialLine === "sport" ? "sport" : "pro";
    const [search, setSearch] = useState("");
    const [group, setGroup] = useState("all");
    const [subcategory, setSubcategory] = useState(null);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    const [sortBy, setSortBy] = useState("relevancia");
    const [sortOpen, setSortOpen] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedColors, setSelectedColors] = useState([]);
    const [activeProduct, setActiveProduct] = useState(null);
    const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
    const [zoomActive, setZoomActive] = useState(false);

    useEffect(() => {
        document.body.classList.toggle("beal-modal-open", !!activeProduct);
        return () => document.body.classList.remove("beal-modal-open");
    }, [activeProduct]);

    useEffect(() => {
        const onEscape = (e) => {
            if (e.key === "Escape") setActiveProduct(null);
        };
        window.addEventListener("keydown", onEscape);
        return () => window.removeEventListener("keydown", onEscape);
    }, []);

    useEffect(() => {
        setGroup("all");
        setSubcategory(null);
        setSearch("");
        setSelectedColors([]);
        setShowAllCategories(false);
    }, [line]);

    const products = line === "pro" ? bealData.pro : bealData.sport;

    const groupOf = (sub) =>
        CATEGORY_GROUPS.find((g) => g.subcats.includes(sub))?.key ?? null;

    const groupsWithCounts = useMemo(
        () =>
            CATEGORY_GROUPS.map((g) => ({
                ...g,
                count: products.filter((p) => g.subcats.includes(p.subcategory)).length,
            })).filter((g) => g.count > 0),
        [products]
    );

    const subcatCounts = useMemo(() => {
        const counts = {};
        products.forEach((p) => {
            if (!p.subcategory) return;
            counts[p.subcategory] = (counts[p.subcategory] || 0) + 1;
        });
        return counts;
    }, [products]);

    const colorCounts = useMemo(() => {
        const counts = {};
        products.forEach((p) => {
            if (!p.color) return;
            counts[p.color] = (counts[p.color] || 0) + 1;
        });
        return counts;
    }, [products]);

    const colors = useMemo(
        () => Object.keys(colorCounts).sort((a, b) => a.localeCompare(b)),
        [colorCounts]
    );

    const toggleColor = (c) => {
        setSelectedColors((prev) =>
            prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
        );
    };

    const filteredCategoryGroups = useMemo(() => {
        const term = categorySearch.trim().toLowerCase();
        if (!term) return groupsWithCounts;
        return groupsWithCounts
            .map((g) => ({
                ...g,
                subcats: g.subcats.filter(
                    (s) => subcatCounts[s] && s.toLowerCase().includes(term)
                ),
            }))
            .filter((g) => g.subcats.length > 0);
    }, [groupsWithCounts, categorySearch, subcatCounts]);

    const selectGroup = (key) => {
        setGroup(key);
        setSubcategory(null);
        setShowAllCategories(false);
    };

    const selectSubcategory = (sub) => {
        setSubcategory(sub);
        setGroup(groupOf(sub) ?? "all");
        setShowAllCategories(false);
    };

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        let list = products.filter((p) => {
            if (subcategory) {
                if (p.subcategory !== subcategory) return false;
            } else if (group !== "all") {
                const activeGroup = CATEGORY_GROUPS.find((g) => g.key === group);
                if (!activeGroup?.subcats.includes(p.subcategory)) return false;
            }
            if (selectedColors.length > 0 && !selectedColors.includes(p.color)) {
                return false;
            }
            if (!term) return true;
            return (
                p.name.toLowerCase().includes(term) ||
                p.description.toLowerCase().includes(term) ||
                p.subcategory.toLowerCase().includes(term)
            );
        });

        if (sortBy === "az") {
            list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === "za") {
            list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        }

        return list;
    }, [products, search, subcategory, group, selectedColors, sortBy]);

    const activeGroupLabel =
        subcategory ??
        (group === "all" ? "Todos los productos" : CATEGORY_GROUPS.find((g) => g.key === group)?.label);

    return (
        <div className="catalog-page lt-public beal-page">
            <Head title="BEAL | Latin Terra">
                <meta
                    name="description"
                    content="Catálogo Beal Profesional y Sport: cuerdas, arneses, cascos, mosquetones y accesorios para trabajo en altura y escalada."
                />
                <meta property="og:title" content="Catálogo BEAL | Latin Terra" />
                <meta property="og:description" content="Catálogo Beal Profesional y Sport: cuerdas, arneses, cascos, mosquetones y accesorios para trabajo en altura y escalada." />
                <meta property="og:image" content="https://latin-terra.com/assets/img/encabezado/acceso-por-cuerdas.jpg" />
            </Head>

            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <PublicHeader
                current="beal"
                bealLine={line}
                whatsappHref={getWhatsAppUrl("Hola Latin Terra, quisiera cotizar productos Beal.")}
            />

            <section className="catalog-hero" aria-label="Encabezado Beal">
                <div className="catalog-hero__bg" style={{ backgroundImage: "url('/assets/img/encabezado/acceso-por-cuerdas.jpg')" }} />
                <div className="catalog-hero__overlay" />
                <div className="catalog-hero__content">
                    <div className="beal-hero-badge">
                        <img src="/assets/img/categorias/accesoporcuerdas/beal.jpg" alt="Beal" />
                    </div>
                    <h1 className="catalog-hero__title">
                        Catálogo BEAL <span className="beal-hero-line">{LINES.find((l) => l.key === line)?.label}</span>
                    </h1>
                    <p className="catalog-hero__subtitle">
                        {LINES.find((l) => l.key === line)?.tagline}
                    </p>
                    <p className="catalog-hero__crumb">
                        <Link href="/">INICIO</Link> / BEAL / {LINES.find((l) => l.key === line)?.label.toUpperCase()}
                    </p>
                </div>
                <div className="catalog-hero__curve" aria-hidden="true" />
            </section>

            <main className="catalog-main">
                <div className="container">
                    {products.length === 0 ? (
                        <div className="beal-empty-line">
                            <i className="fa-solid fa-hourglass-half" aria-hidden="true" />
                            <h3>Línea Sport próximamente</h3>
                            <p>
                                Estamos preparando el catálogo Beal Sport. Escríbenos por WhatsApp
                                si necesitas cotizar un producto de esta línea mientras tanto.
                            </p>
                            <a
                                className="btn btn-primary"
                                href={getWhatsAppUrl("Hola Latin Terra, quisiera consultar por productos Beal Sport.")}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Consultar por WhatsApp
                            </a>
                        </div>
                    ) : (
                        <>
                            <div className="beal-toolbar-row">
                                <div className="product-search beal-search reveal">
                                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                                        <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    <input
                                        type="search"
                                        placeholder="Buscar producto, código o categoría..."
                                        aria-label="Buscar productos Beal"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <div className="beal-toolbar-actions">
                                    <div className="beal-dropdown">
                                        <button
                                            type="button"
                                            className="beal-toolbar-btn"
                                            onClick={() => {
                                                setSortOpen((v) => !v);
                                                setFiltersOpen(false);
                                            }}
                                        >
                                            <i className="fa-solid fa-arrow-up-wide-short" aria-hidden="true" />
                                            Ordenar por
                                            <i className="fa-solid fa-chevron-down beal-toolbar-btn__caret" aria-hidden="true" />
                                        </button>
                                        {sortOpen && (
                                            <div className="beal-dropdown__panel">
                                                {SORT_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt.key}
                                                        type="button"
                                                        className={`beal-dropdown__item ${sortBy === opt.key ? "is-active" : ""}`}
                                                        onClick={() => {
                                                            setSortBy(opt.key);
                                                            setSortOpen(false);
                                                        }}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="beal-dropdown">
                                        <button
                                            type="button"
                                            className={`beal-toolbar-btn ${selectedColors.length ? "is-active" : ""}`}
                                            onClick={() => {
                                                setFiltersOpen((v) => !v);
                                                setSortOpen(false);
                                            }}
                                        >
                                            <i className="fa-solid fa-sliders" aria-hidden="true" />
                                            Filtros
                                            {selectedColors.length > 0 && (
                                                <span className="beal-toolbar-btn__badge">{selectedColors.length}</span>
                                            )}
                                        </button>
                                        {filtersOpen && (
                                            <div className="beal-dropdown__panel beal-dropdown__panel--filters">
                                                <div className="beal-filter-group">
                                                    <div className="beal-filter-group__head">
                                                        <span className="beal-filter-group__title">
                                                            <i className="fa-solid fa-palette" aria-hidden="true" />
                                                            Color
                                                        </span>
                                                        {selectedColors.length > 0 && (
                                                            <button
                                                                type="button"
                                                                className="beal-filter-group__clear"
                                                                onClick={() => setSelectedColors([])}
                                                            >
                                                                Limpiar
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="beal-filter-checklist">
                                                        {colors.map((c) => (
                                                            <label key={c} className="beal-filter-check">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedColors.includes(c)}
                                                                    onChange={() => toggleColor(c)}
                                                                />
                                                                <span className="beal-filter-check__box">
                                                                    <i className="fa-solid fa-check" aria-hidden="true" />
                                                                </span>
                                                                <span className="beal-filter-check__label">{c}</span>
                                                                <span className="beal-filter-check__count">{colorCounts[c]}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="beal-dropdown__panel-actions">
                                                    <button type="button" onClick={() => setSelectedColors([])}>
                                                        Limpiar todo
                                                    </button>
                                                    <button type="button" className="is-primary" onClick={() => setFiltersOpen(false)}>
                                                        Aplicar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="beal-categories">
                                <h2 className="beal-categories__title">Explorar categorías</h2>
                                <div className="beal-pill-row">
                                    <button
                                        type="button"
                                        className={`beal-pill ${group === "all" ? "is-active" : ""}`}
                                        onClick={() => selectGroup("all")}
                                    >
                                        <span className="beal-pill__icon" aria-hidden="true">
                                            <i className="fa-solid fa-grip" />
                                        </span>
                                        <span>Todas</span>
                                    </button>
                                    {groupsWithCounts.map((g) => (
                                        <button
                                            key={g.key}
                                            type="button"
                                            className={`beal-pill ${group === g.key && !subcategory ? "is-active" : ""}`}
                                            onClick={() => selectGroup(g.key)}
                                        >
                                            <span className="beal-pill__icon" aria-hidden="true">
                                                <i className={g.icon} />
                                            </span>
                                            <span>{g.label}</span>
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        className="beal-pill beal-pill--outline"
                                        onClick={() => setShowAllCategories((v) => !v)}
                                    >
                                        Ver todas las categorías
                                        <i className={`fa-solid fa-chevron-${showAllCategories ? "up" : "right"}`} aria-hidden="true" />
                                    </button>
                                </div>

                                {showAllCategories && (
                                    <div className="beal-categories-panel">
                                        <div className="beal-categories-panel__head">
                                            <h3>Todas las categorías</h3>
                                            <div className="beal-categories-panel__search">
                                                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                                                <input
                                                    type="text"
                                                    placeholder="Buscar categoría..."
                                                    value={categorySearch}
                                                    onChange={(e) => setCategorySearch(e.target.value)}
                                                />
                                                {categorySearch && (
                                                    <button type="button" onClick={() => setCategorySearch("")} aria-label="Limpiar búsqueda">
                                                        <i className="fa-solid fa-xmark" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="beal-categories-panel__grid">
                                            {filteredCategoryGroups.map((g) => (
                                                <div key={g.key} className="beal-categories-panel__col">
                                                    <h4>{g.label}</h4>
                                                    <ul>
                                                        {g.subcats
                                                            .filter((s) => subcatCounts[s])
                                                            .map((s) => (
                                                                <li key={s}>
                                                                    <button
                                                                        type="button"
                                                                        className={subcategory === s ? "is-active" : ""}
                                                                        onClick={() => selectSubcategory(s)}
                                                                    >
                                                                        <span>{s}</span>
                                                                        <span className="beal-categories-panel__count">{subcatCounts[s]}</span>
                                                                    </button>
                                                                </li>
                                                            ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            className="beal-categories-panel__close"
                                            onClick={() => setShowAllCategories(false)}
                                        >
                                            Cerrar categorías
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="beal-results-head">
                                <h3>{activeGroupLabel}</h3>
                                <span className="beal-results-head__count">{filtered.length} producto{filtered.length === 1 ? "" : "s"}</span>
                            </div>

                            <section className="product-grid" aria-label="Productos Beal">
                                {filtered.map((item, idx) => {
                                    const msg = `Hola Latin Terra, quisiera cotizar el producto Beal "${item.name}"${item.sku ? ` (código ${item.sku})` : ""}.`;
                                    return (
                                        <article
                                            key={`${item.sku}-${idx}`}
                                            className="product-card beal-card--clickable reveal"
                                            style={{ transitionDelay: `${(idx % 10) * 0.03}s` }}
                                            onClick={() => setActiveProduct(item)}
                                        >
                                            <div className="product-logo">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} loading="lazy" />
                                                ) : (
                                                    <i className="fa-solid fa-box-open" aria-hidden="true" style={{ fontSize: 28, color: "#94a3b8" }} />
                                                )}
                                            </div>
                                            <div className="beal-card__head">
                                                <span className="beal-card__tag">{item.subcategory}</span>
                                            </div>
                                            <h3>{item.name}</h3>
                                            <p>{item.description}</p>
                                            <div className="beal-card__meta">
                                                {item.color && <span>{item.color}</span>}
                                                {item.size && <span>{item.size}</span>}
                                            </div>
                                            <div className="beal-card__actions">
                                                <button
                                                    type="button"
                                                    className="beal-card__details-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveProduct(item);
                                                    }}
                                                >
                                                    Ver detalles
                                                </button>
                                                <a
                                                    className="btn btn-primary product-quote-btn"
                                                    href={getWhatsAppUrl(msg)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <img src="/assets/img/whatsapp.svg" alt="" aria-hidden="true" />
                                                    Cotizar
                                                </a>
                                            </div>
                                        </article>
                                    );
                                })}
                            </section>

                            {filtered.length === 0 && (
                                <p className="catalog-empty">No se encontraron resultados.</p>
                            )}
                        </>
                    )}
                </div>
            </main>

            {activeProduct && (() => {
                const { specs: sizeSpecs, note: sizeNote, plain: sizePlain } = parseSizeSpecs(activeProduct.size);
                const whatsappMsg = `Hola Latin Terra, quisiera cotizar el producto Beal "${activeProduct.name}"${activeProduct.sku ? ` (código ${activeProduct.sku})` : ""}.`;

                return (
                    <div
                        className="beal-modal-overlay"
                        role="dialog"
                        aria-modal="true"
                        aria-label={activeProduct.name}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setActiveProduct(null);
                        }}
                    >
                        <div className="beal-modal">
                            <button
                                type="button"
                                className="beal-modal__close"
                                aria-label="Cerrar"
                                onClick={() => setActiveProduct(null)}
                            >
                                <i className="fa-solid fa-xmark" aria-hidden="true" />
                            </button>

                            <div
                                className={`beal-modal__media ${zoomActive ? "is-zoomed" : ""}`}
                                onMouseMove={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                                    setZoomOrigin(`${x}% ${y}%`);
                                }}
                                onMouseEnter={() => setZoomActive(true)}
                                onMouseLeave={() => setZoomActive(false)}
                            >
                                {activeProduct.image ? (
                                    <img
                                        src={activeProduct.image}
                                        alt={activeProduct.name}
                                        style={{ transformOrigin: zoomOrigin }}
                                    />
                                ) : (
                                    <i className="fa-solid fa-box-open" aria-hidden="true" />
                                )}
                            </div>

                            <div className="beal-modal__body">
                                <div className="beal-card__head">
                                    <span className="beal-card__tag">{activeProduct.subcategory}</span>
                                </div>

                                <h2 className="beal-modal__title">{activeProduct.name}</h2>
                                {activeProduct.sku && <p className="beal-modal__sku">Código: {activeProduct.sku}</p>}

                                <div className="beal-modal__divider" />

                                <p className="beal-modal__description">{activeProduct.description}</p>

                                {(activeProduct.color || sizeSpecs.length > 0 || sizePlain || activeProduct.qty) && (
                                    <div className="beal-modal__features">
                                        <h4 className="beal-modal__features-title">
                                            <i className="fa-solid fa-clipboard-list" aria-hidden="true" />
                                            Características
                                        </h4>
                                        <div className="beal-modal__specs">
                                            {activeProduct.color && (
                                                <div className="beal-modal__spec">
                                                    <i className="fa-solid fa-palette" aria-hidden="true" />
                                                    <span>Color</span>
                                                    <strong>{activeProduct.color}</strong>
                                                </div>
                                            )}
                                            {sizePlain && (
                                                <div className="beal-modal__spec">
                                                    <i className="fa-solid fa-ruler" aria-hidden="true" />
                                                    <span>Talla / Medida</span>
                                                    <strong>{sizePlain}</strong>
                                                </div>
                                            )}
                                            {sizeSpecs.map((s) => (
                                                <div className="beal-modal__spec" key={s.label}>
                                                    <i className={s.icon} aria-hidden="true" />
                                                    <span>{s.label}</span>
                                                    <strong>{s.value}</strong>
                                                </div>
                                            ))}
                                            {activeProduct.qty && (
                                                <div className="beal-modal__spec">
                                                    <i className="fa-solid fa-boxes-stacked" aria-hidden="true" />
                                                    <span>Cantidad disponible</span>
                                                    <strong>{activeProduct.qty}</strong>
                                                </div>
                                            )}
                                            {sizeNote && (
                                                <div className="beal-modal__spec beal-modal__spec--wide">
                                                    <i className="fa-solid fa-circle-info" aria-hidden="true" />
                                                    <span>{sizeNote}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <a
                                    className="btn btn-primary product-quote-btn beal-modal__cta"
                                    href={getWhatsAppUrl(whatsappMsg)}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <img src="/assets/img/whatsapp.svg" alt="" aria-hidden="true" />
                                    Cotizar por WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <PublicFooter />

            <a className="wa-float" id="waFloat" href={getWhatsAppUrl("Hola Latin Terra, quisiera cotizar productos Beal.")} aria-label="WhatsApp" target="_blank" rel="noreferrer">
                <img src="/assets/img/whatsapp.svg" alt="" className="wa-svg" aria-hidden="true" />
                <span className="wa-dot" />
                WhatsApp
            </a>
        </div>
    );
}
