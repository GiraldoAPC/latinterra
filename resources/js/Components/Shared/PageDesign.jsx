import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';

export const primaryButtonClass = 'h-11 rounded-xl bg-gradient-to-br from-[#00ADEE] via-[#026698] to-[#024A7D] px-5 font-semibold text-white shadow-lg shadow-[#024A7D]/15 hover:brightness-110';
export const inputClass = 'mt-1.5 block h-10 w-full rounded-xl border border-[#024A7D]/20 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-[#00ADEE] focus:outline-none focus:ring-2 focus:ring-[#00ADEE]/15';

export function PageIcon({ icon: Icon = FileText, small = false, className }) {
    return <span aria-hidden="true" className={cn('lt-admin-icon shrink-0 rounded-2xl bg-gradient-to-br from-[#00ADEE] to-[#024A7D] text-white shadow-lg shadow-[#024A7D]/20', small ? 'h-10 w-10 rounded-xl' : 'h-14 w-14 sm:h-16 sm:w-16', className)}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 0 }}>
        <Icon className={small ? 'h-5 w-5 stroke-[1.5]' : 'h-7 w-7 stroke-[1.5]'} style={{ display: 'block', flexShrink: 0, margin: 0 }} />
    </span>;
}

export function PageHeader({ title, description, icon, actions, className }) {
    return <header className={cn('lt-admin-page-header relative isolate mb-6 overflow-hidden rounded-3xl border border-[#024A7D]/10 bg-gradient-to-r from-white via-sky-50/70 to-[#e3f4fc] px-5 py-7 sm:px-8 sm:py-8', className)}>
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full" viewBox="0 0 1200 180" preserveAspectRatio="none"><path d="M480 180C670 70 730 150 860 0H1200V180Z" fill="#00ADEE" fillOpacity=".08" /><path d="M700 180C850 100 1000 110 1100 0H1200V180Z" fill="#024A7D" fillOpacity=".06" /></svg>
        <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5"><PageIcon icon={icon} /><div className="min-w-0 border-l border-[#024A7D]/15 pl-4 sm:pl-5"><h1 className="text-2xl font-bold tracking-tight text-[#024A7D] sm:text-3xl">{title}</h1>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div></div>
            {actions && <div className="lt-admin-header-actions flex w-full flex-wrap items-center gap-2 sm:w-auto">{actions}</div>}
        </div>
    </header>;
}

export function Surface({ children, className, ...props }) {
    return <section className={cn('lt-admin-panel overflow-hidden rounded-3xl border border-[#024A7D]/10 bg-white shadow-[0_12px_40px_-18px_rgba(2,74,125,0.3)]', className)} {...props}>{children}</section>;
}

export function EmptyState({ icon: Icon = FileText, title, description, actions }) {
    return <div className="flex flex-col items-center gap-3 px-5 py-12 text-center"><span className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-50 text-[#00ADEE]"><Icon className="h-11 w-11 stroke-[1.5]" /></span><p className="text-lg font-semibold text-[#024A7D]">{title}</p>{description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}{actions && <div className="mt-2">{actions}</div>}</div>;
}

export function FormModal({ open, onClose, title, description, icon, processing = false, children, className }) {
    return <Dialog open={open} onOpenChange={(value) => { if (!value && !processing) onClose(); }}>
        <DialogContent className={cn('max-w-3xl gap-0 rounded-3xl p-0 sm:rounded-3xl', className)} showClose={!processing}>
            <DialogHeader className="shrink-0 border-b border-[#024A7D]/10 bg-gradient-to-r from-sky-50 to-white px-6 py-5 pr-12 text-left"><DialogTitle className="flex items-center gap-3 text-xl text-[#024A7D]"><PageIcon icon={icon} small />{title}</DialogTitle>{description && <DialogDescription>{description}</DialogDescription>}</DialogHeader>
            <div className="min-h-0 overflow-y-auto px-6 py-5">{children}</div>
        </DialogContent>
    </Dialog>;
}
