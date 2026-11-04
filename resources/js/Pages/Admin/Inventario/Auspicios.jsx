import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';

export default function Auspicios({ products, sponsorships, totalCost }) {
    const { settings } = usePage().props;
    const form = useForm({ product_id: '', recipient: '', quantity: 1, source: 'sales', notes: '', request_key: crypto.randomUUID() });
    const product = products.find((item) => String(item.id) === String(form.data.product_id));
    const inputClass = 'mt-1 block w-full rounded-md border p-2';
    return <>
        <Head title="Auspicios" />
        <AdminLayout title="Auspicios">
            <h1 className="mb-2 text-xl font-semibold">Entregas por auspicio</h1>
            <p className="mb-5 text-sm text-muted-foreground">Registra productos entregados sin cobro. La empresa asume el costo promedio de compra; se descuenta el stock de la ubicación seleccionada.</p>
            <p className="mb-5 font-semibold">Costo acumulado: S/ {Number(totalCost).toFixed(2)}</p>
            <form className="mb-8 space-y-4 rounded-xl border bg-white p-5" onSubmit={(event) => { event.preventDefault(); form.post('/admin/inventario/auspicios', { preserveScroll: true, onSuccess: () => { form.reset(); form.setData('request_key', crypto.randomUUID()); } }); }}>
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm">Producto<select required className={inputClass} value={form.data.product_id} onChange={(event) => form.setData('product_id', event.target.value)}><option value="">Selecciona</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                    <label className="text-sm">Beneficiario / destinatario<input required maxLength={180} className={inputClass} value={form.data.recipient} onChange={(event) => form.setData('recipient', event.target.value)} /></label>
                    <label className="text-sm">Ubicación de salida<select className={inputClass} value={form.data.source} onChange={(event) => form.setData('source', event.target.value)}><option value="sales">Ventas</option>{settings?.warehouseMode && <option value="warehouse">Almacén</option>}</select></label>
                    <label className="text-sm">Cantidad<input required type="number" min={1} max={10000} className={inputClass} value={form.data.quantity} onChange={(event) => form.setData('quantity', event.target.value)} /></label>
                </div>
                <label className="block text-sm">Motivo / detalle del auspicio<textarea required maxLength={2000} className={inputClass} value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} /></label>
                {product && <p className="text-sm">Disponible: {form.data.source === 'warehouse' ? product.stock_warehouse ?? 0 : product.stock ?? 'Sin control'} · Costo unitario: {product.avg_cost == null ? 'No registrado' : `S/ ${Number(product.avg_cost).toFixed(2)}`} · Costo estimado: S/ {(Number(product.avg_cost || 0) * Number(form.data.quantity || 0)).toFixed(2)}</p>}
                {Object.entries(form.errors).map(([key, message]) => <p key={key} role="alert" className="text-sm text-red-700">{message}</p>)}
                <Button disabled={form.processing || !product || product.avg_cost == null || (form.data.source === 'sales' && product.stock === null)}>{form.processing ? 'Registrando…' : 'Registrar entrega por auspicio'}</Button>
            </form>
            <h2 className="mb-4 text-lg font-semibold">Entregas registradas</h2>
            {!sponsorships.data.length && <p className="text-sm text-muted-foreground">Aún no hay auspicios.</p>}
            <div className="space-y-3">{sponsorships.data.map((record) => <div key={record.id} className="rounded-lg border bg-white p-4"><strong>{record.quantity} × {record.product_name}</strong><p className="text-sm">{record.recipient} · {record.source === 'warehouse' ? 'Almacén' : 'Ventas'}</p><p className="text-sm">Costo asumido: S/ {Number(record.total_cost).toFixed(2)} · {new Date(record.created_at).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}</p><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{record.notes}</p></div>)}</div>
            <div className="mt-5 flex gap-4">{sponsorships.prev_page_url && <Link href={sponsorships.prev_page_url} preserveScroll>Anterior</Link>}{sponsorships.next_page_url && <Link href={sponsorships.next_page_url} preserveScroll>Siguiente</Link>}</div>
        </AdminLayout>
    </>;
}
