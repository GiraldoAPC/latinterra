import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { useState } from 'react';
import { Gift, Plus } from 'lucide-react';
import { AdminPageHeader, AdminPanel, AdminFormModal } from '@/Components/Admin/AdminPage';

export default function Auspicios({ products, sponsorships, totalCost }) {
    const { settings } = usePage().props;
    const [creating, setCreating] = useState(false);
    const form = useForm({ product_id: '', recipient: '', quantity: 1, source: 'sales', notes: '', request_key: crypto.randomUUID() });
    const product = products.find((item) => String(item.id) === String(form.data.product_id));
    const inputClass = 'mt-1 block w-full rounded-md border p-2';
    return <>
        <Head title="Auspicios" />
        <AdminLayout title="Auspicios">
            <AdminPageHeader icon={Gift} title="Entregas por auspicio" description="Gestiona entregas sin cobro y el costo asumido por la empresa." actions={<Button onClick={() => setCreating(true)}><Plus />Nuevo auspicio</Button>} />
            <p className="mb-5 font-semibold">Costo acumulado: S/ {Number(totalCost).toFixed(2)}</p>
            <AdminFormModal open={creating} onClose={() => setCreating(false)} processing={form.processing} icon={Gift} title="Nuevo auspicio" description="La empresa asume el costo promedio de compra; se descuenta el stock de la ubicación seleccionada.">
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); form.post('/admin/inventario/auspicios', { preserveScroll: true, onSuccess: () => { form.reset(); form.setData('request_key', crypto.randomUUID()); setCreating(false); } }); }}>
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm">Producto<select required className={inputClass} value={form.data.product_id} onChange={(event) => form.setData('product_id', event.target.value)}><option value="">Selecciona</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                    <label className="text-sm">Beneficiario / destinatario<input required maxLength={180} className={inputClass} value={form.data.recipient} onChange={(event) => form.setData('recipient', event.target.value)} /></label>
                    <label className="text-sm">Ubicación de salida<select className={inputClass} value={form.data.source} onChange={(event) => form.setData('source', event.target.value)}><option value="sales">Ventas</option>{settings?.warehouseMode && <option value="warehouse">Almacén</option>}</select></label>
                    <label className="text-sm">Cantidad<input required type="number" min={1} max={10000} className={inputClass} value={form.data.quantity} onChange={(event) => form.setData('quantity', event.target.value)} /></label>
                </div>
                <label className="block text-sm">Motivo / detalle del auspicio<textarea required maxLength={2000} className={inputClass} value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} /></label>
                {product && <p className="text-sm">Disponible: {form.data.source === 'warehouse' ? product.stock_warehouse ?? 0 : product.stock ?? 'Sin control'} · Costo unitario: {product.avg_cost == null ? 'No registrado' : `S/ ${Number(product.avg_cost).toFixed(2)}`} · Costo estimado: S/ {(Number(product.avg_cost || 0) * Number(form.data.quantity || 0)).toFixed(2)}</p>}
                {Object.entries(form.errors).map(([key, message]) => <p key={key} role="alert" className="text-sm text-red-700">{message}</p>)}
                <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={form.processing} onClick={() => setCreating(false)}>Cancelar</Button><Button disabled={form.processing || !product || product.avg_cost == null || (form.data.source === 'sales' && product.stock === null)}>{form.processing ? 'Registrando…' : 'Registrar entrega por auspicio'}</Button></div>
            </form>
            </AdminFormModal>
            <AdminPanel className="p-4 sm:p-6"><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead><tr><th>Producto</th><th>Beneficiario</th><th>Salida</th><th>Cantidad</th><th>Costo asumido</th><th>Fecha</th><th>Motivo</th></tr></thead><tbody>{sponsorships.data.map((record) => <tr key={record.id}><td className="p-4 font-medium text-[#024A7D]">{record.product_name}</td><td className="p-4">{record.recipient}</td><td className="p-4">{record.source === 'warehouse' ? 'Almacén' : 'Ventas'}</td><td className="p-4">{record.quantity}</td><td className="whitespace-nowrap p-4 font-semibold">S/ {Number(record.total_cost).toFixed(2)}</td><td className="whitespace-nowrap p-4">{new Date(record.created_at).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}</td><td className="max-w-64 whitespace-pre-wrap p-4 text-slate-500">{record.notes}</td></tr>)}</tbody></table></div>
            {!sponsorships.data.length && <div className="py-12 text-center"><Gift className="mx-auto mb-3 h-10 w-10 text-[#00ADEE]" /><p className="font-semibold text-[#024A7D]">Aún no hay auspicios</p><Button className="mt-4" onClick={() => setCreating(true)}><Plus />Nuevo auspicio</Button></div>}
            </AdminPanel>
            <div className="mt-5 flex gap-4">{sponsorships.prev_page_url && <Link href={sponsorships.prev_page_url} preserveScroll>Anterior</Link>}{sponsorships.next_page_url && <Link href={sponsorships.next_page_url} preserveScroll>Siguiente</Link>}</div>
        </AdminLayout>
    </>;
}
