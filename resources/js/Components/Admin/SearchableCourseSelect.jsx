import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Select con filtro de texto para elegir un curso entre muchos - un
 * <select>/<SelectContent> plano se vuelve inmanejable apenas el catalogo de
 * cursos crece. Filtra en el cliente sobre la lista ya cargada (no hay
 * busqueda al servidor, no hace falta para listas de este tamano).
 */
export default function SearchableCourseSelect({ courses, value, onChange, placeholder = "Sin requisito", allowEmpty = true }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const selected = courses.find((c) => String(c.id) === String(value));

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return courses;
        return courses.filter((c) => c.title.toLowerCase().includes(q));
    }, [courses, query]);

    const select = (id) => {
        onChange(id);
        setOpen(false);
        setQuery("");
    };

    return (
        <Popover
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (!v) setQuery("");
            }}
        >
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-muted/50"
                >
                    <span className={cn("truncate", !selected && "text-muted-foreground")}>
                        {selected ? selected.title : placeholder}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 max-w-[90vw] p-0" align="start">
                <div className="flex items-center gap-2 border-b px-3 py-2">
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar curso..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                    {allowEmpty && (
                        <button
                            type="button"
                            onClick={() => select("")}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                            Sin requisito
                            {!value && <Check className="h-3.5 w-3.5 text-[#00ADEE]" />}
                        </button>
                    )}
                    {filtered.length === 0 && <p className="px-3 py-2 text-xs text-muted-foreground">Sin resultados.</p>}
                    {filtered.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => select(String(c.id))}
                            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                            <span className="truncate">{c.title}</span>
                            {String(value) === String(c.id) && <Check className="h-3.5 w-3.5 shrink-0 text-[#00ADEE]" />}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
