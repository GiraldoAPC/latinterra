import { Head, Link, useForm } from '@inertiajs/react';
import AcademicLayout from '@/Layouts/AcademicLayout';
import { Button } from '@/Components/ui/button';

export default function Show({ course, enrollments, canCoordinate, assignedIds, instructors }) {
    const form = useForm({ instructor_ids: assignedIds });
    return <><Head title={`Seguimiento · ${course.title}`} /><AcademicLayout>
        <Link href="/academico" className="text-sm underline">Volver a cursos</Link>
        <h1 className="mt-4 text-2xl font-bold text-[#024A7D]">{course.title}</h1>
        {course.summary && <p className="mt-2 text-sm text-slate-600">{course.summary}</p>}
        {canCoordinate && <form className="my-6 space-y-3 rounded-xl border bg-white p-5" onSubmit={(event) => { event.preventDefault(); form.put(`/academico/cursos/${course.id}/instructores`, { preserveScroll: true }); }}>
            <h2 className="font-semibold">Instructores del curso</h2>
            {!instructors.length && <p className="text-sm text-slate-600">No hay cuentas de instructor activas. Solicita su creación a administración.</p>}
            {instructors.map((instructor) => <label key={instructor.id} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.data.instructor_ids.includes(instructor.id)} onChange={(event) => form.setData('instructor_ids', event.target.checked ? [...form.data.instructor_ids, instructor.id] : form.data.instructor_ids.filter((id) => id !== instructor.id))} />{instructor.name}</label>)}
            {Object.entries(form.errors).map(([key, message]) => <p key={key} role="alert" className="text-sm text-red-700">{message}</p>)}
            <Button disabled={form.processing}>Guardar asignación</Button>
            {form.recentlySuccessful && <p role="status" className="text-sm text-green-700">Asignación guardada.</p>}
        </form>}
        <h2 className="mb-4 mt-6 text-lg font-semibold">Estudiantes y avance</h2>
        {!enrollments.data.length && <p className="text-sm text-slate-600">No hay estudiantes inscritos.</p>}
        <div className="space-y-3">{enrollments.data.map((enrollment) => <div key={enrollment.id} className="rounded-lg border bg-white p-4"><strong>{enrollment.name}</strong><p className="mt-1 text-sm">Avance de clases: {enrollment.progress}%</p>
            {enrollment.module_scores.map((module, i) => <p key={i} className="mt-1 text-sm text-slate-600">{module.title}: {module.score == null ? 'Sin intento' : `${Number(module.score).toFixed(2)} / 20`}</p>)}
        </div>)}</div>
        <div className="mt-5 flex gap-4">{enrollments.prev_page_url && <Link href={enrollments.prev_page_url}>Anterior</Link>}{enrollments.next_page_url && <Link href={enrollments.next_page_url}>Siguiente</Link>}</div>
    </AcademicLayout></>;
}
