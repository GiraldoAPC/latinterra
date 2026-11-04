import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';

export default function Show({ quote, expired }) {
    const action = useForm({});
    const payment = useForm({ payment_method: 'efectivo', payment_reference: '' });
    const email = useForm({ recipient_email: quote.emailed_to ?? quote.buyer_email ?? '', message: '' });
    const labels = { draft: 'Pendiente de aprobación', approved: 'Aprobada', sold: 'Convertida en venta', cancelled: 'Cancelada' };
    return <>
        <Head title={`Cotización ${quote.code}`} />
        <AdminLayout title="Cotización">
            <div className="mb-5 flex flex-wrap gap-3 print:hidden"><Button variant="outline" asChild><Link href="/admin/quotes">Volver a cotizaciones</Link></Button>
                <Button asChild><a href={`/admin/quotes/${quote.id}/pdf`}>Descargar PDF</a></Button>
                <Button variant="outline" onClick={() => window.print()}>Imprimir</Button>
            </div>
            <article id="quote-print" className="rounded-xl border bg-white p-6 sm:p-9">
                <img src="/assets/img/logo-oficial.png" alt="Latin Terra" className="mb-6 h-14 max-w-56 object-contain" />
                <h1 className="text-2xl font-bold text-[#024A7D]">Cotización {quote.code}</h1>
                <p className="mt-3 font-semibold">{quote.buyer_name}</p>{quote.buyer_document && <p className="text-sm">Documento: {quote.buyer_document}</p>}
                {quote.buyer_email && <p className="text-sm">Correo: {quote.buyer_email}</p>}
                <p className="mt-2 text-sm">Emitida: {new Date(quote.created_at).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}</p>
                <p className="text-sm">Vigencia: {quote.valid_until ? String(quote.valid_until).slice(0, 10).split('-').reverse().join('/') : 'Sin fecha límite'}</p>
                <p className="mt-2 text-sm font-semibold">{labels[quote.status]}{expired && !['sold', 'cancelled'].includes(quote.status) ? ' · Vencida' : ''}</p>
                <div className="my-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3">Producto</th><th>Cantidad</th><th>Precio S/</th><th>Total S/</th></tr></thead><tbody>{quote.items.map((item) => <tr key={item.product_id} className="border-b"><td className="py-3 pr-4">{item.name}</td><td>{item.qty}</td><td>{Number(item.unit_price).toFixed(2)}</td><td>{(item.qty * item.unit_price).toFixed(2)}</td></tr>)}</tbody></table></div>
                <p className="text-right text-xl font-bold">Total: S/ {Number(quote.amount).toFixed(2)}</p>
                {quote.notes && <p className="mt-5 whitespace-pre-wrap text-sm">{quote.notes}</p>}
            </article>
            <section className="mt-6 space-y-4 print:hidden">
                <form className="space-y-3 rounded-lg border bg-white p-5" onSubmit={(event) => {
                    event.preventDefault();
                    email.post(`/admin/quotes/${quote.id}/correo`, { preserveScroll: true });
                }}>
                    <h2 className="font-semibold">Enviar cotización por correo</h2>
                    <p className="text-sm text-muted-foreground">Se adjuntará el PDF de esta cotización.</p>
                    <label className="block text-sm">Correo del destinatario<input required type="email" maxLength={255} className="mt-1 block w-full rounded-md border p-2" value={email.data.recipient_email} onChange={(event) => email.setData('recipient_email', event.target.value)} /></label>
                    <label className="block text-sm">Mensaje (opcional)<textarea maxLength={2000} className="mt-1 block w-full rounded-md border p-2" value={email.data.message} onChange={(event) => email.setData('message', event.target.value)} /></label>
                    {Object.entries(email.errors).map(([key, message]) => <p key={key} role="alert" className="text-sm text-red-700">{message}</p>)}
                    <Button disabled={email.processing}>{email.processing ? 'Enviando…' : 'Enviar cotización'}</Button>
                    {email.recentlySuccessful && <p role="status" className="text-sm text-green-700">Cotización enviada con el PDF adjunto.</p>}
                    {quote.emailed_at && <p className="text-xs text-muted-foreground">Último envío: {quote.emailed_to} · {new Date(quote.emailed_at).toLocaleString('es-PE', { timeZone: 'America/Lima' })} (Perú)</p>}
                </form>
                <p className="text-sm text-muted-foreground">Aprobar no reserva ni descuenta stock. Al confirmar el pago se verifica el stock de ventas y se emite un ticket interno.</p>
                <div className="flex flex-wrap gap-3">{quote.status === 'draft' && !expired && <Button disabled={action.processing} onClick={() => action.post(`/admin/quotes/${quote.id}/aprobar`)}>Registrar aprobación</Button>}
                    {['draft', 'approved'].includes(quote.status) && <Button variant="outline" disabled={action.processing || payment.processing} onClick={() => action.post(`/admin/quotes/${quote.id}/cancelar`)}>Cancelar cotización</Button>}
                </div>
                {quote.status === 'approved' && !expired && <form className="space-y-3 rounded-lg border bg-white p-5" onSubmit={(event) => { event.preventDefault(); payment.post(`/admin/quotes/${quote.id}/vender`); }}>
                    <h2 className="font-semibold">Registrar pago confirmado y venta</h2>
                    <label className="block text-sm">Medio de pago<select className="mt-1 block w-full rounded-md border p-2" value={payment.data.payment_method} onChange={(event) => payment.setData('payment_method', event.target.value)}>{['efectivo', 'transferencia', 'yape', 'tarjeta', 'otro'].map((method) => <option key={method} value={method}>{method}</option>)}</select></label>
                    <label className="block text-sm">Referencia (opcional)<input maxLength={120} className="mt-1 block w-full rounded-md border p-2" value={payment.data.payment_reference} onChange={(event) => payment.setData('payment_reference', event.target.value)} /></label>
                    <Button disabled={payment.processing || action.processing}>Confirmar pago y registrar venta</Button>
                </form>}
                {quote.payment && <p className="text-sm"><Link className="underline" href={`/admin/ventas/otros-pagos/${quote.other_payment_id}/recibo`}>Ver ticket {quote.payment.receipt_code}</Link>{quote.payment.voided_at && ' · Venta anulada'}</p>}
                {[...Object.entries(action.errors), ...Object.entries(payment.errors)].map(([key, message], i) => <p key={`${key}-${i}`} role="alert" className="text-sm text-red-700">{message}</p>)}
            </section>
            <style>{`@media print { @page { size:A4 portrait; margin:15mm; } body * { visibility:hidden !important; } #quote-print, #quote-print * { visibility:visible !important; } #quote-print { position:absolute; left:0; top:0; width:180mm; padding:0; border:0; } }`}</style>
        </AdminLayout>
    </>;
}
