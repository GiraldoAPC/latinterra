import { useEffect, useState } from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/Components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/Components/ui/popover";
import { Calendar } from "@/Components/ui/calendar";

/**
 * Date field the user can either type into directly (dd/mm/aaaa) or fill
 * via the calendar popup. Value/onChange use plain "yyyy-MM-dd" strings,
 * same as what the backend date columns already expect. Native
 * <input type="date"> can't be restyled - its calendar popup is drawn by
 * the OS - hence the custom picker.
 */
export function DatePicker({ id, value, onChange, placeholder = "dd/mm/aaaa", maxDate, minDate, disabled = false }) {
    const [open, setOpen] = useState(false);

    // El backend puede mandar solo "yyyy-MM-dd" o un timestamp ISO completo
    // ("2026-12-13T00:00:00.000000Z", segun el cast del modelo) - se toma
    // solo la parte de la fecha para no romper el parseo en el segundo caso.
    const datePart = value ? String(value).slice(0, 10) : "";
    const parsedValue = datePart ? parse(datePart, "yyyy-MM-dd", new Date()) : undefined;
    const selected = parsedValue && isValid(parsedValue) ? parsedValue : undefined;

    // Local text the user is typing, kept separate from `value` so partial
    // input ("12/0") isn't clobbered while they're still typing.
    const [text, setText] = useState(selected ? format(selected, "dd/MM/yyyy") : "");

    useEffect(() => {
        setText(selected ? format(selected, "dd/MM/yyyy") : "");
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-inserts the "/" separators as the user types digits, so free-form
    // input like "13041980" becomes "13/04/1980" instead of staying raw.
    const maskDate = (raw) => {
        const digits = raw.replace(/\D/g, "").slice(0, 8);
        const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
        return parts.join("/");
    };

    const commitText = (raw) => {
        const trimmed = raw.trim();
        if (!trimmed) {
            onChange("");
            return;
        }
        const parsed = parse(trimmed, "dd/MM/yyyy", new Date());
        if (isValid(parsed)) {
            onChange(format(parsed, "yyyy-MM-dd"));
        }
        // If invalid, leave `value` untouched - the useEffect above will
        // reset the visible text back to the last valid value on blur.
    };

    const handleTextChange = (raw) => {
        const masked = maskDate(raw);
        setText(masked);
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(masked)) {
            commitText(masked);
        }
    };

    return (
        <div className="relative">
            <Input
                id={id}
                inputMode="numeric"
                value={text}
                placeholder={placeholder}
                className="pr-9"
                disabled={disabled}
                onChange={(e) => handleTextChange(e.target.value)}
                onBlur={(e) => commitText(e.target.value)}
            />
            <Popover open={open && !disabled} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        disabled={disabled}
                        aria-label="Abrir calendario"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:bg-[#00ADEE]/10 hover:text-[#024A7D] disabled:pointer-events-none disabled:opacity-40"
                    >
                        <CalendarIcon className="h-4 w-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent align="end" className={cn("z-[60]")}>
                    <Calendar
                        mode="single"
                        locale={es}
                        selected={selected}
                        defaultMonth={selected ?? maxDate ?? new Date(2000, 0)}
                        disabled={(date) => (maxDate && date > maxDate) || (minDate && date < minDate)}
                        onSelect={(date) => {
                            onChange(date ? format(date, "yyyy-MM-dd") : "");
                            setOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
