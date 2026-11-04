import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, Download, Mail, FileText, Filter, Layers, ChevronDown, ChevronLeft, ChevronRight, Hash, UserRound, CalendarDays, CalendarCheck, Tag, Coins, Ellipsis } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { QuoteFormModal, QuoteEmailModal, QuoteDeleteModal } from '@/Components/Admin/QuoteModals';

const labels = { draft: 'Pendiente', approved: 'Aprobada', sold: 'Vendida', cancelled: 'Cancelada' };
const colors = { draft: 'bg-amber-50 text-amber-800', approved: 'bg-sky-50 text-sky-800', sold: 'bg-emerald-50 text-emerald-800', cancelled: 'bg-slate-100 text-slate-600' };
const date = (value) => value ? value.slice(0, 10).split('-').reverse().join('/') : '—';
const primaryButton = 'h-11 rounded-xl bg-gradient-to-br from-[#00ADEE] via-[#026698] to-[#024A7D] px-5 font-semibold text-white shadow-lg shadow-[#024A7D]/15 hover:brightness-110';
const columns = [[Hash, 'Código'], [UserRound, 'Cliente'], [CalendarDays, 'Fecha'], [CalendarCheck, 'Vigencia'], [Tag, 'Estado'], [Coins, 'Total'], [Ellipsis, 'Acciones']];

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
            <section className="overflow-hidden rounded-3xl border border-[#024A7D]/10 bg-white shadow-[0_12px_40px_-18px_rgba(2,74,125,0.3)]">
                <header className="relative isolate overflow-hidden bg-gradient-to-r from-white via-sky-50/70 to-[#e3f4fc] px-5 py-7 sm:px-8 sm:py-8">
                    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full" viewBox="0 0 1200 180" preserveAspectRatio="none"><path d="M480 180C670 70 730 150 860 0H1200V180Z" fill="#00ADEE" fillOpacity=".08" /><path d="M700 180C850 100 1000 110 1100 0H1200V180Z" fill="#024A7D" fillOpacity=".06" /></svg>
                    <div className="flex flex-wrap items-center justify-between gap-5">
                        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#00ADEE] to-[#024A7D] text-white shadow-lg shadow-[#024A7D]/20 sm:h-16 sm:w-16"><FileText className="h-7 w-7 stroke-[1.5]" /></span>
                            <div className="min-w-0 border-l border-[#024A7D]/15 pl-4 sm:pl-5"><h1 className="text-2xl font-bold tracking-tight text-[#024A7D] sm:text-3xl">Cotizaciones</h1><p className="mt-1 text-sm text-slate-500">Gestiona tus cotizaciones y sus documentos.</p></div>
                        </div>
                        <Button className={`${primaryButton} w-full sm:w-auto`} onClick={() => setFormModal('new')}><Plus className="h-5 w-5" />Nueva cotización</Button>
                    </div>
                </header>
                <div className="relative rounded-t-3xl border-t border-[#024A7D]/10 bg-white px-4 pb-1 pt-6 sm:px-7">
                <form className="mb-6 flex flex-wrap items-center gap-3" onSubmit={(event) => { event.preventDefault(); router.get('/admin/quotes', { search, status }, { preserveState: true, preserveScroll: true }); }}>
                    <div className="relative min-w-0 basis-full sm:min-w-52 sm:flex-1 sm:basis-auto"><Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-[#024A7D]/70" /><input aria-label="Buscar cotizaciones" placeholder="Buscar por código, cliente o correo…" className="h-12 w-full rounded-2xl border border-[#024A7D]/20 bg-white pl-12 pr-4 text-sm shadow-sm placeholder:text-slate-400 focus:border-[#00ADEE] focus:outline-none focus:ring-2 focus:ring-[#00ADEE]/15" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
                    <div className="relative min-w-0 flex-1 sm:max-w-64"><Layers className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-[#024A7D]" /><select aria-label="Filtrar por estado" className="h-12 w-full appearance-none bg-none rounded-2xl border border-[#024A7D]/20 bg-white pl-12 pr-10 text-sm font-medium text-[#024A7D] shadow-sm focus:border-[#00ADEE] focus:outline-none focus:ring-2 focus:ring-[#00ADEE]/15" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos los estados</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-4 h-4 w-4 text-[#024A7D]" /></div>
                    <Button type="submit" className={primaryButton}><Filter className="h-4 w-4" />Filtrar</Button>
                </form>
                <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="bg-[#edf5f9] text-[#024A7D]"><tr>{columns.map(([Icon, label], index) => <th key={label} className={`whitespace-nowrap px-4 py-4 font-semibold first:rounded-l-2xl last:rounded-r-2xl ${index >= 5 ? 'text-right' : ''}`}><span className={`inline-flex items-center gap-2 ${index >= 5 ? 'justify-end' : ''}`}><Icon className="h-[18px] w-[18px] stroke-[1.7]" />{label}</span></th>)}</tr></thead>
                    <tbody>{quotes.data.map((quote) => {
                        const sold = quote.status === 'sold' || !!quote.other_payment_id;
                        const editable = !sold && ['draft', 'approved'].includes(quote.status);
                        return <tr key={quote.id} className="border-b border-slate-100 last:border-0 hover:bg-sky-50/50">
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
                    </tbody>
                </table></div>
                    {!quotes.data.length && <div className="px-5 py-10 text-center sm:py-12">
                        <div className="relative mx-auto mb-5 grid h-24 w-28 place-items-center"><span className="absolute inset-x-0 bottom-0 h-20 rounded-[45%] bg-sky-50" /><span className="absolute right-1 top-1 h-3 w-1 rotate-45 rounded-full bg-[#00ADEE]" /><span className="absolute right-0 top-6 h-1 w-3 rounded-full bg-[#024A7D]/60" /><FileText className="relative h-20 w-20 -rotate-6 text-[#00ADEE] drop-shadow-[0_5px_3px_rgba(2,74,125,0.15)] stroke-[1.3]" /></div>
                        <p className="text-lg font-bold tracking-tight text-[#024A7D] sm:text-xl">{filters.search || filters.status ? 'No se encontraron cotizaciones' : 'Todavía no hay cotizaciones'}</p><p className="mt-2 text-sm text-slate-500">{filters.search || filters.status ? 'Prueba con otro cliente, código o estado.' : 'Crea la primera con el botón Nueva cotización.'}</p>
                        {!(filters.search || filters.status) && <Button className={`${primaryButton} mt-5`} onClick={() => setFormModal('new')}><Plus className="h-4 w-4" />Nueva cotización</Button>}
                    </div>}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 py-5 text-xs text-slate-500"><span>{quotes.total ? `${quotes.from}–${quotes.to} de ${quotes.total} cotizaciones` : '0 cotizaciones'}</span><div className="flex gap-2"><Button variant="outline" className="rounded-xl border-[#024A7D]/15 text-[#024A7D]" disabled={!quotes.prev_page_url} onClick={() => router.get(quotes.prev_page_url, {}, { preserveState: true, preserveScroll: true })}><ChevronLeft />Anterior</Button><Button variant="outline" className="rounded-xl border-[#024A7D]/15 text-[#024A7D]" disabled={!quotes.next_page_url} onClick={() => router.get(quotes.next_page_url, {}, { preserveState: true, preserveScroll: true })}>Siguiente<ChevronRight /></Button></div></div>
                </div>
            </section>
            {formModal && <QuoteFormModal quote={formModal === 'new' ? null : formModal} products={products} onClose={() => setFormModal(null)} />}
            {emailQuote && <QuoteEmailModal quote={emailQuote} onClose={() => setEmailQuote(null)} />}
            {deleteQuote && <QuoteDeleteModal quote={deleteQuote} onClose={() => setDeleteQuote(null)} />}
        </AdminLayout>
    </>;
}
