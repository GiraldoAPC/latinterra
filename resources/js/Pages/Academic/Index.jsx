import { Head, Link } from '@inertiajs/react';
import AcademicLayout from '@/Layouts/AcademicLayout';
import { PageHeader, Surface, EmptyState } from '@/Components/Shared/PageDesign';
import { GraduationCap, ArrowUpRight } from 'lucide-react';

export default function Index({ courses, canCoordinate }) {
    return <><Head title="Panel académico" /><AcademicLayout>
        <PageHeader icon={GraduationCap} title={canCoordinate ? 'Seguimiento académico' : 'Mis cursos asignados'} description="Consulta el avance de los estudiantes y sus notas por módulo." />
        <Surface className="p-4 sm:p-6">{!courses.data.length ? <EmptyState icon={GraduationCap} title="No hay cursos disponibles" description="Si eres instructor, solicita la asignación al coordinador." /> : <div className="overflow-x-auto"><table className="w-full min-w-[480px] text-left text-sm"><thead><tr><th>Curso</th><th>Estudiantes</th><th>Acciones</th></tr></thead><tbody>{courses.data.map((course) => <tr key={course.id}><td className="p-4 font-semibold text-[#024A7D]">{course.title}</td><td className="p-4">{course.students}</td><td className="p-4"><Link href={`/academico/cursos/${course.id}`} className="inline-flex items-center gap-2 font-medium text-[#024A7D]">Ver seguimiento<ArrowUpRight className="h-4 w-4" /></Link></td></tr>)}</tbody></table></div>}</Surface>
        <div className="mt-5 flex gap-4">{courses.prev_page_url && <Link href={courses.prev_page_url}>Anterior</Link>}{courses.next_page_url && <Link href={courses.next_page_url}>Siguiente</Link>}</div>
    </AcademicLayout></>;
}
