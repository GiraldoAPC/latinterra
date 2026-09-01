import { Head, Link } from "@inertiajs/react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

export default function VerificarCertificado({ certificate, code }) {
    return (
        <div className="catalog-page lt-public beal-page">
            <Head title="Verificar Certificado | Latin Terra" />

            <link rel="stylesheet" href="/assets/css/nosotros.css" />

            <PublicHeader current="aula" />

            <main className="catalog-main" style={{ paddingTop: "calc(var(--lt-header-h, 88px) + 40px)" }}>
                <div className="container" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
                    {certificate ? (
                        <>
                            <i className="fa-solid fa-circle-check" style={{ fontSize: 48, color: "var(--lt-green)" }} aria-hidden="true" />
                            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "16px 0 6px" }}>
                                Certificado valido
                            </h1>
                            <p style={{ color: "#64748b", marginBottom: 24 }}>
                                Este certificado fue emitido por Latin Terra y es autentico.
                            </p>

                            <div className="beal-modal__specs" style={{ display: "block", padding: 20, textAlign: "left" }}>
                                <div className="beal-modal__spec">
                                    <i className="fa-solid fa-user" aria-hidden="true" />
                                    <span>Alumno</span>
                                    <strong>{certificate.enrollment.user.name}</strong>
                                </div>
                                <div className="beal-modal__spec">
                                    <i className="fa-solid fa-graduation-cap" aria-hidden="true" />
                                    <span>Curso</span>
                                    <strong>{certificate.enrollment.course.title}</strong>
                                </div>
                                <div className="beal-modal__spec">
                                    <i className="fa-solid fa-calendar" aria-hidden="true" />
                                    <span>Emitido</span>
                                    <strong>
                                        {new Date(certificate.issued_at).toLocaleDateString("es-PE", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </strong>
                                </div>
                                <div className="beal-modal__spec">
                                    <i className="fa-solid fa-hashtag" aria-hidden="true" />
                                    <span>Codigo</span>
                                    <strong>{certificate.code}</strong>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-circle-xmark" style={{ fontSize: 48, color: "#ef4444" }} aria-hidden="true" />
                            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "16px 0 6px" }}>
                                Certificado no encontrado
                            </h1>
                            <p style={{ color: "#64748b" }}>
                                El codigo <strong>{code}</strong> no corresponde a ningun certificado emitido por Latin Terra.
                            </p>
                        </>
                    )}

                    <Link className="btn btn-primary" href="/aula" style={{ marginTop: 28 }}>
                        Ver catalogo de cursos
                    </Link>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
