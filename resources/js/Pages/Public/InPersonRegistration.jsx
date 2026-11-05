import { NativeSelect } from '@/Components/ui/smart-select';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { PageHeader } from '@/Components/Shared/PageDesign';
import { UserRoundPlus } from 'lucide-react';

export default function InPersonRegistration({ session, registered }) {
    const [submitted, setSubmitted] = useState(false);
    const form = useForm({ document_type: 'dni', document_number: '', name: '', last_name: '', email: '', phone: '', confirmed: false });
    const inputClass = 'mt-1 block w-full rounded-md border border-slate-300 p-2.5';
    return <main className="min-h-screen bg-slate-50 px-4 py-10">
        <Head title="Registro de participante | Acceso Vertical Perú"><meta name="robots" content="noindex, nofollow" /></Head>
        <div className="mx-auto max-w-xl rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
            <img src="/assets/img/LOGO-ACCESO-VERTICAL.png" alt="Acceso Vertical Perú" className="mx-auto mb-6 h-16 object-contain" />
            <PageHeader className="px-4 py-5 sm:px-5 sm:py-5" icon={UserRoundPlus} title="Registro de participante" description="Completa tus datos para participar en la capacitación." />
            <p className="mt-3 font-semibold">{session.title}</p><p className="text-sm">{session.course}</p>
            <p className="text-sm text-slate-600">{session.location} · {new Date(session.starts_at).toLocaleString('es-PE', { timeZone: 'America/Lima' })} (Perú)</p>
            {submitted || registered ? <div role="status" className="mt-6 rounded-lg bg-green-50 p-4 text-green-900">
                <h2 className="font-semibold">Registro completado</h2><p className="mt-2 text-sm">Tus datos fueron recibidos. Si necesitas corregirlos, contacta con administración.</p>
            </div> : !session.available ? <p role="status" className="mt-6 rounded-lg bg-amber-50 p-4 text-amber-900">El registro está cerrado o el grupo completó su cupo. Contacta con administración.</p> : <form className="mt-6 space-y-4" onSubmit={(event) => {
                event.preventDefault();
                form.post(`/presencial/registro/${session.token}`, { onSuccess: () => { setSubmitted(true); form.reset(); } });
            }}>
                <p className="text-sm text-slate-600">Completa tus datos tal como aparecen en tu documento. Este formulario registra tu participación en el grupo.</p>
                <label className="block text-sm">Tipo de documento<NativeSelect required className={inputClass} value={form.data.document_type} onChange={(event) => form.setData('document_type', event.target.value)}><option value="dni">DNI</option><option value="ce">Carné de extranjería</option><option value="pasaporte">Pasaporte</option></NativeSelect></label>
                <label className="block text-sm">Número de documento<input required maxLength={20} inputMode={form.data.document_type === 'dni' ? 'numeric' : 'text'} className={inputClass} value={form.data.document_number} onChange={(event) => form.setData('document_number', event.target.value)} /></label>
                <label className="block text-sm">Nombres<input required autoComplete="given-name" maxLength={150} className={inputClass} value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} /></label>
                <label className="block text-sm">Apellidos<input required autoComplete="family-name" maxLength={150} className={inputClass} value={form.data.last_name} onChange={(event) => form.setData('last_name', event.target.value)} /></label>
                <label className="block text-sm">Correo electrónico (opcional)<input type="email" autoComplete="email" maxLength={255} className={inputClass} value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} /></label>
                <label className="block text-sm">Teléfono (opcional)<input type="tel" autoComplete="tel" maxLength={30} className={inputClass} value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} /></label>
                <label className="flex items-start gap-3 text-sm"><input required type="checkbox" className="mt-1" checked={form.data.confirmed} onChange={(event) => form.setData('confirmed', event.target.checked)} />Confirmo que mis nombres, apellidos y documento están escritos correctamente.</label>
                {Object.entries(form.errors).map(([field, message]) => <p key={field} role="alert" className="text-sm text-red-700">{message}</p>)}
                <Button className="w-full" disabled={form.processing}>{form.processing ? 'Registrando…' : 'Registrar mis datos'}</Button>
            </form>}
        </div>
    </main>;
}
