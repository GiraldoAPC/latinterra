
// ==========================
// CONFIG (edita aquí)
// ==========================
const WHATSAPP_NUMBER = "51954178081"; // <-- Cambia por tu número (sin +, sin espacios)
const WHATSAPP_DEFAULT_TEXT =
    "Hola Latin Terra, quisiera cotizar sus productos. Mi requerimiento es:";

// ==========================
// Helpers
// ==========================
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

function openWhatsApp(text) {
    const msg = encodeURIComponent(text || WHATSAPP_DEFAULT_TEXT);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    window.open(url, "_blank", "noopener,noreferrer");
}

// ==========================
// Footer year
// ==========================
const yearEl = qs("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ==========================
// Mobile menu
// ==========================
const burger = qs("#burger");
const drawer = qs("#drawer");
const drawerClose = qs("#drawerClose");

function closeMenu() {
    document.body.classList.remove("menu-open");
    drawer?.setAttribute("aria-hidden", "true");
}
function openMenu() {
    document.body.classList.add("menu-open");
    drawer?.setAttribute("aria-hidden", "false");
}

burger?.addEventListener("click", () => {
    document.body.classList.contains("menu-open") ? closeMenu() : openMenu();
});
drawerClose?.addEventListener("click", closeMenu);
drawer?.addEventListener("click", (e) => {
    if (e.target === drawer) closeMenu();
});
qsa("[data-close]").forEach(a => a.addEventListener("click", closeMenu));

// ESC to close
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
});

// ==========================
// Active menu item on scroll
// ==========================
const sections = ["inicio", "nosotros", "productos", "marcas", "cursos", "faq", "contacto"]
    .map(id => document.getElementById(id))
    .filter(Boolean);

const menuLinks = qsa(".menu a");
function setActiveLink(id) {
    menuLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
}

const observerMenu = new IntersectionObserver((entries) => {
    // pick the most visible section
    const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible?.target?.id) setActiveLink(visible.target.id);
}, { threshold: [0.35, 0.55, 0.75] });

sections.forEach(sec => observerMenu.observe(sec));

// ==========================
// Reveal on scroll animations
// ==========================
const reveals = qsa(".reveal");
const observerReveal = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observerReveal.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

reveals.forEach(el => observerReveal.observe(el));

// ==========================
// WhatsApp buttons
// ==========================
qs("#btnWhatsTop")?.addEventListener("click", (e) => {
    e.preventDefault();
    openWhatsApp(WHATSAPP_DEFAULT_TEXT);
});
qs("#btnWhatsDrawer")?.addEventListener("click", (e) => {
    e.preventDefault();
    openWhatsApp(WHATSAPP_DEFAULT_TEXT);
    closeMenu();
});
qs("#btnWhatsContact")?.addEventListener("click", (e) => {
    e.preventDefault();
    openWhatsApp(WHATSAPP_DEFAULT_TEXT);
});

// floating show after scroll
const waFloat = qs("#waFloat");
window.addEventListener("scroll", () => {
    if (window.scrollY > 420) waFloat.classList.add("show");
    else waFloat.classList.remove("show");
});
waFloat?.addEventListener("click", (e) => {
    e.preventDefault();
    openWhatsApp(WHATSAPP_DEFAULT_TEXT);
});

// ==========================
// Slider
// ==========================
const slides = qsa(".slide");
const dotsWrap = qs("#dots");
const btnPrev = qs("#prev");
const btnNext = qs("#next");

let idx = 0;
let timer = null;
const AUTOPLAY_MS = 5500;

function renderDots() {
    if (!dotsWrap || !slides.length) return;
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.className = "dot" + (i === idx ? " active" : "");
        b.setAttribute("aria-label", `Ir a slide ${i + 1}`);
        b.addEventListener("click", () => goTo(i, true));
        dotsWrap.appendChild(b);
    });
}

function goTo(nextIndex, userAction = false) {
    if (!slides.length) return;
    slides[idx].classList.remove("active");
    idx = (nextIndex + slides.length) % slides.length;
    slides[idx].classList.add("active");
    renderDots();
    if (userAction) restartAutoplay();
}

function next(userAction = false) { goTo(idx + 1, userAction); }
function prev(userAction = false) { goTo(idx - 1, userAction); }

btnNext?.addEventListener("click", () => next(true));
btnPrev?.addEventListener("click", () => prev(true));

function startAutoplay() {
    if (!slides.length) return;
    stopAutoplay();
    timer = setInterval(() => next(false), AUTOPLAY_MS);
}
function stopAutoplay() {
    if (timer) clearInterval(timer);
    timer = null;
}
function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
}

// Pause autoplay on hover (desktop)
const hero = qs(".hero");
hero?.addEventListener("mouseenter", stopAutoplay);
hero?.addEventListener("mouseleave", startAutoplay);

renderDots();
startAutoplay();

// ==========================
// Contact form -> WhatsApp
// ==========================
const form = qs("#contactForm");
const hint = qs("#formHint");

form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = qs("#name").value.trim();
    const phone = qs("#phone").value.trim();
    const email = qs("#email").value.trim();
    const topic = qs("#topic").value.trim();
    const message = qs("#message").value.trim();

    const text =
        `Hola Latin Terra, deseo una cotización.
- Nombre: ${name || "-"}
- Teléfono: ${phone || "-"}
- Correo: ${email || "-"}
- Tema: ${topic || "-"}
- Mensaje: ${message || "-"}`;

    openWhatsApp(text);
});

qs("#btnCopy")?.addEventListener("click", async () => {
    const name = qs("#name").value.trim();
    const phone = qs("#phone").value.trim();
    const email = qs("#email").value.trim();
    const topic = qs("#topic").value.trim();
    const message = qs("#message").value.trim();

    const text =
        `Hola Latin Terra, deseo una cotización.
- Nombre: ${name || "-"}
- Teléfono: ${phone || "-"}
- Correo: ${email || "-"}
- Tema: ${topic || "-"}
- Mensaje: ${message || "-"}`;

    try {
        await navigator.clipboard.writeText(text);
        hint.textContent = "✅ Mensaje copiado. Ahora puedes pegarlo en WhatsApp.";
    } catch {
        hint.textContent = "No se pudo copiar. Selecciona el texto y copia manualmente.";
    }
    setTimeout(() => {
        hint.textContent = "Al enviar, se abrirá WhatsApp con el texto listo para mandar.";
    }, 3000);
});
