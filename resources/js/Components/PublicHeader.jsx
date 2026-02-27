import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";

function faIcon(className) {
    return <i className={className} aria-hidden="true" />;
}

export default function PublicHeader({
    current = "home",
    productHref,
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const facebookUrl = "https://www.facebook.com/share/1BnVinCAXH/";
    const instagramUrl = "https://www.instagram.com/";
    const isHome = current === "home";
    const anchor = (id) => (isHome ? `#${id}` : `/#${id}`);
    const productsUrl = productHref ?? anchor("productos");
    const homeUrl = isHome ? "#inicio" : "/";
    const contactUrl = "/contacto";
    const currentProductHref = (productHref ?? "").split("?")[0];
    const productCategories = [
        { href: "/acceso-por-cuerdas", label: "Acceso por Cuerdas", icon: "fa-solid fa-link" },
        { href: "/epp-y-seguridad", label: "EPP y Seguridad", icon: "fa-solid fa-shield" },
        { href: "/articulos-de-ferreteria", label: "Articulos de Ferreteria", icon: "fa-solid fa-tools" },
        { href: "/herramientas", label: "Herramientas", icon: "fa-solid fa-toolbox" },
        { href: "/equipo-electrico", label: "Equipo Electrico", icon: "fa-solid fa-bolt" },
        { href: "/reparacion-de-palas", label: "Reparacion de Palas", icon: "fa-solid fa-gears" },
    ];

    const isActive = (key) => (current === key ? "active" : "");
    const isProductItemActive = (href) => current === "products" && currentProductHref === href;

    useEffect(() => {
        document.body.classList.toggle("menu-open", menuOpen);

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => {
            document.body.classList.remove("menu-open");
            window.removeEventListener("keydown", handleEscape);
        };
    }, [menuOpen]);

    return (
        <>
            <header className="site-header">
                <div className="container nav">
                    <a className="brand" href={homeUrl} aria-label="Latin Terra - Inicio">
                        <img src="/assets/img/logo.png" alt="Latin Terra Logo" />
                        <div className="name">LATIN TERRA</div>
                    </a>

                    <nav aria-label="Navegacion principal">
                        <ul className="menu" id="menu">
                            <li>
                                <a href={anchor("inicio")} className={isActive("home")}>
                                    Inicio
                                </a>
                            </li>
                            <li>
                                <Link href="/nosotros" className={isActive("about")}>
                                    Nosotros
                                </Link>
                            </li>
                            <li className="menu-item menu-item--products">
                                <a href={productsUrl} className={isActive("products")}>
                                    Productos
                                    <span className="menu-caret" aria-hidden="true">
                                        {faIcon("fa-solid fa-chevron-down")}
                                    </span>
                                </a>
                                <div className="products-submenu" role="menu" aria-label="Categorias de productos">
                                    <div className="products-submenu__grid">
                                        {productCategories.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                role="menuitem"
                                                className={`products-submenu__link ${isProductItemActive(item.href) ? "is-current" : ""}`}
                                            >
                                                <span className="products-submenu__icon" aria-hidden="true">
                                                    {faIcon(item.icon)}
                                                </span>
                                                <span>{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </li>
                            <li>
                                <Link href="/marcas" className={isActive("brands")}>
                                    Marcas
                                </Link>
                            </li>
                            <li>
                                <a href={anchor("faq")}>FAQ</a>
                            </li>
                            <li>
                                <Link href={contactUrl} className={isActive("contact")}>
                                    Contactanos
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    <div className="nav-cta auth-cta auth-cta--pro">
                        <a
                            className="icon-btn icon-btn--ghost"
                            href={facebookUrl}
                            aria-label="Facebook"
                            data-tip="Facebook"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {faIcon("fa-brands fa-facebook-f")}
                        </a>
                        <a
                            className="icon-btn icon-btn--ghost"
                            href={instagramUrl}
                            aria-label="Instagram"
                            data-tip="Instagram"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {faIcon("fa-brands fa-instagram")}
                        </a>
                        <button className="burger" id="burger" aria-label="Abrir menu" onClick={() => setMenuOpen((prev) => !prev)}>
                            <span />
                        </button>
                    </div>
                </div>
            </header>

            <div
                className="drawer"
                id="drawer"
                aria-hidden={menuOpen ? "false" : "true"}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        setMenuOpen(false);
                    }
                }}
            >
                <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">
                    <div className="drawer-head">
                        <div className="brand" style={{ minWidth: "auto" }}>
                            <img src="/assets/img/logo.png" alt="Latin Terra Logo" />
                            <div className="name">LATIN TERRA</div>
                        </div>
                        <button className="burger" id="drawerClose" aria-label="Cerrar menu" onClick={() => setMenuOpen(false)}>
                            <span />
                        </button>
                    </div>

                    <ul>
                        <li>
                            <a href={anchor("inicio")} data-close="true" className={isActive("home")} onClick={() => setMenuOpen(false)}>
                                Inicio
                            </a>
                        </li>
                        <li>
                            <Link href="/nosotros" data-close="true" className={isActive("about")} onClick={() => setMenuOpen(false)}>
                                Nosotros
                            </Link>
                        </li>
                        <li className="drawer-products">
                            <details>
                                <summary className={isActive("products")}>
                                    <span className="drawer-products__summary-main">
                                        <span className="drawer-products__summary-icon" aria-hidden="true">
                                            {faIcon("fa-solid fa-boxes-stacked")}
                                        </span>
                                        <span>Productos</span>
                                    </span>
                                    <span className="drawer-products__caret" aria-hidden="true">
                                        {faIcon("fa-solid fa-chevron-down")}
                                    </span>
                                </summary>

                                <div className="drawer-products__actions">
                                    <a href={productsUrl} data-close="true" className="drawer-products__all" onClick={() => setMenuOpen(false)}>
                                        Ver seccion productos
                                    </a>

                                    <div className="drawer-products__list">
                                        {productCategories.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                data-close="true"
                                                className={isProductItemActive(item.href) ? "active" : ""}
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                <span className="drawer-products__item-icon" aria-hidden="true">
                                                    {faIcon(item.icon)}
                                                </span>
                                                <span>{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </details>
                        </li>
                        <li>
                            <Link href="/marcas" data-close="true" className={isActive("brands")} onClick={() => setMenuOpen(false)}>
                                Marcas
                            </Link>
                        </li>
                        <li>
                            <a href={anchor("faq")} data-close="true" onClick={() => setMenuOpen(false)}>
                                FAQ
                            </a>
                        </li>
                        <li>
                            <Link href={contactUrl} data-close="true" className={isActive("contact")} onClick={() => setMenuOpen(false)}>
                                Contactanos
                            </Link>
                        </li>
                    </ul>

                    <div className="drawer-cta">
                        <a className="drawer-social" href={facebookUrl} target="_blank" rel="noreferrer">
                            <span className="drawer-social__icon" aria-hidden="true">{faIcon("fa-brands fa-facebook-f")}</span>
                            <span>Facebook</span>
                        </a>
                        <a className="drawer-social" href={instagramUrl} target="_blank" rel="noreferrer">
                            <span className="drawer-social__icon" aria-hidden="true">{faIcon("fa-brands fa-instagram")}</span>
                            <span>Instagram</span>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
