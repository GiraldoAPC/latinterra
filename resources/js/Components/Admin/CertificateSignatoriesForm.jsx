import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

function newSigner(role) {
    return { id: crypto.randomUUID(), name: '', role, image: null };
}

export default function CertificateSignatoriesForm({ course }) {
    const form = useForm({ signatories: course.signatories.length
        ? course.signatories.map((signer) => ({ ...signer, image: null }))
        : [newSigner('company'), newSigner('instructor')] });
    const update = (index, field, value) => form.setData('signatories', form.data.signatories.map((signer, i) => i === index ? { ...signer, [field]: value } : signer));

    return <form className="space-y-4" onSubmit={(event) => {
        event.preventDefault();
        form.post(`/admin/cursos/${course.id}/firmas`, { forceFormData: true, preserveScroll: true });
    }}>
        <p className="text-sm text-muted-foreground">Configura una firma de empresa y hasta cinco instructores. Los cambios se aplican a nuevos certificados; los emitidos conservan sus firmas originales.</p>
        {form.data.signatories.map((signer, i) => <fieldset key={signer.id} className="rounded-lg border p-4">
            <legend className="px-2 text-sm font-semibold">{signer.role === 'company' ? 'Representante de la empresa' : `Instructor ${i}`}</legend>
            <label className="block text-sm">Nombre del firmante
                <input required maxLength={150} className="mt-1 block w-full rounded-md border p-2" value={signer.name} onChange={(event) => update(i, 'name', event.target.value)} />
            </label>
            {signer.url && <img src={signer.url} alt={`Firma guardada de ${signer.name}`} className="my-3 h-20 max-w-56 object-contain" />}
            <label className="mt-3 block text-sm">{signer.url ? 'Reemplazar firma (opcional)' : 'Imagen de la firma'}
                <input type="file" accept="image/png,image/jpeg" required={!signer.url} className="mt-1 block w-full text-sm" onChange={(event) => update(i, 'image', event.target.files?.[0] ?? null)} />
            </label>
            <p className="mt-1 text-xs text-muted-foreground">PNG o JPG, máximo 2 MB. Recomendado: PNG con fondo transparente.</p>
            {signer.role === 'instructor' && form.data.signatories.length > 2 && <Button type="button" variant="outline" className="mt-3" onClick={() => form.setData('signatories', form.data.signatories.filter((_, index) => index !== i))}>Quitar instructor</Button>}
        </fieldset>)}
        {Object.entries(form.errors).map(([key, error]) => <p key={key} role="alert" className="text-sm text-red-700">{error}</p>)}
        <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={form.data.signatories.length >= 6 || form.processing} onClick={() => form.setData('signatories', [...form.data.signatories, newSigner('instructor')])}>Agregar instructor</Button>
            <Button disabled={form.processing}>{form.processing ? 'Guardando…' : 'Guardar firmas'}</Button>
        </div>
        {form.recentlySuccessful && <p role="status" className="text-sm text-green-700">Firmas guardadas correctamente.</p>}
    </form>;
}
