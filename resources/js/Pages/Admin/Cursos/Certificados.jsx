import { AdminPageHeader } from '@/Components/Admin/AdminPage';
import { Award as PageIcon } from 'lucide-react';
import { Head, Link } from "@inertiajs/react";
import { useState } from 'react';
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/Components/ui/button";
import CertificateTemplate from "@/Components/Shared/CertificateTemplate";
import CertificateSignatoriesForm from '@/Components/Admin/CertificateSignatoriesForm';

export default function Certificados({ courses = [], certificates, inPersonCertificates }) {
    const [courseId, setCourseId] = useState('');
    const selectedCourse = courses.find((course) => String(course.id) === courseId);
    return <>
        <Head title="Modelo de certificado" />
        <AdminLayout title="Certificados">
            <AdminPageHeader icon={PageIcon} title={<>Modelo de certificado</>} description={<>Configura firmas por curso y revisa la vigencia de los certificados emitidos.</>} className="print:hidden" actions={<>
<Button onClick={() => window.print()}>Imprimir modelo / Guardar PDF</Button>
</>} />
            <section className="mb-8 space-y-4 rounded-xl border bg-white p-5 print:hidden">
                <h2 className="text-lg font-semibold">Firmas del certificado</h2>
                <label className="block text-sm">Curso
                    <select className="mt-1 block w-full rounded-md border p-2" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                        <option value="">Selecciona un curso</option>
                        {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                    </select>
                </label>
                {courses.length === 0 && <p className="text-sm text-muted-foreground">Primero registra un curso para configurar sus firmas.</p>}
                {selectedCourse && <CertificateSignatoriesForm key={`${selectedCourse.id}:${JSON.stringify(selectedCourse.signatories)}`} course={selectedCourse} />}
            </section>
            <CertificateTemplate name="María Fernanda García López" course={selectedCourse?.title ?? 'Seguridad y trabajos en altura · Nivel 1'} signatories={selectedCourse?.signatories}
                code="MODELO-SIN-VALIDEZ" issuedAt="2026-11-03T12:00:00-05:00" expiresAt="2027-11-03T12:00:00-05:00" score={18} status="valid" preview />
            <section className="mt-8 space-y-4 print:hidden">
                <h2 className="text-lg font-semibold">Certificados del aula virtual</h2>
                <p className="text-sm text-muted-foreground">Los avisos aparecen desde 30 días antes del vencimiento. Coordina la recertificación con el estudiante.</p>
                {!certificates?.data?.length && <p className="text-sm text-muted-foreground">Aún no hay certificados emitidos.</p>}
                {certificates?.data?.map((certificate) => <div key={certificate.code} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4">
                    <div><p className="font-semibold">{certificate.student}</p><p className="text-sm">{certificate.course}</p>
                        <p className="text-sm text-muted-foreground">Vence: {certificate.expires_at ? new Date(certificate.expires_at).toLocaleDateString('es-PE') : 'No registrado'}</p>
                        <p className={`text-sm font-medium ${certificate.notice ? 'text-amber-700' : 'text-slate-600'}`}>{certificate.status === 'expired' ? 'Vencido · Coordinar recertificación' : certificate.notice ? 'Próximo a vencer · Coordinar recertificación' : certificate.status === 'valid' ? 'Vigente' : 'Vigencia no disponible'}</p>
                    </div>
                    <a className="text-sm underline" href={`/certificado/verificar/${encodeURIComponent(certificate.code)}`}>Verificar {certificate.code}</a>
                </div>)}
                <div className="flex gap-4">
                    {certificates?.prev_page_url && <Link className="text-sm underline" href={certificates.prev_page_url} preserveScroll>Anterior</Link>}
                    {certificates?.next_page_url && <Link className="text-sm underline" href={certificates.next_page_url} preserveScroll>Siguiente</Link>}
                </div>
            </section>
            <section className="mt-8 space-y-4 print:hidden">
                <h2 className="text-lg font-semibold">Certificados presenciales</h2>
                {!inPersonCertificates?.data?.length && <p className="text-sm text-muted-foreground">Aún no hay certificados presenciales emitidos.</p>}
                {inPersonCertificates?.data?.map((certificate) => <div key={certificate.code} className="flex flex-wrap justify-between gap-3 rounded-lg border bg-white p-4">
                    <div><strong>{certificate.student_name}</strong><p className="text-sm">{certificate.course_title} · {Number(certificate.final_score).toFixed(2)}/20</p>
                        <p className="text-sm">Vence: {new Date(certificate.expires_at).toLocaleDateString('es-PE')}</p>
                        <p className={`text-sm ${certificate.expiring ? 'text-amber-700' : 'text-slate-600'}`}>{certificate.status === 'expired' ? 'Vencido · Coordinar recertificación' : certificate.expiring ? 'Próximo a vencer · Coordinar recertificación' : 'Vigente'}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm"><Link className="underline" href={certificate.print_url}>Ver / Imprimir</Link><a className="underline" href={`/certificado/verificar/${encodeURIComponent(certificate.code)}`}>Verificar {certificate.code}</a></div>
                </div>)}
                <div className="flex gap-4">
                    {inPersonCertificates?.prev_page_url && <Link href={inPersonCertificates.prev_page_url} preserveScroll>Anterior</Link>}
                    {inPersonCertificates?.next_page_url && <Link href={inPersonCertificates.next_page_url} preserveScroll>Siguiente</Link>}
                </div>
            </section>
        </AdminLayout>
    </>;
}
