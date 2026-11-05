import { SmartSelect } from '@/Components/ui/smart-select';
import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { Label } from "@/Components/ui/label";

/**
 * Select de pais (catalogo ISO completo, 246 paises) con buscador: un
 * select normal seria muy lento de recorrer para encontrar uno. Al abrir,
 * el foco va directo al campo de busqueda para poder tipear de una.
 */
export function CountrySelect({ value, onChange, onLoad, error }) {
    const [paises, setPaises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    useEffect(() => {
        let cancelled = false;
        window.axios.get('/ubigeo/paises').then((response) => {
            if (cancelled) return;
            setPaises(response.data); onLoad?.(response.data);
        }).catch(() => { if (!cancelled) setLoadError(true); }).finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);
    return <div><Label htmlFor="pais_id" className="text-xs text-muted-foreground">País</Label><div className="mt-1"><SmartSelect id="pais_id" searchable disabled={loading} value={String(value ?? '')} onValueChange={onChange} placeholder={loading ? 'Cargando países…' : 'Selecciona un país'} options={paises.map((country) => ({ value: String(country.id), label: country.nombre, text: country.nombre }))} /></div>{(error || loadError) && <p className="mt-1 text-xs text-destructive">{error || 'No se pudieron cargar los países. Recarga la página para intentarlo de nuevo.'}</p>}</div>;
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
