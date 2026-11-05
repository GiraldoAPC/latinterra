import { Head, Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Button } from "@/Components/ui/button";
import CertificateTemplate from "@/Components/Shared/CertificateTemplate";

export default function Certificado({ certificate, enrollment, validity, signatories, courseDetails }) {
    return <>
        <Head title={`Certificado - ${enrollment.course.title}`} />
        <StudentLayout>
            <CertificateTemplate name={[enrollment.user.name, enrollment.user.last_name].filter(Boolean).join(' ')} course={courseDetails?.title ?? enrollment.course.title} code={certificate.code} issuedAt={certificate.issued_at}
                expiresAt={validity.expires_at} status={validity.status} score={certificate.final_score} signatories={signatories}
                documentLabel={enrollment.user.dni ? `${(enrollment.user.document_type ?? 'DNI').toUpperCase()} N.º ${enrollment.user.dni}` : null}
                content={courseDetails?.content} durationHours={courseDetails?.duration_hours} modality="Capacitación virtual" />
            <div className="mt-6 flex flex-wrap justify-center gap-2 print:hidden">
                <Button onClick={() => window.print()}>Imprimir / Guardar como PDF</Button>
                <Button variant="outline" asChild><Link href="/aula-virtual/mis-cursos">Volver a mis cursos</Link></Button>
            </div>
        </StudentLayout>
    </>;
}
