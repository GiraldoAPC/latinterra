import { Head, Link } from '@inertiajs/react';
import AcademicLayout from '@/Layouts/AcademicLayout';

export default function Index({ courses, canCoordinate }) {
    return <><Head title="Panel académico" /><AcademicLayout>
        <h1 className="mb-2 text-2xl font-bold text-[#024A7D]">{canCoordinate ? 'Seguimiento académico' : 'Mis cursos asignados'}</h1>
        <p className="mb-6 text-sm text-slate-600">Consulta el avance de los estudiantes y sus notas por módulo.</p>
        {!courses.data.length && <p className="rounded-lg border bg-white p-6">No hay cursos disponibles. Si eres instructor, solicita la asignación al coordinador.</p>}
        <div className="grid gap-4 sm:grid-cols-2">{courses.data.map((course) => <Link key={course.id} href={`/academico/cursos/${course.id}`} className="rounded-xl border bg-white p-5 hover:border-sky-500"><h2 className="font-semibold">{course.title}</h2><p className="mt-2 text-sm text-slate-600">{course.students} estudiantes</p></Link>)}</div>
        <div className="mt-5 flex gap-4">{courses.prev_page_url && <Link href={courses.prev_page_url}>Anterior</Link>}{courses.next_page_url && <Link href={courses.next_page_url}>Siguiente</Link>}</div>
    </AcademicLayout></>;
}
