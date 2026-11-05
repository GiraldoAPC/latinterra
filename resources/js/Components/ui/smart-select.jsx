import { Children, Fragment, forwardRef, isValidElement, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { cn } from '@/lib/utils';

export const selectText = (node) => typeof node === 'string' || typeof node === 'number' ? String(node) : Children.toArray(node).map((child) => isValidElement(child) ? selectText(child.props.children) : String(child ?? '')).join('');
const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();

function nativeOptions(children, group = '', groupDisabled = false) {
    return Children.toArray(children).flatMap((child) => {
        if (!isValidElement(child)) return [];
        if (child.type === Fragment) return nativeOptions(child.props.children, group, groupDisabled);
        if (child.type === 'optgroup') return nativeOptions(child.props.children, child.props.label, child.props.disabled);
        if (child.type !== 'option') return [];
        return [{ value: String(child.props.value ?? selectText(child.props.children)), label: child.props.children, text: selectText(child.props.children), disabled: groupDisabled || child.props.disabled, group }];
    });
}

/** Shared searchable combobox. A real, visually hidden select retains form validation/serialization. */
export const SmartSelect = forwardRef(function SmartSelect({ options = [], value, defaultValue, onValueChange, placeholder = 'Selecciona una opción', searchable, disabled = false, required = false, name, id, className, contentClassName, onBlur, onInvalid, ...props }, forwardedRef) {
    const generatedId = useId();
    const listId = `${generatedId}-list`;
    const [localValue, setLocalValue] = useState(defaultValue ?? options.find((item) => !item.disabled)?.value ?? '');
    const selectedValue = String(value !== undefined ? value ?? '' : localValue);
    const selected = options.find((item) => item.value === selectedValue);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(-1);
    const triggerRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const nativeRef = useRef(null);
    const canSearch = searchable ?? options.length > 6;
    const filtered = useMemo(() => options.filter((item) => normalize(item.text ?? selectText(item.label)).includes(normalize(query.trim()))), [options, query]);
    const enabled = filtered.map((item, index) => !item.disabled ? index : -1).filter((index) => index >= 0);
    const changeOpen = (next) => { setOpen(next); setQuery(''); setActive(-1); };
    useEffect(() => {
        if (!open) return;
        const current = filtered.findIndex((item) => item.value === selectedValue && !item.disabled);
        setActive(current >= 0 ? current : filtered.findIndex((item) => !item.disabled));
    }, [open, query, selectedValue]);
    useEffect(() => {
        if (open && active >= 0) listRef.current?.querySelector(`[data-option-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [active, open]);
    useEffect(() => { if (disabled) changeOpen(false); }, [disabled]);
    useEffect(() => {
        const form = nativeRef.current?.form;
        const reset = () => { if (value === undefined) setLocalValue(defaultValue ?? options.find((item) => !item.disabled)?.value ?? ''); changeOpen(false); };
        form?.addEventListener('reset', reset);
        return () => form?.removeEventListener('reset', reset);
    }, [value, defaultValue, options]);

    const choose = (item) => {
        if (!item || item.disabled || disabled) return;
        setLocalValue(item.value);
        if (item.value !== selectedValue) onValueChange?.(item.value);
        changeOpen(false);
    };
    const keys = (event) => {
        if (event.defaultPrevented) return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const at = enabled.indexOf(active);
            const offset = event.key === 'ArrowDown' ? 1 : -1;
            setActive(enabled[(at + offset + enabled.length) % enabled.length] ?? -1);
        } else if (event.key === 'Enter' && event.target.tagName !== 'BUTTON') {
            event.preventDefault(); choose(filtered[active]);
        } else if ((event.key === 'Home' || event.key === 'End') && event.target !== inputRef.current) {
            event.preventDefault(); setActive(event.key === 'Home' ? enabled[0] : enabled.at(-1));
        } else if (event.key === 'Tab') changeOpen(false);
        else if (!canSearch && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            const from = enabled.indexOf(active) + 1;
            const order = [...enabled.slice(from), ...enabled.slice(0, from)];
            const match = order.find((index) => normalize(filtered[index].text ?? selectText(filtered[index].label)).startsWith(normalize(event.key)));
            if (match !== undefined) { event.preventDefault(); setActive(match); }
        }
    };
    return <span className="lt-select-root relative block min-w-0">

        <Popover open={open} onOpenChange={changeOpen}>
            <PopoverTrigger asChild><button {...props} ref={(node) => { triggerRef.current = node; if (typeof forwardedRef === 'function') forwardedRef(node); else if (forwardedRef) forwardedRef.current = node; }} id={id} type="button" role="combobox" aria-expanded={open} aria-controls={listId} aria-haspopup="listbox" aria-required={required || undefined} disabled={disabled} onBlur={onBlur}
                onKeyDown={(event) => { props.onKeyDown?.(event); if (!event.defaultPrevented && ['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); changeOpen(true); } }}
                className={cn('lt-select-trigger min-h-10 w-full gap-2.5 rounded-xl border border-[#024A7D]/20 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition-all hover:border-[#00ADEE]/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00ADEE]/15 disabled:cursor-not-allowed disabled:opacity-50', open && 'border-[#00ADEE] ring-4 ring-[#00ADEE]/10', className, 'flex items-center')}>
                <SlidersHorizontal aria-hidden="true" className="lt-select-leading h-4 w-4 shrink-0 text-[#00ADEE]" />
                <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-slate-400')}>{selected?.label ?? placeholder}</span><ChevronDown aria-hidden="true" className={cn('lt-select-chevron h-4 w-4 shrink-0 text-[#024A7D]/60 transition-transform', open && 'rotate-180')} />
            </button></PopoverTrigger>
            <PopoverContent data-select-popup align="start" sideOffset={7} collisionPadding={12} onEscapeKeyDown={(event) => { event.preventDefault(); event.stopPropagation(); changeOpen(false); }} className={cn('lt-select-content z-[80] flex max-h-[var(--radix-popover-content-available-height)] w-[var(--radix-popover-trigger-width)] min-w-40 max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-2xl border border-[#024A7D]/15 bg-white p-0 text-slate-700 shadow-[0_16px_48px_-12px_rgba(2,74,125,0.3)]', contentClassName)}
                onOpenAutoFocus={(event) => { event.preventDefault(); (canSearch ? inputRef.current : listRef.current)?.focus(); }} onKeyDown={keys}>
                {canSearch && <div className="flex items-center gap-2 border-b border-slate-100 bg-sky-50/60 px-3 py-2.5"><Search aria-hidden="true" className="h-4 w-4 shrink-0 text-[#00ADEE]" /><input ref={inputRef} aria-label="Buscar opciones" aria-controls={listId} aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined} className="lt-select-search min-w-0 flex-1 border-0 bg-transparent p-0 text-sm shadow-none outline-none focus:ring-0" placeholder="Escribe para buscar…" value={query} onChange={(event) => setQuery(event.target.value)} /><button type="button" aria-label="Limpiar búsqueda" className={cn('rounded-md p-1 text-slate-400 hover:bg-white', !query && 'invisible')} onClick={() => { setQuery(''); inputRef.current?.focus(); }}><X className="h-3.5 w-3.5" /></button></div>}
                <div ref={listRef} id={listId} role="listbox" tabIndex={-1} aria-label={props['aria-label'] ?? placeholder} aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined} className="min-h-0 max-h-72 overflow-y-auto overscroll-contain p-1.5 outline-none" onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(filtered[active]); } }}>
                    {!filtered.length && <div className="px-4 py-7 text-center text-sm text-slate-400">No se encontraron opciones</div>}
                    {filtered.map((item, index) => <Fragment key={`${item.value}-${index}`}>{item.group && filtered[index - 1]?.group !== item.group && <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.group}</p>}<div id={`${listId}-${index}`} role="option" aria-selected={item.value === selectedValue} aria-disabled={item.disabled || undefined} data-option-index={index} onMouseMove={() => !item.disabled && setActive(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(item)} className={cn('flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors', active === index && 'bg-sky-50 text-[#024A7D]', item.value === selectedValue && 'bg-[#eaf6fd] font-semibold text-[#024A7D]', item.disabled && 'pointer-events-none cursor-not-allowed opacity-40')}>
                        <span className="min-w-0 flex-1 break-words">{item.label}</span>{item.value === selectedValue && <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00ADEE] text-white"><Check className="h-3 w-3" /></span>}
                    </div></Fragment>)}
                </div>
                {canSearch && <div className="border-t border-slate-100 px-3 py-2 text-[10px] text-slate-400">{filtered.length} {filtered.length === 1 ? 'opción' : 'opciones'} · ↑ ↓ para navegar · Enter para elegir</div>}
            </PopoverContent>
        </Popover>
        <select ref={nativeRef} tabIndex={-1} aria-hidden="true" className="lt-select-native" style={{ position: 'absolute', width: 1, height: 1, padding: 0, border: 0, opacity: 0, overflow: 'hidden', clipPath: 'inset(50%)', pointerEvents: 'none' }} name={name} required={required} disabled={disabled} value={selectedValue} onFocus={() => triggerRef.current?.focus()} onClick={(event) => { event.preventDefault(); changeOpen(true); }} onChange={(event) => choose(options.find((item) => item.value === event.target.value))} onInvalid={(event) => { event.preventDefault(); onInvalid?.(event); triggerRef.current?.focus(); changeOpen(true); }}>
            {!options.some((item) => item.value === '') && <option value="" />}
            {options.map((item, index) => <option key={`${item.value}-${index}`} value={item.value} disabled={item.disabled}>{item.text ?? selectText(item.label)}</option>)}
        </select>
    </span>;
});

export const NativeSelect = forwardRef(function NativeSelect({ children, onChange, value, defaultValue, ...props }, ref) {
    return <SmartSelect {...props} ref={ref} options={nativeOptions(children)} value={value} defaultValue={defaultValue} onValueChange={(next) => onChange?.({ target: { value: next, name: props.name }, currentTarget: { value: next, name: props.name } })} />;
});
