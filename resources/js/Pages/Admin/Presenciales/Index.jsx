import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { useState } from 'react';
import { Users, Plus, Eye } from 'lucide-react';
import { AdminPageHeader, AdminPanel, AdminFormModal } from '@/Components/Admin/AdminPage';

export default function Index({ courses, sessions }) {
    const [creating, setCreating] = useState(false);
    const form = useForm({ course_id: '', title: '', location: '', starts_at: '', capacity: 30, registration_closes_at: '' });
    const inputClass = 'mt-1 block w-full rounded-md border p-2';
    return <>
        <Head title="Capacitaciones presenciales" />
        <AdminLayout title="Capacitaciones presenciales">
            <AdminPageHeader icon={Users} title="Capacitaciones presenciales" description="Gestiona grupos, participantes y registros mediante QR." actions={<Button onClick={() => setCreating(true)}><Plus />Nuevo grupo</Button>} />
            <AdminFormModal open={creating} onClose={() => setCreating(false)} processing={form.processing} icon={Users} title="Nuevo grupo presencial" description="Crea un grupo y comparte su QR para que cada participante complete sus propios datos.">
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); form.post('/admin/cursos/presenciales', { onSuccess: () => setCreating(false) }); }}>
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm">Curso<select required className={inputClass} value={form.data.course_id} onChange={(event) => form.setData('course_id', event.target.value)}>
                        <option value="">Selecciona un curso</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                    </select></label>
                    <label className="text-sm">Nombre del grupo<input required maxLength={255} className={inputClass} value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} placeholder="Capacitación empresa · Grupo 1" /></label>
                    <label className="text-sm">Lugar<input required maxLength={255} className={inputClass} value={form.data.location} onChange={(event) => form.setData('location', event.target.value)} /></label>
                    <label className="text-sm">Fecha y hora de capacitación (Perú)<input required type="datetime-local" className={inputClass} value={form.data.starts_at} onChange={(event) => form.setData('starts_at', event.target.value)} /></label>
                    <label className="text-sm">Cupo de participantes<input required type="number" min={1} max={1000} className={inputClass} value={form.data.capacity} onChange={(event) => form.setData('capacity', event.target.value)} /></label>
                    <label className="text-sm">Cierre de registro (Perú, opcional)<input type="datetime-local" className={inputClass} value={form.data.registration_closes_at} onChange={(event) => form.setData('registration_closes_at', event.target.value)} /></label>
                </div>
                <p className="text-xs text-muted-foreground">Sin fecha de cierre, el registro permanece abierto hasta completar el cupo o cerrarlo manualmente.</p>
                {Object.entries(form.errors).map(([field, message]) => <p key={field} role="alert" className="text-sm text-red-700">{message}</p>)}
                <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={form.processing} onClick={() => setCreating(false)}>Cancelar</Button><Button disabled={form.processing || courses.length === 0}>{form.processing ? 'Creando…' : 'Crear grupo y QR'}</Button></div>
                {courses.length === 0 && <p className="text-sm">Registra primero el curso en «Todos los cursos».</p>}
            </form>
            </AdminFormModal>
            <AdminPanel className="p-4 sm:p-6"><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead><tr><th>Grupo</th><th>Curso</th><th>Lugar</th><th>Fecha (Perú)</th><th>Participantes</th><th>Acciones</th></tr></thead><tbody>{sessions.data.map((session) => <tr key={session.id}><td className="p-4 font-semibold text-[#024A7D]">{session.title}</td><td className="p-4">{session.course.title}</td><td className="p-4">{session.location}</td><td className="whitespace-nowrap p-4">{new Date(session.starts_at).toLocaleString('es-PE', { timeZone: 'America/Lima' })}</td><td className="p-4">{session.participants_count}/{session.capacity}</td><td className="p-4"><Button variant="outline" size="sm" asChild><Link href={`/admin/cursos/presenciales/${session.id}`}><Eye />Ver grupo</Link></Button></td></tr>)}</tbody></table></div>
            {!sessions.data.length && <div className="py-12 text-center"><Users className="mx-auto mb-3 h-10 w-10 text-[#00ADEE]" /><p className="font-semibold text-[#024A7D]">Aún no hay grupos presenciales</p><Button className="mt-4" onClick={() => setCreating(true)}><Plus />Nuevo grupo</Button></div>}
            </AdminPanel>
            <div className="mt-5 flex gap-4">{sessions.prev_page_url && <Link href={sessions.prev_page_url}>Anterior</Link>}{sessions.next_page_url && <Link href={sessions.next_page_url}>Siguiente</Link>}</div>
        </AdminLayout>
    </>;
}
