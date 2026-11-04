import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';

export default function Index({ quotes, products }) {
    const form = useForm({ buyer_name: '', buyer_document: '', buyer_email: '', valid_until: '', notes: '', items: [] });
    const inputClass = 'mt-1 block w-full rounded-md border p-2';
    const change = (index, values) => form.setData('items', form.data.items.map((item, i) => i === index ? { ...item, ...values } : item));
    const labels = { draft: 'Pendiente', approved: 'Aprobada', sold: 'Vendida', cancelled: 'Cancelada' };
    const amount = form.data.items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.unit_price || 0), 0);
    return <>
        <Head title="Cotizaciones" />
        <AdminLayout title="Cotizaciones">
            <h1 className="mb-2 text-xl font-semibold">Cotizaciones</h1>
            <p className="mb-6 text-sm text-muted-foreground">Cotiza productos, registra la aprobación y convierte la cotización en venta cuando se confirme el pago.</p>
            <form className="mb-8 space-y-4 rounded-xl border bg-white p-5" onSubmit={(event) => { event.preventDefault(); form.post('/admin/quotes'); }}>
                <h2 className="font-semibold">Nueva cotización</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <label className="text-sm">Cliente / destinatario<input required maxLength={180} className={inputClass} value={form.data.buyer_name} onChange={(event) => form.setData('buyer_name', event.target.value)} /></label>
                    <label className="text-sm">Documento (opcional)<input maxLength={30} className={inputClass} value={form.data.buyer_document} onChange={(event) => form.setData('buyer_document', event.target.value)} /></label>
                    <label className="text-sm">Correo del cliente (opcional)<input type="email" maxLength={255} className={inputClass} value={form.data.buyer_email} onChange={(event) => form.setData('buyer_email', event.target.value)} /></label>
                    <label className="text-sm">Válida hasta (opcional)<input type="date" className={inputClass} value={form.data.valid_until} onChange={(event) => form.setData('valid_until', event.target.value)} /></label>
                </div>
                {form.data.items.map((item, i) => <div key={i} className="grid items-end gap-3 rounded-lg border p-3 md:grid-cols-[2fr_1fr_1fr_auto]">
                    <label className="text-sm">Producto<select required className={inputClass} value={item.product_id} onChange={(event) => {
                        const product = products.find((p) => String(p.id) === event.target.value);
                        change(i, { product_id: event.target.value, unit_price: product?.price ?? '' });
                    }}><option value="">Selecciona</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
                    <label className="text-sm">Cantidad<input required type="number" min={1} max={10000} className={inputClass} value={item.qty} onChange={(event) => change(i, { qty: event.target.value })} /></label>
                    <label className="text-sm">Precio unitario S/<input required type="number" min={0} max={999999.99} step="0.01" className={inputClass} value={item.unit_price} onChange={(event) => change(i, { unit_price: event.target.value })} /></label>
                    <Button type="button" variant="outline" onClick={() => form.setData('items', form.data.items.filter((_, index) => index !== i))}>Quitar</Button>
                </div>)}
                <Button type="button" variant="outline" disabled={form.data.items.length >= 50 || !products.length} onClick={() => form.setData('items', [...form.data.items, { product_id: '', qty: 1, unit_price: '' }])}>Agregar producto</Button>
                <label className="block text-sm">Condiciones / notas<textarea maxLength={2000} className={inputClass} value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} /></label>
                <p className="font-semibold">Total: S/ {amount.toFixed(2)}</p>
                {Object.entries(form.errors).map(([key, message]) => <p key={key} role="alert" className="text-sm text-red-700">{message}</p>)}
                <Button disabled={form.processing || !form.data.items.length}>Crear cotización</Button>
            </form>
            <h2 className="mb-4 text-lg font-semibold">Cotizaciones registradas</h2>
            {!quotes.data.length && <p className="text-sm text-muted-foreground">Aún no hay cotizaciones.</p>}
            <div className="space-y-3">{quotes.data.map((quote) => <Link key={quote.id} href={`/admin/quotes/${quote.id}`} className="block rounded-lg border bg-white p-4 hover:border-sky-500"><strong>{quote.code} · {quote.buyer_name}</strong><p className="text-sm">{labels[quote.status]} · S/ {Number(quote.amount).toFixed(2)}</p></Link>)}</div>
            <div className="mt-5 flex gap-4">{quotes.prev_page_url && <Link href={quotes.prev_page_url}>Anterior</Link>}{quotes.next_page_url && <Link href={quotes.next_page_url}>Siguiente</Link>}</div>
        </AdminLayout>
    </>;
}
