import { Link } from '@inertiajs/react';
import { Award, ArrowUpRight, Printer } from 'lucide-react';
import { Surface, EmptyState } from '@/Components/Shared/PageDesign';
import { Button } from '@/Components/ui/button';

export default function CertificateTable({ records, inPerson = false }) {
    return <Surface className="p-4 sm:p-6"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr><th>Estudiante</th><th>Curso</th><th>Código</th><th>Vencimiento</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{records?.data?.map((certificate) => {
        const expiring = inPerson ? certificate.expiring : certificate.notice;
        const expired = certificate.status === 'expired';
        return <tr key={certificate.code}><td className="p-4 font-semibold text-[#024A7D]">{inPerson ? certificate.student_name : certificate.student}</td><td className="p-4">{inPerson ? certificate.course_title : certificate.course}</td><td className="whitespace-nowrap p-4 text-xs text-slate-500">{certificate.code}</td><td className="whitespace-nowrap p-4">{certificate.expires_at ? new Date(certificate.expires_at).toLocaleDateString('es-PE') : 'No registrado'}</td><td className="p-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${expired ? 'bg-red-50 text-red-700' : expiring ? 'bg-amber-50 text-amber-800' : 'bg-sky-50 text-[#024A7D]'}`}>{expired ? 'Vencido' : expiring ? 'Próximo a vencer' : certificate.status === 'valid' ? 'Vigente' : 'Sin vigencia'}</span></td><td className="p-4"><div className="flex gap-2">{certificate.print_url && <Button size="sm" variant="outline" asChild><Link href={certificate.print_url}><Printer />Imprimir</Link></Button>}<Button size="sm" variant="outline" asChild><a href={`/certificado/verificar/${encodeURIComponent(certificate.code)}`}><ArrowUpRight />Verificar</a></Button></div></td></tr>;
    })}</tbody></table></div>{!records?.data?.length && <EmptyState icon={Award} title="Aún no hay certificados emitidos" />}</Surface>;
}
