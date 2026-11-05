import { NativeSelect } from '@/Components/ui/smart-select';
import { AdminPageHeader } from '@/Components/Admin/AdminPage';
import { Award as PageIcon } from 'lucide-react';
import { Head, Link } from "@inertiajs/react";
import { useState } from 'react';
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/Components/ui/button";
import CertificateTemplate from "@/Components/Shared/CertificateTemplate";
import CertificateSignatoriesForm from '@/Components/Admin/CertificateSignatoriesForm';
import CertificateTable from '@/Components/Admin/CertificateTable';
import { FormModal } from '@/Components/Shared/PageDesign';
import { PenLine } from 'lucide-react';

export default function Certificados({ courses = [], certificates, inPersonCertificates }) {
    const [courseId, setCourseId] = useState('');
    const [signaturesOpen, setSignaturesOpen] = useState(false);
    const selectedCourse = courses.find((course) => String(course.id) === courseId);
    return <>
        <Head title="Modelo de certificado" />
        <AdminLayout title="Certificados">
            <AdminPageHeader icon={PageIcon} title={<>Modelo de certificado</>} description={<>Configura firmas por curso y revisa la vigencia de los certificados emitidos.</>} className="print:hidden" actions={<>
<Button onClick={() => window.print()}>Imprimir modelo / Guardar PDF</Button>
</>} />
            <section className="mb-8 space-y-4 rounded-3xl border border-[#024A7D]/10 bg-white p-5 print:hidden">
                <h2 className="text-lg font-semibold">Firmas del certificado</h2>
                <label className="block text-sm">Curso
                    <NativeSelect className="mt-1 block w-full rounded-md border p-2" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                        <option value="">Selecciona un curso</option>
                        {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                    </NativeSelect>
                </label>
                {courses.length === 0 && <p className="text-sm text-muted-foreground">Primero registra un curso para configurar sus firmas.</p>}
                <Button disabled={!selectedCourse} onClick={() => setSignaturesOpen(true)}><PenLine />Configurar firmas</Button>
                {selectedCourse && <Button variant="outline" asChild><Link href={`/admin/cursos/${selectedCourse.id}?step=1`}>Editar contenido y duración</Link></Button>}
                {selectedCourse && <FormModal open={signaturesOpen} onClose={() => setSignaturesOpen(false)} icon={PenLine} title="Firmas del certificado" description={selectedCourse.title}><CertificateSignatoriesForm key={`${selectedCourse.id}:${JSON.stringify(selectedCourse.signatories)}`} course={selectedCourse} /></FormModal>}
            </section>
            <CertificateTemplate name="María Fernanda García López" course={selectedCourse?.title ?? 'Seguridad y trabajos en altura · Nivel 1'} signatories={selectedCourse?.signatories}
                content={selectedCourse?.content} durationHours={selectedCourse?.duration_hours}
                code="MODELO-SIN-VALIDEZ" issuedAt="2026-11-03T12:00:00-05:00" expiresAt="2027-11-03T12:00:00-05:00" score={18} status="valid" preview />
            <section className="mt-8 space-y-4 print:hidden">
                <h2 className="text-lg font-semibold">Certificados del aula virtual</h2>
                <p className="text-sm text-muted-foreground">Los avisos aparecen desde 30 días antes del vencimiento. Coordina la recertificación con el estudiante.</p>
                <CertificateTable records={certificates} />
                <div className="flex gap-4">
                    {certificates?.prev_page_url && <Link className="text-sm underline" href={certificates.prev_page_url} preserveScroll>Anterior</Link>}
                    {certificates?.next_page_url && <Link className="text-sm underline" href={certificates.next_page_url} preserveScroll>Siguiente</Link>}
                </div>
            </section>
            <section className="mt-8 space-y-4 print:hidden">
                <h2 className="text-lg font-semibold">Certificados presenciales</h2>
                <CertificateTable records={inPersonCertificates} inPerson />
                <div className="flex gap-4">
                    {inPersonCertificates?.prev_page_url && <Link href={inPersonCertificates.prev_page_url} preserveScroll>Anterior</Link>}
                    {inPersonCertificates?.next_page_url && <Link href={inPersonCertificates.next_page_url} preserveScroll>Siguiente</Link>}
                </div>
            </section>
        </AdminLayout>
    </>;
}
