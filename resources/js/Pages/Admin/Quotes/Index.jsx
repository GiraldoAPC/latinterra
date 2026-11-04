import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, Download, Mail, FileText } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { QuoteFormModal, QuoteEmailModal, QuoteDeleteModal } from '@/Components/Admin/QuoteModals';

const labels = { draft: 'Pendiente', approved: 'Aprobada', sold: 'Vendida', cancelled: 'Cancelada' };
const colors = { draft: 'bg-amber-50 text-amber-800', approved: 'bg-sky-50 text-sky-800', sold: 'bg-emerald-50 text-emerald-800', cancelled: 'bg-slate-100 text-slate-600' };
const date = (value) => value ? value.slice(0, 10).split('-').reverse().join('/') : '—';

export default function Index({ quotes, products, filters = {} }) {
    const [formModal, setFormModal] = useState(null);
    const [emailQuote, setEmailQuote] = useState(null);
    const [deleteQuote, setDeleteQuote] = useState(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    useEffect(() => {
        setSearch(filters.search ?? '');
        setStatus(filters.status ?? '');
    }, [filters.search, filters.status]);
    return <>
        <Head title="Cotizaciones" />
        <AdminLayout title="Cotizaciones">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div><h1 className="text-xl font-semibold">Cotizaciones</h1><p className="mt-1 text-sm text-muted-foreground">Gestiona tus cotizaciones y sus documentos.</p></div>
                <Button onClick={() => setFormModal('new')}><Plus className="h-4 w-4" />Nueva cotización</Button>
            </div>
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <form className="flex flex-wrap items-center gap-3 border-b p-4" onSubmit={(event) => { event.preventDefault(); router.get('/admin/quotes', { search, status }, { preserveState: true, preserveScroll: true }); }}>
                    <div className="relative min-w-52 flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input aria-label="Buscar cotizaciones" placeholder="Buscar por código, cliente o correo…" className="h-9 w-full rounded-md border pl-9 pr-3 text-sm" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
                    <select aria-label="Filtrar por estado" className="h-9 rounded-md border px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos los estados</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
                    <Button type="submit" size="sm" variant="outline">Filtrar</Button>
                </form>
                <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="border-b bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3 font-medium">Código</th><th className="px-4 py-3 font-medium">Cliente</th><th className="px-4 py-3 font-medium">Fecha</th><th className="px-4 py-3 font-medium">Vigencia</th><th className="px-4 py-3 font-medium">Estado</th><th className="px-4 py-3 text-right font-medium">Total</th><th className="px-4 py-3 text-right font-medium">Acciones</th></tr></thead>
                    <tbody>{quotes.data.map((quote) => {
                        const sold = quote.status === 'sold' || !!quote.other_payment_id;
                        const editable = !sold && ['draft', 'approved'].includes(quote.status);
                        return <tr key={quote.id} className="border-b last:border-0 hover:bg-slate-50/60">
                            <td className="whitespace-nowrap px-4 py-4"><Link className="font-medium text-[#024A7D] hover:underline" href={`/admin/quotes/${quote.id}`}>{quote.code}</Link></td>
                            <td className="max-w-64 px-4 py-4"><p className="truncate font-medium">{quote.buyer_name}</p>{quote.buyer_email && <p className="truncate text-xs text-muted-foreground">{quote.buyer_email}</p>}</td>
                            <td className="whitespace-nowrap px-4 py-4 text-slate-600">{new Date(quote.created_at).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}</td>
                            <td className="whitespace-nowrap px-4 py-4 text-slate-600">{date(quote.valid_until)}</td>
                            <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${colors[quote.status]}`}>{labels[quote.status]}</span></td>
                            <td className="whitespace-nowrap px-4 py-4 text-right font-semibold">S/ {Number(quote.amount).toFixed(2)}</td>
                            <td className="px-3 py-3"><div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" title="Ver cotización" aria-label={`Ver ${quote.code}`} asChild><Link href={`/admin/quotes/${quote.id}`}><Eye className="h-4 w-4" /></Link></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" title={editable ? 'Editar cotización' : 'Esta cotización no se puede editar'} aria-label={`Editar ${quote.code}`} disabled={!editable} onClick={() => setFormModal(quote)}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" title="Descargar PDF" aria-label={`Descargar PDF de ${quote.code}`} asChild><a href={`/admin/quotes/${quote.id}/pdf`}><Download className="h-4 w-4" /></a></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" title="Enviar por correo" aria-label={`Enviar ${quote.code} por correo`} onClick={() => setEmailQuote(quote)}><Mail className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700" title={sold ? 'La cotización tiene una venta registrada' : 'Eliminar cotización'} aria-label={`Eliminar ${quote.code}`} disabled={sold} onClick={() => setDeleteQuote(quote)}><Trash2 className="h-4 w-4" /></Button>
                            </div></td>
                        </tr>;
                    })}
                    {!quotes.data.length && <tr><td colSpan={7} className="px-5 py-16 text-center"><FileText className="mx-auto mb-3 h-9 w-9 text-slate-300" /><p className="font-medium text-slate-600">{filters.search || filters.status ? 'No se encontraron cotizaciones' : 'Todavía no hay cotizaciones'}</p><p className="mt-1 text-xs text-muted-foreground">{filters.search || filters.status ? 'Prueba con otros filtros.' : 'Crea la primera con el botón Nueva cotización.'}</p></td></tr>}
                    </tbody>
                </table></div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground"><span>{quotes.total ? `${quotes.from}–${quotes.to} de ${quotes.total} cotizaciones` : '0 cotizaciones'}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={!quotes.prev_page_url} onClick={() => router.get(quotes.prev_page_url, {}, { preserveState: true, preserveScroll: true })}>Anterior</Button><Button variant="outline" size="sm" disabled={!quotes.next_page_url} onClick={() => router.get(quotes.next_page_url, {}, { preserveState: true, preserveScroll: true })}>Siguiente</Button></div></div>
            </div>
            {formModal && <QuoteFormModal quote={formModal === 'new' ? null : formModal} products={products} onClose={() => setFormModal(null)} />}
            {emailQuote && <QuoteEmailModal quote={emailQuote} onClose={() => setEmailQuote(null)} />}
            {deleteQuote && <QuoteDeleteModal quote={deleteQuote} onClose={() => setDeleteQuote(null)} />}
        </AdminLayout>
    </>;
}
