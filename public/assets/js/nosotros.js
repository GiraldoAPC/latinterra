// ==========================
// CONFIG
// ==========================
const WHATSAPP_NUMBER = "51954178081"; // <- cambia por tu número (sin +, sin espacios)
const WHATSAPP_TEXT = "Hola Latin Terra, quisiera cotizar sus productos.";

// Helpers
const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));

function openWhatsApp(text){
  const msg = encodeURIComponent(text || WHATSAPP_TEXT);
  const url = `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${msg}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// Year
qs("#year").textContent = new Date().getFullYear();

// WhatsApp buttons
qs("#btnWhatsTop")?.addEventListener("click", (e) => {
  e.preventDefault();
  openWhatsApp(WHATSAPP_TEXT);
});
qs("#btnWhatsDrawer")?.addEventListener("click", (e) => {
  e.preventDefault();
  openWhatsApp(WHATSAPP_TEXT);
  closeMenu();
});

// Floating WA show after scroll
const waFloat = qs("#waFloat");
window.addEventListener("scroll", () => {
  if(window.scrollY > 320) waFloat.classList.add("show");
  else waFloat.classList.remove("show");
});
waFloat?.addEventListener("click", (e) => {
  e.preventDefault();
  openWhatsApp(WHATSAPP_TEXT);
});

// ==========================
// Mobile menu
// ==========================
const burger = qs("#burger");
const drawer = qs("#drawer");
const drawerClose = qs("#drawerClose");

function closeMenu(){
  document.body.classList.remove("menu-open");
  drawer?.setAttribute("aria-hidden","true");
}
function openMenu(){
  document.body.classList.add("menu-open");
  drawer?.setAttribute("aria-hidden","false");
}

burger?.addEventListener("click", () => {
  document.body.classList.contains("menu-open") ? closeMenu() : openMenu();
});
drawerClose?.addEventListener("click", closeMenu);
drawer?.addEventListener("click", (e) => {
  if(e.target === drawer) closeMenu();
});
qsa("[data-close]").forEach(a => a.addEventListener("click", closeMenu));
window.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeMenu();
});

// ==========================
// Reveal animations on scroll
// ==========================
const reveals = qsa(".reveal");
const observerReveal = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("show");
      observerReveal.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => observerReveal.observe(el));

