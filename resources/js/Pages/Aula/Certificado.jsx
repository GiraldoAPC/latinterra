import { Head, Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Button } from "@/Components/ui/button";
import CertificateTemplate from "@/Components/Shared/CertificateTemplate";

export default function Certificado({ certificate, enrollment, validity }) {
    return <>
        <Head title={`Certificado - ${enrollment.course.title}`} />
        <StudentLayout>
            <CertificateTemplate name={enrollment.user.name} course={enrollment.course.title} code={certificate.code} issuedAt={certificate.issued_at}
                expiresAt={validity.expires_at} status={validity.status} score={certificate.final_score} />
            <div className="mt-6 flex flex-wrap justify-center gap-2 print:hidden">
                <Button onClick={() => window.print()}>Imprimir / Guardar como PDF</Button>
                <Button variant="outline" asChild><Link href="/aula-virtual/mis-cursos">Volver a mis cursos</Link></Button>
            </div>
        </StudentLayout>
    </>;
}
