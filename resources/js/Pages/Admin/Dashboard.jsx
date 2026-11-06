import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageHeader, Surface } from '@/Components/Shared/PageDesign';
import { SmartSelect } from '@/Components/ui/smart-select';
import { Button } from '@/Components/ui/button';
import DashboardChart, { cashFormat, dashboardSources } from '@/Components/Admin/DashboardChart';
import { Banknote, GraduationCap, FileText, Award, RefreshCw, LayoutDashboard, ArrowUpRight, ArrowUp, ArrowDown, Clock3, Package, CalendarDays, AlertCircle, Users, CheckCircle2, Info, Layers, ChevronRight } from 'lucide-react';

const date = (value) => value ? value.slice(0, 10).split('-').reverse().join('/') : 'Sin fecha';
const count = (value) => new Intl.NumberFormat('es-PE').format(value);

function Metric({ icon: Icon, title, value, children, tone = 'blue' }) {
    return <Surface className="lt-dash-metric" data-tone={tone}>
        <svg className="lt-dash-metric-wave" aria-hidden="true" viewBox="0 0 400 100" preserveAspectRatio="none"><path d="M90 100C230 99 239 42 400 4V100Z" fill="currentColor" opacity=".07" /><path d="M207 100C290 57 325 85 400 37V100Z" fill="currentColor" opacity=".10" /></svg>
        <span className="lt-dash-metric-icon"><Icon /></span><span className="lt-dash-metric-title">{title}</span><p className="lt-dash-metric-value">{value}</p><div className="lt-dash-metric-detail">{children}</div>
    </Surface>;
}
function Panel({ title, icon: Icon, href, children, subtitle }) {
    return <Surface className="lt-dash-panel p-5 sm:p-6"><div className="lt-dash-panel-heading mb-4 flex items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-sm font-semibold text-[#024A7D]"><Icon className="h-4 w-4 shrink-0 text-[#00ADEE]" />{title}</h2>{subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}</div>{href && <Link href={href} aria-label={`Ver ${title}`} className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-sky-50 hover:text-[#024A7D]"><ArrowUpRight className="h-4 w-4" /></Link>}</div>{children}</Surface>;
}
function Empty({ children }) { return <div className="flex items-center gap-2 rounded-xl bg-sky-50/50 px-4 py-6 text-xs text-slate-400"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#00ADEE]" />{children}</div>; }

export default function AdminDashboard({ dashboard: data }) {
    const { settings } = usePage().props;
    const [busy, setBusy] = useState(false);
    const loading = useRef(false);
    const finish = () => { loading.current = false; setBusy(false); };
    const refresh = useCallback(() => {
        if (loading.current) return;
        loading.current = true; setBusy(true);
        router.reload({ only: ['dashboard'], onFinish: () => { loading.current = false; setBusy(false); } });
    }, []);
    useEffect(() => {
        const timer = setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 60000);
        return () => clearInterval(timer);
    }, [refresh]);
    const changePeriod = (period) => {
        if (loading.current) return;
        loading.current = true; setBusy(true);
        router.get('/admin', { period }, { only: ['dashboard'], preserveState: true, preserveScroll: true, onFinish: finish });
    };
    const { cash, activity, attention, academic } = data;
    const change = cash.change_percent;
    const pending = [
        { label: 'Pedidos por confirmar', value: attention.pending_orders, href: '/admin/ventas/pedidos?status=pending' },
        { label: 'Cotizaciones listas para vender', value: attention.ready_quotes, href: '/admin/quotes?status=approved' },
        { label: 'Productos con stock bajo', value: attention.low_stock, href: '/admin/products' },
        { label: 'Certificados por vencer (30 días)', value: attention.expiring_certificates, href: '/admin/cursos/certificados' },
    ];
    return <><Head title="Dashboard de resultados" /><AdminLayout title="Dashboard"><div className="lt-results-dashboard">
        <PageHeader className="lt-dash-hero" icon={LayoutDashboard} title="Resumen de resultados" description={<span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0" />{date(data.period.start)} al {date(data.period.end)} · Horario de Perú</span>} actions={<>
            <div className="w-full sm:w-44 [&>span]:w-full"><SmartSelect aria-label="Período del dashboard" disabled={busy} value={String(data.period.days)} onValueChange={changePeriod} options={[7, 30, 90].map((days) => ({ value: String(days), label: `Últimos ${days} días`, text: `Últimos ${days} días` }))} /></div>
            <Button variant="outline" className="lt-dash-refresh" disabled={busy} onClick={refresh}><RefreshCw className={busy ? 'animate-spin' : ''} />Actualizar</Button>
        </>} />
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={Banknote} title="Cobros registrados" value={cashFormat(cash.total)}>{change === null ? <span>Sin base de comparación anterior</span> : <span className={`inline-flex items-center gap-1 font-medium ${change > 0 ? 'text-emerald-600' : change < 0 ? 'text-amber-700' : 'text-slate-500'}`}>{change < 0 ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}{Math.abs(change)}% <span className="font-normal text-slate-400">vs. período anterior</span></span>}</Metric>
            <Metric tone="violet" icon={GraduationCap} title="Matrículas nuevas" value={count(activity.enrollments)}>{count(activity.previous_enrollments)} en el período anterior</Metric>
            <Metric tone="green" icon={Award} title="Certificados emitidos" value={count(activity.certificates)}>Virtuales y presenciales · Antes: {count(activity.previous_certificates)}</Metric>
            <Metric tone="orange" icon={FileText} title="Cotizaciones creadas" value={count(activity.quotes)}>{count(activity.quotes_converted)} con venta confirmada, sin anulaciones</Metric>
        </div>
        <div className="mb-5 grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
            <Surface className="min-w-0 p-5 sm:p-6"><DashboardChart days={cash.daily} /></Surface>
            <Panel title="Origen de los cobros" icon={Layers} subtitle={`${count(cash.count)} pagos registrados en el período`}>
                <div className="lt-dash-sources space-y-4">{cash.sources.map((source) => <div key={source.key}><div className="mb-2 flex justify-between gap-3 text-xs"><span className="inline-flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-full" style={{ background: dashboardSources.find((item) => item.key === source.key).color }} />{source.label}</span><strong className="whitespace-nowrap font-semibold text-[#024A7D]">{cashFormat(source.amount)}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-50"><div className="h-full rounded-full" style={{ background: dashboardSources.find((item) => item.key === source.key).color, width: `${cash.total ? source.amount / cash.total * 100 : 0}%` }} /></div></div>)}</div>
                <div className="lt-dash-costs mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4"><div><p className="text-[11px] text-slate-400">Compras registradas</p><p className="mt-1 text-sm font-semibold text-[#024A7D]">{cashFormat(cash.purchases)}</p></div><div><p className="text-[11px] text-slate-400">Costo de auspicios</p><p className="mt-1 text-sm font-semibold text-[#024A7D]">{cashFormat(cash.sponsorships)}</p></div></div>
                <p className="lt-dash-info mt-3 text-[10px] leading-relaxed text-slate-400"><Info className="h-4 w-4 shrink-0" />Las compras y los auspicios son cifras separadas; este resumen no calcula utilidad.</p>
            </Panel>
        </div>
        <div className="lt-dash-section-title mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold text-[#024A7D]">Estado actual y pendientes de atención</h2><p className="text-[11px] text-slate-400">Estas alertas no dependen del período seleccionado</p></div>
        <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
            <Panel title="Cuotas vencidas o que vencen hoy" icon={Clock3} subtitle={`${count(attention.overdue_count)} pendientes · ${cashFormat(attention.overdue_amount)}`}>
                {!data.overdue.length ? <Empty>No hay cuotas pendientes vencidas ni con vencimiento hoy.</Empty> : <div className="overflow-x-auto"><table className="w-full min-w-[490px] text-left text-xs"><thead><tr><th>Estudiante / curso</th><th>Vencimiento</th><th className="text-right">Importe</th></tr></thead><tbody>{data.overdue.map((item) => <tr key={item.id}><td className="px-4 py-3"><Link href={item.href} className="font-semibold text-[#024A7D] hover:underline">{item.student}</Link><p className="mt-1 text-[11px] text-slate-400">{item.course}</p></td><td className="px-4 py-3 text-amber-700">{date(item.due_date)}</td><td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-[#024A7D]">{cashFormat(item.amount)}</td></tr>)}</tbody></table></div>}
            </Panel>
            <Panel title="Atención comercial y operativa" icon={AlertCircle}>
                <div className="space-y-1">{pending.map((item) => <Link key={item.label} href={item.href} className="lt-dash-pending-link flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-sky-50"><span className="text-xs text-slate-500">{item.label}</span><span className={`ml-auto inline-flex min-w-7 items-center justify-center rounded-full px-2 py-1 text-xs font-bold ${item.value ? 'bg-amber-50 text-amber-800' : 'bg-sky-50 text-[#024A7D]'}`}>{count(item.value)}</span><ChevronRight className="h-4 w-4 text-[#0d2156]" /></Link>)}</div>
            </Panel>
        </div>
        <Surface className="mb-5 grid grid-cols-2 gap-5 p-5 lg:grid-cols-4">{[
            ['Estudiantes activos', academic.active_students, Users], ['Cursos publicados', academic.published_courses, GraduationCap],
            ['Matrículas en curso', academic.active_enrollments, Clock3], ['Matrículas completadas', academic.completed_enrollments, CheckCircle2],
        ].map(([label, value, Icon]) => <div key={label} className="flex items-center gap-3"><span className="rounded-xl bg-sky-50 p-2.5 text-[#00ADEE]"><Icon className="h-4 w-4" /></span><div><p className="text-lg font-bold text-[#024A7D]">{count(value)}</p><p className="text-[11px] text-slate-400">{label}</p></div></div>)}</Surface>
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
            <Panel title="Cotizaciones aprobadas y vigentes" icon={FileText} href="/admin/quotes?status=approved" subtitle="Hasta cinco documentos pendientes de convertir en venta">
                {!data.ready_quotes.length ? <Empty>No hay cotizaciones aprobadas pendientes de venta.</Empty> : <div className="divide-y divide-slate-100">{data.ready_quotes.map((quote) => <Link key={quote.id} href={quote.href} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="text-xs font-semibold text-[#024A7D]">{quote.code}</p><p className="mt-1 truncate text-xs text-slate-500">{quote.buyer}</p><p className="mt-1 text-[10px] text-slate-400">{quote.valid_until ? `Vence: ${date(quote.valid_until)}` : 'Sin fecha límite'}</p></div><strong className="whitespace-nowrap text-sm text-[#024A7D]">{cashFormat(quote.amount)}</strong></Link>)}</div>}
            </Panel>
            <Panel title="Stock por reponer" icon={Package} href="/admin/products" subtitle="Existencias disponibles en ventas por debajo del mínimo o iguales a él">
                {!data.low_stock.length ? <Empty>No hay productos activos con stock bajo.</Empty> : <div className="divide-y divide-slate-100">{data.low_stock.map((product) => <div key={product.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-xs font-medium text-[#024A7D]">{product.name}</p><p className="mt-1 text-[11px] text-slate-400">Mínimo: {product.min_stock ?? 5}{settings?.warehouseMode ? ` · Almacén: ${product.stock_warehouse}` : ''}</p></div><span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">{product.stock} en ventas</span></div>)}</div>}
            </Panel>
            <Panel title="Certificados por vencer" icon={Award} href="/admin/cursos/certificados" subtitle="Próximos 30 días · los cinco vencimientos más cercanos">
                {!data.expiring_certificates.length ? <Empty>No hay certificados próximos a vencer en 30 días.</Empty> : <div className="divide-y divide-slate-100">{data.expiring_certificates.map((certificate) => <Link key={certificate.code} href={certificate.href} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-xs font-semibold text-[#024A7D]">{certificate.student}</p><p className="mt-1 truncate text-[11px] text-slate-400">{certificate.course} · {certificate.modality}</p></div><span className="shrink-0 text-xs font-medium text-amber-700">{new Date(certificate.expires_at).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}</span></Link>)}</div>}
            </Panel>
            <Panel title="Próximas capacitaciones presenciales" icon={CalendarDays} href="/admin/cursos/presenciales" subtitle="Grupos programados para los próximos 14 días">
                {!data.upcoming.length ? <Empty>No hay capacitaciones programadas en los próximos 14 días.</Empty> : <div className="divide-y divide-slate-100">{data.upcoming.map((session) => <Link key={session.id} href={session.href} className="flex items-start justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-xs font-semibold text-[#024A7D]">{session.title}</p><p className="mt-1 truncate text-[11px] text-slate-400">{session.course} · {session.location}</p><p className="mt-1 text-[11px] text-slate-500">{new Date(session.starts_at).toLocaleString('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p></div><span className="shrink-0 rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-[#024A7D]">{session.participants}/{session.capacity}</span></Link>)}</div>}
            </Panel>
        </div>
        <p className="mt-5 text-right text-[10px] text-slate-400">Actualizado {new Date(data.generated_at).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit' })} · Actualización automática cada minuto mientras esta pestaña esté visible</p>
    </div></AdminLayout></>;
}
