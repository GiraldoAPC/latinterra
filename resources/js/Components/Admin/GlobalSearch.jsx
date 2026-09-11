import { useEffect, useRef, useState } from "react";
import { Link } from "@inertiajs/react";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { Search, GraduationCap, ChevronRight, X, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function initialsOf(name) {
    return (name || "U")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
}

/**
 * Buscador global de la barra superior del panel admin. Busca estudiantes
 * por nombre, apellido, correo o DNI mientras el usuario escribe, y muestra
 * los resultados agrupados en un panel flotante debajo del input.
 */
export default function GlobalSearch() {
    const [query, setQuery] = useState("");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const boxRef = useRef(null);

    useEffect(() => {
        const term = query.trim();
        if (term === "") {
            setStudents([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timeout = setTimeout(() => {
            window.axios
                .get("/admin/buscar", { params: { q: term } })
                .then((res) => setStudents(res.data.students ?? []))
                .catch(() => setStudents([]))
                .finally(() => setLoading(false));
        }, 250);

        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        function onClickOutside(e) {
            if (boxRef.current && !boxRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const showPanel = open && query.trim() !== "";

    return (
        <div ref={boxRef} className="relative w-full">
            <div
                className={cn(
                    "relative flex items-center rounded-md transition-shadow",
                    showPanel && "ring-2 ring-[#00ADEE]/30"
                )}
            >
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar estudiantes..."
                    className={cn("pl-8 pr-8", showPanel && "border-[#00ADEE]/50")}
                    value={query}
                    onFocus={() => setOpen(true)}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                />
                {query !== "" && (
                    <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Limpiar"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {showPanel && (
                <div className="absolute left-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border bg-popover shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {loading && (
                        <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Buscando...
                        </div>
                    )}

                    {!loading && students.length === 0 && (
                        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <Users className="h-4 w-4" />
                            </span>
                            <p className="text-sm text-muted-foreground">
                                Sin resultados para <span className="font-medium text-foreground">"{query}"</span>
                            </p>
                        </div>
                    )}

                    {!loading && students.length > 0 && (
                        <div className="max-h-96 overflow-y-auto">
                            <div className="flex items-center justify-between px-3.5 pb-1.5 pt-3">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Estudiantes
                                </span>
                                <Badge variant="secondary" className="h-4.5 px-1.5 text-[10px] font-semibold">
                                    {students.length}
                                </Badge>
                            </div>
                            <div className="pb-1.5">
                                {students.map((s) => (
                                    <Link
                                        key={s.id}
                                        href={`/admin/estudiantes/${s.id}/perfil`}
                                        onClick={() => setOpen(false)}
                                        className="lt-hover-sweep group/result mx-1.5 flex items-center gap-3 rounded-lg px-2.5 py-2"
                                        style={{ "--lt-sweep-color": "rgba(0, 173, 238, 0.08)" }}
                                    >
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#00ADEE] to-[#024A7D] text-xs font-bold leading-none text-white shadow-sm ring-2 ring-white">
                                            {s.avatar_url ? (
                                                <img src={s.avatar_url} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                initialsOf(s.name)
                                            )}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold leading-tight text-[#024A7D]">
                                                {s.name}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-2">
                                                {s.course_title ? (
                                                    <span className="flex min-w-0 items-center gap-1 truncate text-xs leading-tight text-sky-600">
                                                        <GraduationCap className="h-3 w-3 shrink-0" />
                                                        <span className="truncate">{s.course_title}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-xs leading-tight text-muted-foreground">Sin curso</span>
                                                )}
                                                <span className="text-muted-foreground/40">•</span>
                                                <span className="shrink-0 text-[11px] leading-tight text-muted-foreground">
                                                    DNI {s.dni || "—"}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover/result:translate-x-0.5 group-hover/result:text-[#024A7D]" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
