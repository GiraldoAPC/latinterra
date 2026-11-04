import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

export default function ModuleExamSettings({ module }) {
    const form = useForm({ max_attempts: module.exam?.max_attempts ?? 6, question_limit: module.exam?.question_limit ?? 20, duration_minutes: module.exam?.duration_minutes ?? 20 });
    return <form className="mt-4 space-y-3 rounded-lg border bg-slate-50 p-3" onSubmit={(event) => { event.preventDefault(); form.put(`/admin/modulos/${module.id}/examen/configuracion`, { preserveScroll: true }); }}>
        <h4 className="text-sm font-semibold">Condiciones del examen</h4>
        <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs">Máximo de intentos<input required type="number" min={1} max={20} className="mt-1 block w-full rounded border p-2 text-sm" value={form.data.max_attempts} onChange={(event) => form.setData('max_attempts', event.target.value)} /></label>
            <label className="text-xs">Preguntas por intento<select className="mt-1 block w-full rounded border p-2 text-sm" value={form.data.question_limit} onChange={(event) => form.setData('question_limit', event.target.value)}>{[10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
            <label className="text-xs">Duración (minutos)<input required type="number" min={1} max={180} className="mt-1 block w-full rounded border p-2 text-sm" value={form.data.duration_minutes} onChange={(event) => form.setData('duration_minutes', event.target.value)} /></label>
        </div>
        <p className="text-xs text-slate-500">Si el banco es menor, se usan todas sus preguntas. Los cambios se aplican a nuevos intentos.</p>
        {Object.entries(form.errors).map(([key, error]) => <p key={key} role="alert" className="text-xs text-red-700">{error}</p>)}
        <Button size="sm" variant="outline" disabled={form.processing}>Guardar condiciones</Button>
    </form>;
}
