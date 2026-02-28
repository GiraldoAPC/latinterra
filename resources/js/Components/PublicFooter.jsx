export default function PublicFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer mt-auto">
            <div className="footer-pro-main">
                <div className="container footer-pro-inner">
                    <div className="footer-pro-brand">
                        <div className="footer-pro-brand-card">
                            <img src="/assets/img/logo.png" alt="Latin Terra" />
                        </div>
                    </div>

                    <div className="footer-pro-contact">
                        <h4>Contáctanos</h4>
                        <div className="footer-pro-contact-list">
                            <a href="https://wa.me/51954178081" target="_blank" rel="noreferrer">
                                <i className="fa-brands fa-whatsapp" aria-hidden="true" />
                                +51 954 178 081
                            </a>
                            <a href="mailto:ventas@latin-terra.com">
                                <i className="fa-regular fa-envelope" aria-hidden="true" />
                                ventas@latin-terra.com
                            </a>
                        </div>
                    </div>

                    <div className="footer-pro-social">
                        <h4>Síguenos</h4>
                        <div className="footer-pro-social-links">
                            <a href="https://www.facebook.com/share/1BnVinCAXH/" target="_blank" rel="noreferrer" aria-label="Facebook">
                                <i className="fa-brands fa-facebook-f" aria-hidden="true" />
                            </a>
                            <a href="https://www.instagram.com/latin_.terra?igsh=bTVkMWo2a3BxZGg3" target="_blank" rel="noreferrer" aria-label="Instagram">
                                <i className="fa-brands fa-instagram" aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-pro-bar">
                <div className="container footer-pro-bar-inner">
                    <span>&copy; {year} Latin Terra | Todos los derechos reservados</span>
                    <span>Diseño web Latin Terra</span>
                </div>
            </div>
        </footer>
    );
}
