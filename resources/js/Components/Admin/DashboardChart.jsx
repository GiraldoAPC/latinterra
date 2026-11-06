import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BarChart3 } from 'lucide-react';

export const cashFormat = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(amount);
export const dashboardSources = [
    { key: 'sales', label: 'Ventas y otros', color: '#0866ff' },
    { key: 'installments', label: 'Cuotas de cursos', color: '#00ADEE' },
    { key: 'orders', label: 'Pedidos pagados', color: '#08c77b' },
];
const dayLabel = (value) => value.slice(5).split('-').reverse().join('/');

export default function DashboardChart({ days }) {
    const [active, setActive] = useState(null);
    const [chartWidth, setChartWidth] = useState(960);
    const chartRef = useRef(null);
    useEffect(() => setActive(null), [days[0]?.date]);
    useEffect(() => {
        const observer = new ResizeObserver(([entry]) => setChartWidth(Math.max(280, entry.contentRect.width)));
        if (chartRef.current) observer.observe(chartRef.current);
        return () => observer.disconnect();
    }, []);
    const maximum = Math.max(1, ...days.map((day) => day.total));
    const selected = active === null ? null : days[active];
    const left = 44, width = chartWidth - 68, baseline = 200, height = 170;
    const step = width / Math.max(1, days.length);
    const empty = days.every((day) => day.total === 0);
    return <>
        <div className="lt-dash-chart-heading mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold text-[#024A7D]"><BarChart3 className="h-4 w-4 text-[#00ADEE]" />Evolución de cobros</h2><p className="mt-1 text-xs text-slate-400">Pagos confirmados, agrupados por día en Perú</p></div><div aria-live="polite" className="text-right"><p className="inline-flex items-center gap-2 text-xs text-slate-400">{selected ? dayLabel(selected.date) : <>Explora cada día <ArrowRight className="h-4 w-4" /></>}</p><p className="mt-0.5 min-h-6 text-lg font-bold text-[#024A7D]">{selected ? cashFormat(selected.total) : '—'}</p></div></div>
        <div ref={chartRef} tabIndex={0} role="group" aria-label="Gráfico de cobros diarios. Usa las flechas izquierda y derecha para consultar cada día." className="relative rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#00ADEE]/30" onKeyDown={(event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            setActive((index) => event.key === 'Home' ? 0 : event.key === 'End' ? days.length - 1 : Math.max(0, Math.min(days.length - 1, (index ?? days.length - 1) + (event.key === 'ArrowLeft' ? -1 : 1))));
        }}>
            <svg viewBox={`0 0 ${chartWidth} 244`} className="block w-full" aria-hidden="true" onMouseLeave={() => setActive(null)} onMouseMove={(event) => {
                const box = event.currentTarget.getBoundingClientRect();
                const x = (event.clientX - box.left) / box.width * chartWidth;
                setActive(Math.max(0, Math.min(days.length - 1, Math.floor((x - left) / step))));
            }} onTouchStart={(event) => {
                const box = event.currentTarget.getBoundingClientRect();
                const x = (event.touches[0].clientX - box.left) / box.width * chartWidth;
                setActive(Math.max(0, Math.min(days.length - 1, Math.floor((x - left) / step))));
            }}>
                {[0, .5, 1].map((ratio) => <g key={ratio}><line x1={left} y1={baseline - height * ratio} x2={left + width} y2={baseline - height * ratio} stroke="#e8f0f5" strokeDasharray={ratio ? '4 5' : undefined} /><text x={left - 8} y={baseline - height * ratio + 4} textAnchor="end" fill="#94a3b8" fontSize="10">{new Intl.NumberFormat('es-PE', { notation: 'compact', maximumFractionDigits: 1 }).format(maximum * ratio)}</text></g>)}
                {days.map((day, index) => {
                    let accumulated = 0;
                    return <g key={day.date}><title>{`${dayLabel(day.date)}: ${cashFormat(day.total)}`}</title>{active === index && <rect x={left + index * step} y={20} width={step} height={baseline - 16} fill="#eaf7fe" rx={3} />}{dashboardSources.map((source) => {
                        const barHeight = day[source.key] / maximum * height;
                        const y = baseline - accumulated - barHeight;
                        accumulated += barHeight;
                        return <rect key={source.key} x={left + index * step + step * .18} y={y} width={Math.max(1, step * .64)} height={barHeight} fill={source.color} rx={2} />;
                    })}</g>;
                })}
                {[0, Math.floor((days.length - 1) / 2), days.length - 1].map((index) => <text key={index} x={left + (index + .5) * step} y={225} textAnchor="middle" fill="#94a3b8" fontSize="11">{dayLabel(days[index].date)}</text>)}
            </svg>
            {empty && <div className="lt-dash-chart-empty pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 text-center"><span><BarChart3 /></span><p>Sin cobros registrados en este período</p></div>}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">{dashboardSources.map((source) => <span key={source.key} className="inline-flex items-center gap-2 text-[11px] text-slate-500"><span className="h-2 w-2 rounded-full" style={{ background: source.color }} />{source.label}{selected && <strong className="font-medium text-[#024A7D]">{cashFormat(selected[source.key])}</strong>}</span>)}</div>
    </>;
}
