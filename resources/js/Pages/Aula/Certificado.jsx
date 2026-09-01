import { Head, Link } from "@inertiajs/react";
import PublicHeader from "@/Components/PublicHeader";
import PublicFooter from "@/Components/PublicFooter";

export default function Certificado({ certificate, enrollment }) {
    const verifyUrl = `${window.location.origin}/certificado/verificar/${certificate.code}`;
    const issuedDate = new Date(certificate.issued_at).toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="catalog-page lt-public beal-page">
            <Head title={`Certificado - ${enrollment.course.title} | Latin Terra`} />

            <link rel="stylesheet" href="/assets/css/nosotros.css" />

            <PublicHeader current="aula" />

            <main className="catalog-main" style={{ paddingTop: "calc(var(--lt-header-h, 88px) + 30px)" }}>
                <div className="container" style={{ maxWidth: 820, margin: "0 auto" }}>
                    <div
                        style={{
                            border: "10px solid var(--lt-green)",
                            borderRadius: 16,
                            padding: "48px 32px",
                            textAlign: "center",
                            background: "#fff",
                            boxShadow: "0 24px 60px rgba(2,6,23,.12)",
                        }}
                        id="certificate-print"
                    >
                        <img src="/assets/img/logo-oficial.png" alt="Latin Terra" style={{ height: 60, margin: "0 auto 20px" }} />
                        <p style={{ letterSpacing: "0.2em", color: "#64748b", fontWeight: 700, fontSize: ".85rem" }}>
                            CERTIFICADO DE FINALIZACION
                        </p>
                        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "18px 0 6px", color: "#0f1b33" }}>
                            {enrollment.user.name}
                        </h1>
                        <p style={{ color: "#475569", margin: "0 0 24px" }}>
                            ha completado satisfactoriamente el curso
                        </p>
                        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--lt-green-2)", margin: "0 0 24px" }}>
                            {enrollment.course.title}
                        </h2>
                        <p style={{ color: "#64748b", fontSize: ".9rem" }}>Emitido el {issuedDate}</p>
                        <p style={{ color: "#94a3b8", fontSize: ".8rem", marginTop: 20 }}>
                            Codigo de verificacion: <strong>{certificate.code}</strong>
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: ".78rem", wordBreak: "break-all" }}>
                            {verifyUrl}
                        </p>
                    </div>

                    <div style={{ textAlign: "center", marginTop: 24, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                        <button className="btn btn-primary" onClick={() => window.print()}>
                            Imprimir / Guardar como PDF
                        </button>
                        <Link className="btn btn-outline" href="/aula-virtual/mis-cursos">
                            Volver a mis cursos
                        </Link>
                    </div>
                </div>
            </main>

            <PublicFooter />

            <style>{`
                @media print {
                    header, footer, .wa-float, .beal-modal-overlay, main .btn, main a.btn { display: none !important; }
                    #certificate-print { box-shadow: none !important; }
                }
            `}</style>
        </div>
    );
}
