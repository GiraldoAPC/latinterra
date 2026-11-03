import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/Components/ui/button";
import CertificateTemplate from "@/Components/Shared/CertificateTemplate";

export default function Certificados() {
    return <>
        <Head title="Modelo de certificado" />
        <AdminLayout title="Certificados">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
                <div><h1 className="text-xl font-semibold">Modelo de certificado</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Vista previa con datos de ejemplo. Los certificados emitidos incluyen nota, vigencia anual y QR. Pendiente configurar firmas reales.</p></div>
                <Button onClick={() => window.print()}>Imprimir modelo / Guardar PDF</Button>
            </div>
            <CertificateTemplate name="María Fernanda García López" course="Seguridad y trabajos en altura · Nivel 1" code="MODELO-SIN-VALIDEZ" issuedAt="2026-11-03T12:00:00-05:00" expiresAt="2027-11-03T12:00:00-05:00" score={18} status="valid" preview />
        </AdminLayout>
    </>;
}
