import { FormModal } from '@/Components/Shared/PageDesign';
import { UserRoundPen } from 'lucide-react';
import { NativeSelect } from '@/Components/ui/smart-select';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

export default function InPersonParticipantEditor({ sessionId, participant, onClose }) {
    const form = useForm({ document_type: participant.document_type, document_number: participant.document_number,
        name: participant.name, last_name: participant.last_name, email: participant.email ?? '', phone: participant.phone ?? '' });
    const fields = [['document_number', 'Número de documento'], ['name', 'Nombres'], ['last_name', 'Apellidos'], ['email', 'Correo (opcional)'], ['phone', 'Teléfono (opcional)']];
    return <FormModal open onClose={onClose} processing={form.processing} icon={UserRoundPen} title="Corregir participante" description="Actualiza los datos del registro presencial."><form className="mb-5 space-y-4 rounded-xl border border-sky-300 bg-white p-5" onSubmit={(event) => {
        event.preventDefault();
        form.put(`/admin/cursos/presenciales/${sessionId}/participantes/${participant.id}`, { preserveScroll: true, onSuccess: onClose });
    }}>
        <h3 className="font-semibold">Corregir datos del participante</h3>
        <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Tipo de documento<NativeSelect className="mt-1 block w-full rounded-md border p-2" value={form.data.document_type} onChange={(event) => form.setData('document_type', event.target.value)}><option value="dni">DNI</option><option value="ce">Carné de extranjería</option><option value="pasaporte">Pasaporte</option></NativeSelect></label>
            {fields.map(([field, label]) => <label key={field} className="text-sm">{label}<input required={!['email', 'phone'].includes(field)} type={field === 'email' ? 'email' : 'text'} maxLength={field === 'document_number' ? 20 : field === 'phone' ? 30 : field === 'email' ? 255 : 150} className="mt-1 block w-full rounded-md border p-2" value={form.data[field]} onChange={(event) => form.setData(field, event.target.value)} /></label>)}
        </div>
        {Object.entries(form.errors).map(([field, message]) => <p key={field} role="alert" className="text-sm text-red-700">{message}</p>)}
        <div className="flex gap-2"><Button disabled={form.processing}>Guardar corrección</Button><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button></div>
    </form></FormModal>;
}
