(function () {
    if (window.__productCatalogBootstrapped) return;
    window.__productCatalogBootstrapped = true;

    function normalize(text) {
        return (text || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function bindCatalog(catalog) {
        if (catalog.dataset.catalogBound === "1") return;

        const searchInput = catalog.querySelector(".js-product-search");
        const cards = Array.from(catalog.querySelectorAll(".js-product-card"));
        const emptyState = catalog.querySelector(".js-product-empty");

        if (!searchInput || cards.length === 0) return;

        function filterCards() {
            const term = normalize(searchInput.value);
            let visibleCount = 0;

            cards.forEach((card) => {
                const source = normalize(card.getAttribute("data-search"));
                const match = term === "" || source.includes(term);
                card.hidden = !match;
                if (match) visibleCount += 1;
            });

            if (emptyState) {
                emptyState.hidden = visibleCount > 0;
                if (visibleCount === 0) {
                    const termOut = searchInput.value.trim();
                    emptyState.textContent = termOut
                        ? `No se encontraron resultados para "${termOut}".`
                        : "No hay productos para mostrar.";
                }
            }
        }

        searchInput.addEventListener("input", filterCards);
        filterCards();
        catalog.dataset.catalogBound = "1";
    }

    function initCatalogs() {
        document
            .querySelectorAll("[data-product-catalog]")
            .forEach(bindCatalog);
    }

    window.initProductCatalogs = initCatalogs;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCatalogs);
    } else {
        initCatalogs();
    }

    document.addEventListener("inertia:navigate", initCatalogs);
    document.addEventListener("inertia:finish", initCatalogs);
    document.addEventListener("livewire:navigated", initCatalogs);
})();
