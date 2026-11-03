import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import CertificateTemplate from '@/Components/Shared/CertificateTemplate';

export default function Certificate({ certificate, sessionId }) {
    return <>
        <Head title={`Certificado presencial · ${certificate.student_name}`} />
        <AdminLayout title="Certificado presencial">
            <div className="mb-6 flex flex-wrap gap-3 print:hidden">
                <Button onClick={() => window.print()}>Imprimir / Guardar como PDF</Button>
                <Button variant="outline" asChild><Link href={`/admin/cursos/presenciales/${sessionId}`}>Volver al grupo</Link></Button>
            </div>
            <CertificateTemplate name={certificate.student_name} course={certificate.course_title} code={certificate.code}
                issuedAt={certificate.issued_at} expiresAt={certificate.expires_at} score={certificate.final_score}
                status={certificate.status} signatories={certificate.signatories} documentLabel={certificate.document_label} modality="Capacitación presencial" />
        </AdminLayout>
    </>;
}
