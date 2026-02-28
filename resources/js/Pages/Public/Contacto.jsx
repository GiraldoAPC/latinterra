import { Head } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

const WHATSAPP_PHONE = "51954178081";
const WHATSAPP_BASE_TEXT = "Hola Latin Terra, deseo una cotizacion.";
const WHATSAPP_WEB_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_BASE_TEXT)}`;
const RECAPTCHA_SITE_KEY = "6LfZDHosAAAAAPEGIEgAcW-DwG-HB5eIv0AJ7A_q";

async function getRecaptchaToken() {
    if (!RECAPTCHA_SITE_KEY) return "";
    if (!window.grecaptcha?.enterprise?.execute) return "";

    try {
        return await new Promise((resolve) => {
            window.grecaptcha.enterprise.ready(async () => {
                const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, {
                    action: "CONTACTO",
                });
                resolve(token || "");
            });
        });
    } catch {
        return "";
    }
}

export default function Contacto() {
    const [isSending, setIsSending] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        window.setTimeout(() => {
            setToast((prev) => (prev?.message === message ? null : prev));
        }, 2600);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);
        setErrors({});
        setSuccessMessage("");

        const form = e.currentTarget;
        const formData = new FormData(form);
        const recaptchaToken = await getRecaptchaToken();

        const payload = {
            name: (formData.get("name") || "").toString().trim(),
            phone: (formData.get("phone") || "").toString().trim(),
            email: (formData.get("email") || "").toString().trim(),
            company: (formData.get("company") || "").toString().trim(),
            segment: (formData.get("segment") || "").toString().trim(),
            topic: (formData.get("topic") || "").toString().trim(),
            message: (formData.get("message") || "").toString().trim(),
            recaptcha_token: recaptchaToken,
        };

        try {
            const { data } = await axios.post("/contacto/enviar", payload, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });

            setSuccessMessage(data?.message || "Mensaje enviado correctamente.");
            showToast(data?.message || "Mensaje enviado correctamente.", "success");
            form.reset();
        } catch (error) {
            const backendErrors = error?.response?.data?.errors || {};
            setErrors(backendErrors);
            showToast("No se pudo enviar el formulario.", "error");
        } finally {
            setIsSending(false);
        }
    };

    const fieldError = (name) => errors?.[name]?.[0];

    return (
        <>
            <Head title="Contacto | Latin Terra" />
            <meta
                name="description"
                content="Contacta a Latin Terra para cotizaciones de EPP, herramientas, equipo electrico, ferreteria y soluciones industriales."
            />
            <link rel="stylesheet" href="/assets/css/nosotros.css" />
            <link rel="stylesheet" href="/assets/css/Productos.css" />
            <script defer src="/assets/js/nosotros.js"></script>

            <div className="lt-public">
                <PublicHeader current="contact" whatsappHref={WHATSAPP_WEB_URL} />

                <section className="catalog-hero" aria-label="Encabezado Contacto">
                    <div
                        className="catalog-hero__bg"
                        style={{ backgroundImage: "url('/assets/img/encabezado/contactenos.jpg')" }}
                    />
                    <div className="catalog-hero__overlay" />
                    <div className="catalog-hero__content">
                        <div className="catalog-hero__icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M4 4h16v12H6l-2 2V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                                <path d="M8 8h8M8 11h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h1 className="catalog-hero__title">Contacto</h1>
                        <p className="catalog-hero__subtitle">
                            Cotizaciones, consultas comerciales y atencion para proyectos industriales
                        </p>
                        <p className="catalog-hero__crumb">
                            <a href="/">INICIO</a> / CONTACTO
                        </p>
                    </div>
                    <div className="catalog-hero__curve" aria-hidden="true" />
                </section>

                <main className="page contact-page-lt">
                    <section className="contact-page-lt__section">
                        <div className="container">
                            <div className="contact-page-lt__intro reveal">
                                <div>
                                    <span className="contact-page-lt__kicker">CONTACTO COMERCIAL</span>
                                    <h2>Solicita informacion o cotizacion</h2>
                                </div>

                                <div className="contact-page-lt__intro-card">
                                    <div className="contact-page-lt__intro-item">
                                        <span className="bullet" />
                                        <div>
                                            <b>Respuesta comercial</b>
                                            <p>Atencion para cotizaciones, marcas y categorias</p>
                                        </div>
                                    </div>
                                    <div className="contact-page-lt__intro-item">
                                        <span className="bullet" />
                                        <div>
                                            <b>Horario</b>
                                            <p>Lun-Sab: 8:00 a.m. - 6:00 p.m.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="contact-page-lt__grid">
                                <form
                                    id="contactFormPage"
                                    className="contact-page-lt__form reveal"
                                    onSubmit={handleSubmit}
                                    noValidate
                                >
                                    <div className="contact-page-lt__form-head">
                                        <h3>Formulario de cotizacion</h3>
                                    </div>

                                    <div className="contact-page-lt__row">
                                        <div>
                                            <label htmlFor="name">Nombres y apellidos</label>
                                            <input id="name" name="name" placeholder="Tu nombre completo" required />
                                            {fieldError("name") ? <small className="contact-page-lt__error">{fieldError("name")}</small> : null}
                                        </div>
                                        <div>
                                            <label htmlFor="phone">Telefono</label>
                                            <input id="phone" name="phone" placeholder="+51 999 999 999" />
                                            {fieldError("phone") ? <small className="contact-page-lt__error">{fieldError("phone")}</small> : null}
                                        </div>
                                    </div>

                                    <div className="contact-page-lt__row">
                                        <div>
                                            <label htmlFor="email">Correo</label>
                                            <input id="email" name="email" type="email" placeholder="correo@empresa.com" />
                                            {fieldError("email") ? <small className="contact-page-lt__error">{fieldError("email")}</small> : null}
                                        </div>
                                        <div>
                                            <label htmlFor="company">Empresa</label>
                                            <input id="company" name="company" placeholder="Empresa (opcional)" />
                                            {fieldError("company") ? <small className="contact-page-lt__error">{fieldError("company")}</small> : null}
                                        </div>
                                    </div>

                                    <div className="contact-page-lt__row">
                                        <div>
                                            <label htmlFor="segment">Segmento</label>
                                            <select id="segment" name="segment" defaultValue="">
                                                <option value="">Selecciona un segmento</option>
                                                <option>Industria</option>
                                                <option>Construccion</option>
                                                <option>Mineria</option>
                                                <option>Mantenimiento</option>
                                                <option>Comercio</option>
                                                <option>Otro</option>
                                            </select>
                                            {fieldError("segment") ? <small className="contact-page-lt__error">{fieldError("segment")}</small> : null}
                                        </div>
                                        <div>
                                            <label htmlFor="topic">Linea de producto</label>
                                            <select id="topic" name="topic" defaultValue="">
                                                <option value="">Selecciona una categoria</option>
                                                <option>Acceso por Cuerdas</option>
                                                <option>EPP y Seguridad</option>
                                                <option>Articulos de Ferreteria</option>
                                                <option>Herramientas</option>
                                                <option>Equipo Electrico</option>
                                                <option>Reparacion de Palas</option>
                                                <option>Catalogo General</option>
                                            </select>
                                            {fieldError("topic") ? <small className="contact-page-lt__error">{fieldError("topic")}</small> : null}
                                        </div>
                                    </div>

                                    <div className="contact-page-lt__field">
                                        <label htmlFor="message">Detalle del requerimiento</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            placeholder="Ejemplo: Necesito cotizacion de EPP para 20 personas, con entrega en Huaraz..."
                                            required
                                        />
                                        {fieldError("message") ? <small className="contact-page-lt__error">{fieldError("message")}</small> : null}
                                    </div>

                                    {fieldError("recaptcha_token") ? (
                                        <small className="contact-page-lt__error">{fieldError("recaptcha_token")}</small>
                                    ) : null}

                                    <div className="contact-page-lt__actions">
                                        <button type="submit" className="btn btn-primary" disabled={isSending}>
                                            {isSending ? "Enviando..." : "Enviar al correo"}
                                        </button>
                                    </div>

                                    {successMessage ? (
                                        <div className="contact-page-lt__success">{successMessage}</div>
                                    ) : null}
                                </form>

                                <aside className="contact-page-lt__side reveal" style={{ transitionDelay: ".06s" }}>
                                    <div className="contact-page-lt__panel contact-page-lt__panel--highlight">
                                        <div className="contact-page-lt__badge">LT</div>
                                        <div>
                                            <h3>Oficina principal</h3>
                                            <div className="contact-page-lt__links">
                                                <a href={WHATSAPP_WEB_URL} target="_blank" rel="noreferrer">
                                                    +51 954 178 081
                                                </a>
                                                <a href="mailto:ventas@latin-terra.com">
                                                    ventas@latin-terra.com
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="contact-page-lt__panel">
                                        <h4>Canales de atencion</h4>
                                        <div className="contact-page-lt__info-item">
                                            <span className="ico">WA</span>
                                            <div>
                                                <b>WhatsApp</b>
                                                <span>Consultas y cotizaciones con respuesta rapida</span>
                                            </div>
                                        </div>
                                        <div className="contact-page-lt__info-item">
                                            <span className="ico">EM</span>
                                            <div>
                                                <b>Correo ventas</b>
                                                <span>Envio de listas, fichas tecnicas y requerimientos</span>
                                            </div>
                                        </div>
                                        <div className="contact-page-lt__info-item">
                                            <span className="ico">HR</span>
                                            <div>
                                                <b>Horario</b>
                                                <span>Lun-Sab: 8:00 a.m. - 6:00 p.m.</span>
                                            </div>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </div>
                    </section>

                </main>

                <PublicFooter />

                {toast ? (
                    <div
                        className={`contact-page-lt__toast contact-page-lt__toast--${toast.type}`}
                        role="status"
                        aria-live="polite"
                    >
                        {toast.message}
                    </div>
                ) : null}

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
        </>
    );
}
