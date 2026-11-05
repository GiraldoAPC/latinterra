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
                            <i className={`fa-solid ${certificate.status === 'valid' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} style={{ fontSize: 48, color: certificate.status === 'valid' ? 'var(--lt-green)' : '#b45309' }} aria-hidden="true" />
                            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "16px 0 6px" }}>
                                {certificate.status === 'valid' ? 'Certificado vigente' : certificate.status === 'expired' ? 'Certificado vencido' : 'Vigencia no disponible'}
                            </h1>
                            <p style={{ color: "#64748b", marginBottom: 24 }}>
                                Certificado emitido por Acceso Vertical Perú.
                                {certificate.status === 'expired' && ' Su vigencia ha terminado; consulta con administración para recertificarte.'}
                            </p>

                            <div className="beal-modal__specs" style={{ display: "block", padding: 20, textAlign: "left" }}>
                                <div className="beal-modal__spec">
                                    <i className="fa-solid fa-user" aria-hidden="true" />
                                    <span>Alumno</span>
                                    <strong>{certificate.student_name}</strong>
                                </div>
                                <div className="beal-modal__spec">
                                    <i className="fa-solid fa-graduation-cap" aria-hidden="true" />
                                    <span>Curso</span>
                                    <strong>{certificate.course_title}</strong>
                                </div>
                                {certificate.modality && <div className="beal-modal__spec"><span>Modalidad</span><strong>{certificate.modality}</strong></div>}
                                <div className="beal-modal__spec"><span>Duración</span><strong>{certificate.duration_hours ? `${Number(certificate.duration_hours).toLocaleString('es-PE')} horas` : 'No registrada'}</strong></div>
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
                                    <span>Vencimiento</span>
                                    <strong>{certificate.expires_at ? new Date(certificate.expires_at).toLocaleDateString('es-PE') : 'No registrado'}</strong>
                                </div>
                                <div className="beal-modal__spec">
                                    <span>Nota obtenida</span>
                                    <strong>{certificate.final_score == null ? 'No registrada' : `${Number(certificate.final_score).toFixed(2)} / 20`}</strong>
                                </div>
                                <div className="beal-modal__spec">
                                    <i className="fa-solid fa-hashtag" aria-hidden="true" />
                                    <span>Codigo</span>
                                    <strong>{certificate.code}</strong>
                                </div>
                                {certificate.course_content && <div style={{ marginTop: 20, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Contenido del curso</h2>
                                    <p style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.7, overflowWrap: 'anywhere' }}>{certificate.course_content}</p>
                                </div>}
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
