import { Link } from "@inertiajs/react";

function faIcon(className) {
    return <i className={className} aria-hidden="true" />;
}

export default function PublicHeader({
    current = "home",
    productHref,
    whatsappHref = "#",
}) {
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

    return (
        <>
            <header className="site-header">
                <div className="container nav">
                    <a className="brand" href={homeUrl} aria-label="Latin Terra - Inicio">
                        <img src="/assets/img/logo.png" alt="Latin Terra Logo" />
                        <div className="name">LATIN TERRA</div>
                    </a>

                    <nav aria-label="Navegación principal">
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
                                    Contáctanos
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    <div className="nav-cta auth-cta auth-cta--pro">
                        <Link
                            className="icon-btn icon-btn--ghost icon-btn--login"
                            href="/login"
                            aria-label="Ingresar"
                            data-tip="Ingresar"
                        >
                            {faIcon("fa-solid fa-arrow-right-to-bracket")}
                        </Link>
                        <Link
                            className="icon-btn icon-btn--primary"
                            href="/register"
                            aria-label="Registrarse"
                            data-tip="Registrarse"
                        >
                            {faIcon("fa-solid fa-user-plus")}
                        </Link>
                        <button className="burger" id="burger" aria-label="Abrir menú">
                            <span />
                        </button>
                    </div>
                </div>
            </header>

            <div className="drawer" id="drawer" aria-hidden="true">
                <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Menú">
                    <div className="drawer-head">
                        <div className="brand" style={{ minWidth: "auto" }}>
                            <img src="/assets/img/logo.png" alt="Latin Terra Logo" />
                            <div className="name">LATIN TERRA</div>
                        </div>
                        <button className="burger" id="drawerClose" aria-label="Cerrar menú">
                            <span />
                        </button>
                    </div>

                    <ul>
                        <li>
                            <a href={anchor("inicio")} data-close="true" className={isActive("home")}>
                                Inicio
                            </a>
                        </li>
                        <li>
                            <Link href="/nosotros" data-close="true" className={isActive("about")}>
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
                                    <a href={productsUrl} data-close="true" className="drawer-products__all">
                                        Ver seccion productos
                                    </a>

                                    <div className="drawer-products__list">
                                        {productCategories.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                data-close="true"
                                                className={isProductItemActive(item.href) ? "active" : ""}
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
                            <Link href="/marcas" data-close="true" className={isActive("brands")}>
                                Marcas
                            </Link>
                        </li>
                        <li>
                            <a href={anchor("faq")} data-close="true">
                                FAQ
                            </a>
                        </li>
                        <li>
                            <Link href={contactUrl} data-close="true" className={isActive("contact")}>
                                Contáctanos
                            </Link>
                        </li>
                    </ul>

                    <div className="drawer-cta">
                        <Link className="btn btn-primary" href={contactUrl} data-close="true">
                            Cotizar Ahora
                        </Link>
                        <a
                            className="btn btn-dark"
                            href={whatsappHref}
                            id="btnWhatsDrawer"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img src="/assets/img/whatsapp.svg" alt="" className="icon" aria-hidden="true" />
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
