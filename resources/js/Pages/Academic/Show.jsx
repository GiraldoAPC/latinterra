import { Head, Link, useForm } from '@inertiajs/react';
import AcademicLayout from '@/Layouts/AcademicLayout';
import { Button } from '@/Components/ui/button';
import { useState } from 'react';
import { PageHeader, Surface, FormModal, EmptyState } from '@/Components/Shared/PageDesign';
import { GraduationCap, UserRoundCog, Users } from 'lucide-react';

export default function Show({ course, enrollments, canCoordinate, assignedIds, instructors }) {
    const form = useForm({ instructor_ids: assignedIds });
    const [assigning, setAssigning] = useState(false);
    return <><Head title={`Seguimiento · ${course.title}`} /><AcademicLayout>
        <Link href="/academico" className="text-sm underline">Volver a cursos</Link>
        <PageHeader className="mt-4" icon={GraduationCap} title={course.title} description={course.summary ?? 'Seguimiento de estudiantes y notas por módulo.'} actions={canCoordinate && <Button onClick={() => setAssigning(true)}><UserRoundCog />Asignar instructores</Button>} />
        {canCoordinate && <FormModal open={assigning} onClose={() => setAssigning(false)} processing={form.processing} icon={UserRoundCog} title="Instructores del curso" description={course.title}><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); form.put(`/academico/cursos/${course.id}/instructores`, { preserveScroll: true, onSuccess: () => setAssigning(false) }); }}>
            <h2 className="font-semibold">Instructores del curso</h2>
            {!instructors.length && <p className="text-sm text-slate-600">No hay cuentas de instructor activas. Solicita su creación a administración.</p>}
            {instructors.map((instructor) => <label key={instructor.id} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.data.instructor_ids.includes(instructor.id)} onChange={(event) => form.setData('instructor_ids', event.target.checked ? [...form.data.instructor_ids, instructor.id] : form.data.instructor_ids.filter((id) => id !== instructor.id))} />{instructor.name}</label>)}
            {Object.entries(form.errors).map(([key, message]) => <p key={key} role="alert" className="text-sm text-red-700">{message}</p>)}
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={form.processing} onClick={() => setAssigning(false)}>Cancelar</Button><Button disabled={form.processing}>Guardar asignación</Button></div>
            {form.recentlySuccessful && <p role="status" className="text-sm text-green-700">Asignación guardada.</p>}
        </form></FormModal>}
        <h2 className="mb-4 mt-6 text-lg font-semibold">Estudiantes y avance</h2>
        <Surface className="p-4 sm:p-6">{!enrollments.data.length ? <EmptyState icon={Users} title="No hay estudiantes inscritos" /> : <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr><th>Estudiante</th><th>Avance</th><th>Notas por módulo</th></tr></thead><tbody>{enrollments.data.map((enrollment) => <tr key={enrollment.id}><td className="p-4 font-semibold text-[#024A7D]">{enrollment.name}</td><td className="min-w-36 p-4"><span className="text-sm font-medium">{enrollment.progress}%</span><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sky-50"><div className="h-full rounded-full bg-gradient-to-r from-[#00ADEE] to-[#024A7D]" style={{ width: `${enrollment.progress}%` }} /></div></td><td className="p-4">{enrollment.module_scores.map((module, index) => <p key={index} className="py-1 text-sm text-slate-500">{module.title}: <strong className="text-[#024A7D]">{module.score == null ? 'Sin intento' : `${Number(module.score).toFixed(2)} / 20`}</strong></p>)}</td></tr>)}</tbody></table></div>}</Surface>
        <div className="mt-5 flex gap-4">{enrollments.prev_page_url && <Link href={enrollments.prev_page_url}>Anterior</Link>}{enrollments.next_page_url && <Link href={enrollments.next_page_url}>Siguiente</Link>}</div>
    </AcademicLayout></>;
}
