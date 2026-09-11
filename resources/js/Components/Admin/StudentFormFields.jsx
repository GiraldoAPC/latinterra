import { useEffect, useState } from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Switch } from "@/Components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { DatePicker } from "@/Components/ui/date-picker";
import { DistrictSelect, CountrySelect } from "@/Components/ui/district-select";
import { UserCircle, Building2, HeartPulse, ShieldCheck } from "lucide-react";

function SectionHeading({ icon: Icon, title, color = "green" }) {
    const colors = {
        green: "bg-[#00ADEE]/10 text-[#024A7D]",
        blue: "bg-sky-500/10 text-sky-600",
        red: "bg-red-500/10 text-red-600",
        amber: "bg-amber-500/10 text-amber-600",
    };
    return (
        <div className="mb-3 flex items-center gap-2">
            <span className={`box-border flex h-7 w-7 shrink-0 items-center justify-center rounded-md leading-none ${colors[color]}`}>
                <Icon className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold">{title}</h3>
        </div>
    );
}

// Devuelve la fecha mas reciente permitida para "hoy - N anios", o
// undefined si el curso elegido no tiene edad minima configurada.
function maxBirthDateFor(minAge) {
    if (!minAge) return undefined;
    const d = new Date();
    d.setFullYear(d.getFullYear() - minAge);
    return d;
}

// Los campos de nombre (persona) no deben aceptar digitos: filtra numeros
// y simbolos raros, dejando solo letras (con tildes/ene), espacios,
// guiones y apostrofes (para nombres compuestos como "D'Angelo").
function sanitizeName(value) {
    return value.replace(/[^A-Za-zÀ-ÿñÑ' -]/g, "").replace(/\s{2,}/g, " ");
}

function Field({ label, htmlFor, error, className, children }) {
    return (
        <div className={className}>
            <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
                {label}
            </Label>
            <div className="mt-1">{children}</div>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
    );
}

/**
 * Step 1: identidad del estudiante. El sistema toma el DNI (o correo) como
 * usuario de acceso y genera la contrasena automaticamente a partir del
 * numero de documento, asi que aqui no se pide contrasena manual.
 */
const FALLBACK_DOCUMENT_TYPES = [
    { value: "dni", label: "DNI" },
    { value: "ce", label: "Carne de extranjeria" },
    { value: "pasaporte", label: "Pasaporte" },
    { value: "ruc", label: "RUC" },
];

const FALLBACK_GENDERS = [
    { value: "m", label: "Masculino" },
    { value: "f", label: "Femenino" },
    { value: "otro", label: "Otro" },
];

// Reglas de escritura del numero de documento por tipo: que caracteres se
// permiten y cuantos como maximo. Coinciden con el formato que valida el
// backend (SelectOption::pattern), asi el usuario no puede ni escribir un
// caracter invalido - nunca deja "espacio vacio" ni caracteres de mas.
const DOC_INPUT_RULES = {
    dni: { maxLength: 8, filter: /[^0-9]/g, inputMode: "numeric" },
    ruc: { maxLength: 11, filter: /[^0-9]/g, inputMode: "numeric" },
    ce: { maxLength: 20, filter: /[^A-Za-z0-9]/g, inputMode: "text" },
    pasaporte: { maxLength: 20, filter: /[^A-Za-z0-9]/g, inputMode: "text" },
};
const DEFAULT_DOC_RULE = { maxLength: 20, filter: /\s/g, inputMode: "text" };

export function AccountFields({
    data,
    setData,
    errors = {},
    showAccountFields = false,
    showActiveToggle = true,
    bare = false,
    courses = null,
    documentTypes = FALLBACK_DOCUMENT_TYPES,
    genderOptions = FALLBACK_GENDERS,
    initialDepartamentoId = null,
    initialProvinciaId = null,
}) {
    const selectedCourse = courses?.find((c) => String(c.id) === String(data.course_id));
    const [paisesLoaded, setPaisesLoaded] = useState([]);
    const selectedPais = paisesLoaded.find((p) => String(p.id) === String(data.pais_id));
    const isPeru = !data.pais_id || selectedPais?.codigo === "PE";

    // Si todavia no eligieron pais, apenas carga el catalogo se preselecciona
    // Peru por defecto (el caso mas comun para este sistema).
    useEffect(() => {
        if (!data.pais_id && paisesLoaded.length > 0) {
            const peru = paisesLoaded.find((p) => p.codigo === "PE");
            if (peru) setData("pais_id", String(peru.id));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paisesLoaded]);

    const body = (
        <div className="space-y-5">
            {errors.avatar && <p className="text-xs text-destructive">{errors.avatar}</p>}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <Field label="Tipo de documento" htmlFor="document_type" error={errors.document_type}>
                    <Select
                        value={data.document_type ?? "dni"}
                        onValueChange={(v) => {
                            setData("document_type", v);
                            // Re-limpia lo ya escrito al formato del nuevo tipo
                            // (ej. si tenia letras y cambia a DNI, se quitan).
                            const rule = DOC_INPUT_RULES[v] ?? DEFAULT_DOC_RULE;
                            setData("dni", (data.dni ?? "").replace(rule.filter, "").slice(0, rule.maxLength));
                        }}
                    >
                        <SelectTrigger id="document_type">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {documentTypes.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="Numero de documento" htmlFor="dni" error={errors.dni}>
                    <Input
                        id="dni"
                        value={data.dni}
                        inputMode={(DOC_INPUT_RULES[data.document_type] ?? DEFAULT_DOC_RULE).inputMode}
                        maxLength={(DOC_INPUT_RULES[data.document_type] ?? DEFAULT_DOC_RULE).maxLength}
                        onChange={(e) => {
                            const rule = DOC_INPUT_RULES[data.document_type] ?? DEFAULT_DOC_RULE;
                            setData("dni", e.target.value.replace(rule.filter, "").slice(0, rule.maxLength));
                        }}
                    />
                </Field>
                <Field label="Nombres" htmlFor="name" error={errors.name}>
                    <Input id="name" value={data.name} onChange={(e) => setData("name", sanitizeName(e.target.value))} />
                </Field>
                <Field label="Apellidos" htmlFor="last_name" error={errors.last_name}>
                    <Input
                        id="last_name"
                        value={data.last_name}
                        onChange={(e) => setData("last_name", sanitizeName(e.target.value))}
                    />
                </Field>
                <Field label="Genero" htmlFor="gender" error={errors.gender}>
                    <Select value={data.gender || "_none"} onValueChange={(v) => setData("gender", v === "_none" ? "" : v)}>
                        <SelectTrigger id="gender">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_none">Sin especificar</SelectItem>
                            {genderOptions.map((g) => (
                                <SelectItem key={g.value} value={g.value}>
                                    {g.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="Fecha de nacimiento" htmlFor="birth_date" error={errors.birth_date}>
                    <DatePicker
                        id="birth_date"
                        value={data.birth_date}
                        onChange={(v) => setData("birth_date", v)}
                        maxDate={maxBirthDateFor(selectedCourse?.min_age)}
                    />
                </Field>
                <Field label="Numero de celular" htmlFor="phone" error={errors.phone}>
                    <Input id="phone" value={data.phone} onChange={(e) => setData("phone", e.target.value)} />
                </Field>
                <Field label="Correo electronico" htmlFor="email" error={errors.email}>
                    <Input id="email" type="email" value={data.email} onChange={(e) => setData("email", e.target.value)} />
                </Field>
                <Field label="Direccion" htmlFor="address" error={errors.address}>
                    <Input id="address" value={data.address} onChange={(e) => setData("address", e.target.value)} />
                </Field>

                <CountrySelect
                    value={data.pais_id}
                    onChange={(v) => {
                        setData("pais_id", v);
                        setData("distrito_id", "");
                        setData("ciudad_extranjero", "");
                    }}
                    onLoad={setPaisesLoaded}
                    error={errors.pais_id}
                />

                {isPeru ? (
                    <DistrictSelect
                        distritoId={data.distrito_id}
                        onChange={(v) => setData("distrito_id", v)}
                        initialDepartamentoId={initialDepartamentoId}
                        initialProvinciaId={initialProvinciaId}
                        error={errors.distrito_id}
                    />
                ) : (
                    <Field label="Ciudad" htmlFor="ciudad_extranjero" error={errors.ciudad_extranjero}>
                        <Input
                            id="ciudad_extranjero"
                            value={data.ciudad_extranjero ?? ""}
                            onChange={(e) => setData("ciudad_extranjero", e.target.value)}
                        />
                    </Field>
                )}

                {courses !== null && (
                    <Field label="Curso a inscribir" htmlFor="course_id" error={errors.course_id}>
                        <Select
                            value={data.course_id ? String(data.course_id) : undefined}
                            onValueChange={(v) => setData("course_id", v)}
                        >
                            <SelectTrigger id="course_id">
                                <SelectValue placeholder="Selecciona un curso" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.title} {c.is_free ? "(Gratis)" : `(S/ ${Number(c.price).toFixed(2)})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                )}

                {!showAccountFields && showActiveToggle && (
                    <div>
                        <Label htmlFor="is_active" className="text-xs text-muted-foreground">
                            Cuenta activa
                        </Label>
                        <div className="mt-1 flex h-9 items-center justify-between rounded-md border px-3">
                            <p className="text-xs text-muted-foreground">
                                Si la desactivas, no podra iniciar sesion.
                            </p>
                            <Switch id="is_active" checked={data.is_active} onCheckedChange={(v) => setData("is_active", v)} />
                        </div>
                    </div>
                )}
            </div>

            {showAccountFields && (
                <p className="text-xs text-muted-foreground">
                    El usuario de acceso sera el DNI o el correo, y la contrasena inicial se genera automaticamente
                    a partir del numero de documento.
                </p>
            )}
        </div>
    );

    if (bare) return body;

    return (
        <Card>
            <CardContent className="space-y-4 p-4 sm:p-5">
                <SectionHeading icon={UserCircle} title="Datos principales" color="green" />
                {body}
            </CardContent>
        </Card>
    );
}

export function WorkFields({ data, setData, errors = {}, bare = false }) {
    const body = (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Empresa" htmlFor="company" error={errors.company}>
                <Input id="company" value={data.company} onChange={(e) => setData("company", e.target.value)} />
            </Field>
            <Field label="Cargo" htmlFor="position" error={errors.position}>
                <Input id="position" value={data.position} onChange={(e) => setData("position", e.target.value)} />
            </Field>
            <Field label="Experiencia previa" htmlFor="previous_experience" error={errors.previous_experience} className="sm:col-span-2">
                <Textarea id="previous_experience" rows={2} value={data.previous_experience} onChange={(e) => setData("previous_experience", e.target.value)} />
            </Field>
        </div>
    );

    if (bare) return body;

    return (
        <Card>
            <CardContent className="space-y-4 p-4 sm:p-5">
                <SectionHeading icon={Building2} title="Datos laborales" color="blue" />
                {body}
            </CardContent>
        </Card>
    );
}

export function EmergencyFields({ data, setData, errors = {}, bare = false }) {
    const body = (
        <>
            <p className="-mt-1 mb-3 text-xs text-muted-foreground">
                Requerido para actividades de alto riesgo (acceso vertical, trabajos en altura).
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Contacto de emergencia (nombre)" htmlFor="emergency_contact_name" error={errors.emergency_contact_name}>
                    <Input
                        id="emergency_contact_name"
                        value={data.emergency_contact_name}
                        onChange={(e) => setData("emergency_contact_name", sanitizeName(e.target.value))}
                    />
                </Field>
                <Field label="Contacto de emergencia (telefono)" htmlFor="emergency_contact_phone" error={errors.emergency_contact_phone}>
                    <Input id="emergency_contact_phone" value={data.emergency_contact_phone} onChange={(e) => setData("emergency_contact_phone", e.target.value)} />
                </Field>
                <Field label="Tipo de sangre" htmlFor="blood_type" error={errors.blood_type}>
                    <Input id="blood_type" placeholder="Ej. O+" className="max-w-[140px]" value={data.blood_type} onChange={(e) => setData("blood_type", e.target.value)} />
                </Field>
                <Field label="Condiciones medicas / alergias" htmlFor="medical_conditions" error={errors.medical_conditions} className="sm:col-span-2">
                    <Textarea id="medical_conditions" rows={2} value={data.medical_conditions} onChange={(e) => setData("medical_conditions", e.target.value)} />
                </Field>
            </div>
        </>
    );

    if (bare) return body;

    return (
        <Card>
            <CardContent className="space-y-4 p-4 sm:p-5">
                <SectionHeading icon={HeartPulse} title="Emergencia y salud" color="red" />
                {body}
            </CardContent>
        </Card>
    );
}

const FALLBACK_SCTR = [
    { value: "vigente", label: "Vigente" },
    { value: "no_vigente", label: "No vigente" },
    { value: "no_aplica", label: "No aplica" },
];

export function SctrFields({ data, setData, errors = {}, bare = false, sctrOptions = FALLBACK_SCTR }) {
    const isVigente = data.sctr_status === "vigente";

    const body = (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Estado" htmlFor="sctr_status" error={errors.sctr_status}>
                <Select
                    value={data.sctr_status || "_none"}
                    onValueChange={(v) => {
                        const status = v === "_none" ? "" : v;
                        setData("sctr_status", status);
                        // Solo tiene sentido pedir vencimiento si esta
                        // vigente - si cambia a otro estado, se limpia.
                        if (status !== "vigente") setData("sctr_expires_at", "");
                    }}
                >
                    <SelectTrigger id="sctr_status">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_none">Sin especificar</SelectItem>
                        {sctrOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>
            <Field
                label={`Fecha de vencimiento${isVigente ? "" : " (solo si esta vigente)"}`}
                htmlFor="sctr_expires_at"
                error={errors.sctr_expires_at}
            >
                <DatePicker
                    id="sctr_expires_at"
                    value={data.sctr_expires_at}
                    onChange={(v) => setData("sctr_expires_at", v)}
                    disabled={!isVigente}
                />
            </Field>
        </div>
    );

    if (bare) return body;

    return (
        <Card>
            <CardContent className="space-y-4 p-4 sm:p-5">
                <SectionHeading icon={ShieldCheck} title="SCTR (Seguro Complementario de Trabajo de Riesgo)" color="amber" />
                {body}
            </CardContent>
        </Card>
    );
}

/**
 * Full-page variant: all sections stacked (used by Admin/Students/Edit.jsx).
 * Props: data, setData, errors, showAccountFields (password on create)
 */
export default function StudentFormFields({ data, setData, errors = {}, showAccountFields = false }) {
    return (
        <div className="space-y-6">
            <AccountFields data={data} setData={setData} errors={errors} showAccountFields={showAccountFields} />
            <WorkFields data={data} setData={setData} errors={errors} />
            <EmergencyFields data={data} setData={setData} errors={errors} />
            <SctrFields data={data} setData={setData} errors={errors} />
        </div>
    );
}
