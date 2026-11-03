import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';

export default function Index({ courses, sessions }) {
    const form = useForm({ course_id: '', title: '', location: '', starts_at: '', capacity: 30, registration_closes_at: '' });
    const inputClass = 'mt-1 block w-full rounded-md border p-2';
    return <>
        <Head title="Capacitaciones presenciales" />
        <AdminLayout title="Capacitaciones presenciales">
            <h1 className="mb-2 text-xl font-semibold">Capacitaciones presenciales</h1>
            <p className="mb-6 text-sm text-muted-foreground">Crea un grupo y comparte su QR para que cada participante complete sus propios datos.</p>
            <form className="mb-8 space-y-4 rounded-xl border bg-white p-5" onSubmit={(event) => { event.preventDefault(); form.post('/admin/cursos/presenciales'); }}>
                <h2 className="font-semibold">Nuevo grupo</h2>
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
                <Button disabled={form.processing || courses.length === 0}>{form.processing ? 'Creando…' : 'Crear grupo y QR'}</Button>
                {courses.length === 0 && <p className="text-sm">Registra primero el curso en «Todos los cursos».</p>}
            </form>
            <h2 className="mb-4 text-lg font-semibold">Grupos registrados</h2>
            {!sessions.data.length && <p className="text-sm text-muted-foreground">Aún no hay grupos presenciales.</p>}
            <div className="space-y-3">{sessions.data.map((session) => <Link key={session.id} href={`/admin/cursos/presenciales/${session.id}`} className="block rounded-lg border bg-white p-4 hover:border-sky-500">
                <strong>{session.title}</strong><p className="text-sm">{session.course.title} · {session.location}</p>
                <p className="text-sm text-muted-foreground">{new Date(session.starts_at).toLocaleString('es-PE', { timeZone: 'America/Lima' })} (Perú) · {session.participants_count}/{session.capacity} participantes</p>
            </Link>)}</div>
            <div className="mt-5 flex gap-4">{sessions.prev_page_url && <Link href={sessions.prev_page_url}>Anterior</Link>}{sessions.next_page_url && <Link href={sessions.next_page_url}>Siguiente</Link>}</div>
        </AdminLayout>
    </>;
}
