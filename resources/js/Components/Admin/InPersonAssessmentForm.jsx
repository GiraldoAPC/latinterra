import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useState } from 'react';
import { FormModal } from '@/Components/Shared/PageDesign';
import { ClipboardCheck } from 'lucide-react';

export default function InPersonAssessmentForm({ sessionId, participant }) {
    const form = useForm({ score: participant.score ?? '', attendance_confirmed: participant.attendance_confirmed });
    const issue = useForm({});
    const [editing, setEditing] = useState(false);
    const base = `/admin/cursos/presenciales/${sessionId}/participantes/${participant.id}`;
    if (participant.certificate) return <div className="space-y-2">
        <p className="text-sm font-semibold text-green-800">Certificado emitido · {Number(participant.score).toFixed(2)}/20</p>
        <Button variant="outline" size="sm" asChild><Link href={`${base}/certificado`}>Ver / Imprimir certificado</Link></Button>
    </div>;
    const ready = participant.attendance_confirmed && participant.score != null && Number(participant.score) >= 13;
    return <div className="min-w-56 space-y-3">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}><ClipboardCheck />{participant.score == null ? 'Registrar evaluación' : 'Editar evaluación'}</Button>
        <FormModal open={editing} onClose={() => setEditing(false)} processing={form.processing} icon={ClipboardCheck} title="Evaluación presencial" description={`${participant.last_name}, ${participant.name}`} className="max-w-lg">
        <form className="space-y-2" onSubmit={(event) => {
            event.preventDefault();
            form.transform((data) => ({ ...data, score: data.score === '' ? null : data.score }));
            form.put(`${base}/evaluacion`, { preserveScroll: true, onSuccess: () => setEditing(false) });
        }}>
            <label className="block text-xs">Nota (0–20)<input type="number" min={0} max={20} step="0.01" className="mt-1 block w-24 rounded-md border p-2" value={form.data.score} onChange={(event) => form.setData('score', event.target.value)} /></label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.data.attendance_confirmed} onChange={(event) => form.setData('attendance_confirmed', event.target.checked)} />Asistencia confirmada</label>
            <Button type="submit" size="sm" variant="outline" disabled={form.processing || issue.processing}>Guardar evaluación</Button>
            {form.recentlySuccessful && <p role="status" className="text-xs text-green-700">Evaluación guardada.</p>}
            {Object.entries(form.errors).map(([key, message]) => <p key={key} role="alert" className="text-xs text-red-700">{message}</p>)}
        </form>
        </FormModal>
        <p className="text-xs text-muted-foreground">{participant.score == null ? 'Sin nota registrada' : Number(participant.score) >= 13 ? 'Nota aprobatoria' : 'Nota desaprobatoria'}</p>
        <Button size="sm" disabled={!ready || form.isDirty || form.processing || issue.processing} onClick={() => issue.post(`${base}/certificado`)}>{issue.processing ? 'Emitiendo…' : 'Emitir certificado'}</Button>
        {Object.entries(issue.errors).map(([key, message]) => <p key={key} role="alert" className="text-xs text-red-700">{message}</p>)}
    </div>;
}
