import { NativeSelect } from '@/Components/ui/smart-select';
import { AdminIcon, adminPrimaryButton, adminInput } from '@/Components/Admin/AdminPage';
import { Link, useForm } from '@inertiajs/react';
import { Plus, Trash2, Send, AlertTriangle, FileText, UserRound, Package, StickyNote } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';

const inputClass = adminInput;
const primaryButton = adminPrimaryButton;

export function QuoteFormModal({ quote, products, onClose }) {
    const editing = !!quote;
    const form = useForm({
        buyer_name: quote?.buyer_name ?? '', buyer_document: quote?.buyer_document ?? '', buyer_email: quote?.buyer_email ?? '',
        valid_until: quote?.valid_until?.slice(0, 10) ?? '', notes: quote?.notes ?? '',
        items: quote ? quote.items.map(({ product_id, qty, unit_price }) => ({ product_id, qty, unit_price })) : [{ product_id: '', qty: 1, unit_price: '' }],
    });
    const change = (index, values) => form.setData('items', form.data.items.map((item, i) => i === index ? { ...item, ...values } : item));
    const total = form.data.items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.unit_price || 0), 0);
    return <Dialog open onOpenChange={(open) => { if (!open && !form.processing) onClose(); }}>
        <DialogContent className="max-w-3xl gap-0 rounded-3xl border border-[#024A7D]/10 p-0 sm:rounded-3xl" showClose={!form.processing}>
            <DialogHeader className="border-b border-[#024A7D]/10 bg-gradient-to-r from-sky-50 to-white px-6 py-5 pr-12 text-left">
                <DialogTitle className="flex items-center gap-3 text-xl text-[#024A7D]"><AdminIcon icon={FileText} small />{editing ? `Editar ${quote.code}` : 'Nueva cotización'}</DialogTitle>
                <DialogDescription>{editing && quote.status === 'approved' ? 'Al guardar, la cotización volverá a quedar pendiente de aprobación.' : 'Completa el destinatario y agrega los productos.'}</DialogDescription>
            </DialogHeader>
            <form className="flex min-h-0 flex-col" onSubmit={(event) => {
                event.preventDefault();
                const options = { preserveScroll: true, onSuccess: onClose };
                if (editing) form.put(`/admin/quotes/${quote.id}`, options);
                else form.post('/admin/quotes', options);
            }}>
                <div className="min-h-0 max-h-[68vh] space-y-4 overflow-y-auto px-6 py-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[#024A7D]"><UserRound className="h-4 w-4" />Datos del cliente</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-xs font-medium">Cliente / destinatario<input autoFocus required maxLength={180} className={inputClass} value={form.data.buyer_name} onChange={(event) => form.setData('buyer_name', event.target.value)} /></label>
                        <label className="text-xs font-medium">Documento (opcional)<input maxLength={30} className={inputClass} value={form.data.buyer_document} onChange={(event) => form.setData('buyer_document', event.target.value)} /></label>
                        <label className="text-xs font-medium">Correo del cliente (opcional)<input type="email" maxLength={255} className={inputClass} value={form.data.buyer_email} onChange={(event) => form.setData('buyer_email', event.target.value)} /></label>
                        <label className="text-xs font-medium">Válida hasta (opcional)<input type="date" className={inputClass} value={form.data.valid_until} onChange={(event) => form.setData('valid_until', event.target.value)} /></label>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3"><h3 className="flex items-center gap-2 text-sm font-semibold text-[#024A7D]"><Package className="h-4 w-4" />Productos</h3><Button type="button" size="sm" variant="outline" className="rounded-xl border-[#024A7D]/15 text-[#024A7D]" disabled={form.data.items.length >= 50 || !products.length} onClick={() => form.setData('items', [...form.data.items, { product_id: '', qty: 1, unit_price: '' }])}><Plus className="h-3.5 w-3.5" />Agregar</Button></div>
                        {!products.length && <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-900">No hay productos activos. <Link href="/admin/products" className="underline">Registrar productos</Link></p>}
                        {form.data.items.map((item, i) => <div key={i} className="grid grid-cols-12 items-end gap-2 rounded-2xl border border-[#024A7D]/10 bg-[#f4f9fc] p-3">
                            <label className="col-span-12 text-xs sm:col-span-6">Producto<NativeSelect required className={inputClass} value={item.product_id} onChange={(event) => { const product = products.find((p) => String(p.id) === event.target.value); change(i, { product_id: event.target.value, unit_price: product?.price ?? '' }); }}>
                                <option value="">Selecciona un producto</option>
                                {!products.some((p) => String(p.id) === String(item.product_id)) && item.product_id && <option value={item.product_id}>{quote?.items[i]?.name ?? 'Producto no disponible'}</option>}
                                {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                            </NativeSelect></label>
                            <label className="col-span-4 text-xs sm:col-span-2">Cantidad<input required type="number" min={1} max={10000} className={inputClass} value={item.qty} onChange={(event) => change(i, { qty: event.target.value })} /></label>
                            <label className="col-span-6 text-xs sm:col-span-3">Precio S/<input required type="number" min={0} max={999999.99} step="0.01" className={inputClass} value={item.unit_price} onChange={(event) => change(i, { unit_price: event.target.value })} /></label>
                            <Button type="button" variant="ghost" size="icon" className="col-span-2 h-9 w-full text-slate-500 hover:text-red-600 sm:col-span-1" title="Quitar producto" aria-label={`Quitar producto ${i + 1}`} onClick={() => form.setData('items', form.data.items.filter((_, index) => index !== i))}><Trash2 className="h-4 w-4" /></Button>
                        </div>)}
                    </div>
                    <label className="block text-xs font-medium text-[#024A7D]"><span className="flex items-center gap-2"><StickyNote className="h-4 w-4" />Condiciones / notas</span><textarea rows={2} maxLength={2000} placeholder="Condiciones de entrega, forma de pago u otras indicaciones…" className={`${inputClass} h-auto py-2`} value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} /></label>
                    {Object.entries(form.errors).map(([key, error]) => <p key={key} role="alert" className="text-xs text-red-700">{error}</p>)}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#024A7D]/10 bg-[#f4f9fc] px-6 py-4">
                    <p className="text-xs font-medium text-slate-500">Total de la cotización <span className="mt-0.5 block text-2xl font-bold tracking-tight text-[#024A7D]">S/ {total.toFixed(2)}</span></p>
                    <div className="flex gap-2"><Button type="button" variant="outline" className="rounded-xl" disabled={form.processing} onClick={onClose}>Cancelar</Button><Button className={primaryButton} disabled={form.processing || !form.data.items.length || !products.length}>{form.processing ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear cotización'}</Button></div>
                </div>
            </form>
        </DialogContent>
    </Dialog>;
}

export function QuoteEmailModal({ quote, onClose }) {
    const form = useForm({ recipient_email: quote.emailed_to ?? quote.buyer_email ?? '', message: '' });
    return <Dialog open onOpenChange={(open) => { if (!open && !form.processing) onClose(); }}><DialogContent className="max-w-lg" showClose={!form.processing}>
        <DialogHeader><DialogTitle>Enviar cotización</DialogTitle><DialogDescription>{quote.code} · {quote.buyer_name}. Se adjuntará el PDF.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); form.post(`/admin/quotes/${quote.id}/correo`, { preserveScroll: true, onSuccess: onClose }); }}>
            <label className="block text-sm">Destinatario<input autoFocus required type="email" maxLength={255} className={inputClass} value={form.data.recipient_email} onChange={(event) => form.setData('recipient_email', event.target.value)} /></label>
            <label className="block text-sm">Mensaje (opcional)<textarea rows={3} maxLength={2000} className={`${inputClass} h-auto py-2`} value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} /></label>
            {Object.entries(form.errors).map(([key, error]) => <p key={key} role="alert" className="text-sm text-red-700">{error}</p>)}
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={form.processing} onClick={onClose}>Cancelar</Button><Button disabled={form.processing}><Send className="h-4 w-4" />{form.processing ? 'Enviando…' : 'Enviar correo'}</Button></div>
        </form>
    </DialogContent></Dialog>;
}

export function QuoteDeleteModal({ quote, onClose }) {
    const form = useForm({});
    return <Dialog open onOpenChange={(open) => { if (!open && !form.processing) onClose(); }}><DialogContent className="max-w-md" showClose={!form.processing}>
        <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-600" />Eliminar cotización</DialogTitle><DialogDescription>Se eliminará {quote.code}, de {quote.buyer_name}. Esta acción no se puede deshacer.</DialogDescription></DialogHeader>
        {Object.entries(form.errors).map(([key, error]) => <p key={key} role="alert" className="text-sm text-red-700">{error}</p>)}
        <div className="flex justify-end gap-2"><Button variant="outline" disabled={form.processing} onClick={onClose}>Cancelar</Button><Button className="bg-red-600 hover:bg-red-700" disabled={form.processing} onClick={() => form.delete(`/admin/quotes/${quote.id}`, { preserveScroll: true, onSuccess: onClose })}>{form.processing ? 'Eliminando…' : 'Eliminar cotización'}</Button></div>
    </DialogContent></Dialog>;
}
