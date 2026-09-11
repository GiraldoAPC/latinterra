import { useEffect, useRef, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/Components/ui/popover";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";

/**
 * Select de pais (catalogo ISO completo, 246 paises) con buscador: un
 * select normal seria muy lento de recorrer para encontrar uno. Al abrir,
 * el foco va directo al campo de busqueda para poder tipear de una.
 */
export function CountrySelect({ value, onChange, onLoad, error }) {
    const [paises, setPaises] = useState([]);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        window.axios.get("/ubigeo/paises").then((res) => {
            setPaises(res.data);
            onLoad?.(res.data);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selected = paises.find((p) => String(p.id) === String(value));
    const filtered = query.trim()
        ? paises.filter((p) => p.nombre.toLowerCase().includes(query.trim().toLowerCase()))
        : paises;

    return (
        <div>
            <Label htmlFor="pais_id" className="text-xs text-muted-foreground">
                Pais
            </Label>
            <div className="mt-1">
                <Popover
                    open={open}
                    onOpenChange={(v) => {
                        setOpen(v);
                        if (v) setQuery("");
                    }}
                >
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            id="pais_id"
                            className={cn(
                                "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-all hover:border-[#00ADEE]/50 focus-visible:border-[#00ADEE] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00ADEE]/15",
                                !selected && "text-muted-foreground"
                            )}
                        >
                            <span className="truncate">{selected ? selected.nombre : "Selecciona"}</span>
                            <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        align="start"
                        className="w-[--radix-popover-trigger-width] p-0"
                        onOpenAutoFocus={(e) => {
                            e.preventDefault();
                            inputRef.current?.focus();
                        }}
                    >
                        <div className="relative border-b p-1.5">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar pais..."
                                className="h-8 pl-8"
                            />
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1">
                            {filtered.length === 0 && (
                                <p className="px-2 py-4 text-center text-xs text-muted-foreground">Sin resultados.</p>
                            )}
                            {filtered.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(String(p.id));
                                        setOpen(false);
                                    }}
                                    className={cn(
                                        "lt-hover-sweep flex w-full items-center rounded-sm px-2.5 py-1.5 text-left text-sm",
                                        String(p.id) === String(value) && "font-semibold text-[#024A7D]"
                                    )}
                                >
                                    {p.nombre}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
    );
}

/**
 * Departamento -> Provincia -> Distrito en cascada, con datos reales de
 * Peru (ver UbigeoSeeder). Cada nivel se pide al backend recien cuando
 * hace falta (no se manda el catalogo completo de una sola vez).
 *
 * `initialDepartamentoId`/`initialProvinciaId`: solo hacen falta al editar
 * un registro que ya tiene distrito guardado, para poder mostrar los 3
 * selects ya completos (el distrito solo no alcanza para saber su cadena
 * de padres sin una consulta aparte, asi que el backend la manda directo).
 */
export function DistrictSelect({ distritoId, onChange, initialDepartamentoId, initialProvinciaId, error }) {
    const [departamentoId, setDepartamentoId] = useState(initialDepartamentoId ?? "");
    const [provinciaId, setProvinciaId] = useState(initialProvinciaId ?? "");

    const [departamentos, setDepartamentos] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [distritos, setDistritos] = useState([]);

    useEffect(() => {
        window.axios.get("/ubigeo/departamentos").then((res) => setDepartamentos(res.data));
    }, []);

    useEffect(() => {
        if (!departamentoId) {
            setProvincias([]);
            return;
        }
        window.axios
            .get("/ubigeo/provincias", { params: { departamento_id: departamentoId } })
            .then((res) => setProvincias(res.data));
    }, [departamentoId]);

    useEffect(() => {
        if (!provinciaId) {
            setDistritos([]);
            return;
        }
        window.axios
            .get("/ubigeo/distritos", { params: { provincia_id: provinciaId } })
            .then((res) => setDistritos(res.data));
    }, [provinciaId]);

    return (
        <>
            <div>
                <Label className="text-xs text-muted-foreground">Departamento</Label>
                <div className="mt-1">
                    <Select
                        value={departamentoId ? String(departamentoId) : undefined}
                        onValueChange={(v) => {
                            setDepartamentoId(v);
                            setProvinciaId("");
                            onChange("");
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                            {departamentos.map((d) => (
                                <SelectItem key={d.id} value={String(d.id)}>
                                    {d.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label className="text-xs text-muted-foreground">Provincia</Label>
                <div className="mt-1">
                    <Select
                        value={provinciaId ? String(provinciaId) : undefined}
                        onValueChange={(v) => {
                            setProvinciaId(v);
                            onChange("");
                        }}
                        disabled={!departamentoId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                            {provincias.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                    {p.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label className="text-xs text-muted-foreground">Distrito</Label>
                <div className="mt-1">
                    <Select
                        value={distritoId ? String(distritoId) : undefined}
                        onValueChange={(v) => onChange(v)}
                        disabled={!provinciaId}
                    >
                        <SelectTrigger id="distrito_id">
                            <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                            {distritos.map((d) => (
                                <SelectItem key={d.id} value={String(d.id)}>
                                    {d.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
            </div>
        </>
    );
}
