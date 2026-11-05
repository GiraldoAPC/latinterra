import { PageHeader } from '@/Components/Shared/PageDesign';
import { Users as DesignIcon } from 'lucide-react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import RegistrationQr from '@/Components/Shared/RegistrationQr';
import { useState } from 'react';
import InPersonParticipantEditor from '@/Components/Admin/InPersonParticipantEditor';
import InPersonAssessmentForm from '@/Components/Admin/InPersonAssessmentForm';

export default function Show({ session, participants }) {
    const [editingParticipant, setEditingParticipant] = useState(null);
    const form = useForm({ registration_open: !session.registration_open });
    const url = `${window.location.origin}/presencial/registro/${session.registration_token}`;
    const expired = session.registration_closes_at && new Date(session.registration_closes_at) <= new Date();
    const status = !session.registration_open || expired ? 'Registro cerrado' : session.participants_count >= session.capacity ? 'Cupo completo' : 'Registro abierto';
    return <>
        <Head title={session.title} />
        <AdminLayout title="Grupo presencial">
                <PageHeader icon={DesignIcon} title={session.title} description={`${session.course.title} · ${session.location}`} />
            <Link href="/admin/cursos/presenciales" className="text-sm underline">Volver a grupos</Link>
            <p className="mt-1 text-sm">{session.course.title} · {session.location}</p>
            <p className="text-sm">{new Date(session.starts_at).toLocaleString('es-PE', { timeZone: 'America/Lima' })} (Perú)</p>
            <div className="my-6 grid gap-5 rounded-xl border bg-white p-5 md:grid-cols-[auto_1fr]">
                <RegistrationQr url={url} />
                <div className="space-y-3">
                    <h2 className="font-semibold">{status} · {session.participants_count}/{session.capacity} participantes</h2>
                    <p className="text-sm text-muted-foreground">Comparte el QR o enlace con este grupo. Sirve para llenar la lista de participantes; no crea cuentas ni emite certificados.</p>
                    <label className="block text-sm">Enlace de registro<input aria-label="Enlace de registro del grupo" readOnly value={url} onFocus={(event) => event.target.select()} className="mt-1 block w-full rounded-md border p-2 text-xs" /></label>
                    <a href={url} target="_blank" rel="noreferrer" className="block text-sm underline">Abrir formulario de registro</a>
                    {session.registration_closes_at && <p className="text-sm">Cierre: {new Date(session.registration_closes_at).toLocaleString('es-PE', { timeZone: 'America/Lima' })} (Perú)</p>}
                    <Button disabled={form.processing || (!session.registration_open && expired)} variant="outline" onClick={() => {
                        form.transform(() => ({ registration_open: !session.registration_open }));
                        form.post(`/admin/cursos/presenciales/${session.id}/registro`, { preserveScroll: true });
                    }}>{session.registration_open ? 'Cerrar registro' : 'Reabrir registro'}</Button>
                    {Object.entries(form.errors).map(([field, message]) => <p key={field} role="alert" className="text-sm text-red-700">{message}</p>)}
                </div>
            </div>
            <h2 className="mb-3 text-lg font-semibold">Participantes registrados</h2>
            <p className="mb-4 text-sm text-muted-foreground">Para certificar, guarda la nota mínima de 13/20 y confirma la asistencia. La capacitación debe haber comenzado y el curso debe tener sus firmas configuradas. <Link className="underline" href="/admin/cursos/certificados">Configurar firmas</Link></p>
            {editingParticipant && <InPersonParticipantEditor key={editingParticipant.id} sessionId={session.id} participant={editingParticipant} onClose={() => setEditingParticipant(null)} />}
            {!participants.data.length ? <p className="text-sm text-muted-foreground">El grupo todavía no tiene participantes.</p> : <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Participante</th><th className="p-3">Documento</th><th className="p-3">Contacto</th><th className="p-3">Evaluación y certificado</th><th className="p-3">Acciones</th></tr></thead>
                    <tbody>{participants.data.map((participant) => <tr key={participant.id} className="border-b last:border-0">
                        <td className="p-3">{participant.last_name}, {participant.name}</td><td className="p-3">{participant.document_type.toUpperCase()} {participant.document_number}</td>
                        <td className="p-3"><div>{participant.email || 'Sin correo'}</div><div>{participant.phone || 'Sin teléfono'}</div></td>
                        <td className="p-3"><InPersonAssessmentForm key={`${participant.id}:${participant.updated_at}`} sessionId={session.id} participant={participant} /></td>
                        <td className="p-3"><Button size="sm" variant="outline" disabled={!!participant.certificate} onClick={() => setEditingParticipant(participant)}>Corregir datos</Button></td>
                    </tr>)}</tbody>
                </table>
            </div>}
            <div className="mt-5 flex gap-4">{participants.prev_page_url && <Link href={participants.prev_page_url} preserveScroll>Anterior</Link>}{participants.next_page_url && <Link href={participants.next_page_url} preserveScroll>Siguiente</Link>}</div>
        </AdminLayout>
    </>;
}
