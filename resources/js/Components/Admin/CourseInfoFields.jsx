import { Card, CardContent } from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Switch } from "@/Components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import SearchableCourseSelect from "@/Components/Admin/SearchableCourseSelect";
import { cn } from "@/lib/utils";
import { FileText, BadgeDollarSign, GraduationCap, Eye, ShieldAlert } from "lucide-react";

const HEADING_COLORS = {
    green: "bg-[#00ADEE]/10 text-[#024A7D]",
    blue: "bg-sky-500/10 text-sky-600",
    amber: "bg-amber-500/10 text-amber-600",
    violet: "bg-violet-500/10 text-violet-600",
};

function SectionHeading({ icon: Icon, title, color = "green" }) {
    return (
        <div className="mb-3 flex items-center gap-2">
            <span
                className={cn(
                    "box-border flex h-7 w-7 shrink-0 items-center justify-center rounded-md leading-none",
                    HEADING_COLORS[color]
                )}
            >
                <Icon className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold">{title}</h3>
        </div>
    );
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

function ToggleRow({ id, label, hint, checked, onCheckedChange }) {
    return (
        <div
            className={cn(
                "flex items-center justify-between gap-3 rounded-md border px-3 py-2 transition-colors duration-150",
                checked ? "border-[#00ADEE]/40 bg-[#00ADEE]/5" : "border-input"
            )}
        >
            <div className="min-w-0">
                <Label htmlFor={id} className="cursor-pointer text-sm">
                    {label}
                </Label>
                {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            </div>
            <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}

/**
 * Shared, presentational field set for course info (used by both the
 * "create" single-step form and step 1 of the edit wizard).
 *
 * Props: data, setData, errors, showPublish
 */
export default function CourseInfoFields({ data, setData, errors = {}, showPublish = false, courses = [] }) {
    return (
        <Card>
            <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2 lg:grid-cols-3">
                {/* Datos generales - ancho completo */}
                <div className="md:col-span-2 lg:col-span-3">
                    <SectionHeading icon={FileText} title="Datos generales" />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Titulo del curso" htmlFor="title" error={errors.title}>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData("title", e.target.value)}
                                placeholder="Ej. Trabajos en altura: nivel basico"
                            />
                        </Field>

                        <Field label="Resumen corto" htmlFor="summary" error={errors.summary}>
                            <Input
                                id="summary"
                                value={data.summary}
                                onChange={(e) => setData("summary", e.target.value)}
                                placeholder="Aparece en la tarjeta del catalogo"
                            />
                        </Field>
                    </div>
                    <Field label="Descripcion completa" htmlFor="description" error={errors.description} className="mt-3">
                        <Textarea
                            id="description"
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Objetivos, a quien va dirigido, requisitos..."
                        />
                    </Field>
                </div>

                <Separator className="md:col-span-2 lg:col-span-3" />

                <div className="md:col-span-2 lg:col-span-3">
                    <SectionHeading icon={GraduationCap} title="Contenido y duración del certificado" color="blue" />
                    <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                        <Field label="Duración total (horas)" htmlFor="certificate_duration_hours" error={errors.certificate_duration_hours}>
                            <Input id="certificate_duration_hours" type="number" min="0.25" max="9999.99" step="0.01"
                                value={data.certificate_duration_hours ?? ''} onChange={(e) => setData('certificate_duration_hours', e.target.value)} placeholder="Ej. 8" />
                            <p className="mt-2 text-xs text-muted-foreground">Duración de la capacitación que aparecerá en el reverso. Es independiente del tiempo de los videos y del plazo de acceso al aula.</p>
                        </Field>
                        <Field label="Temario para el reverso" htmlFor="certificate_content" error={errors.certificate_content}>
                            <Textarea id="certificate_content" rows={9} maxLength={4000} value={data.certificate_content ?? ''}
                                onChange={(e) => setData('certificate_content', e.target.value)}
                                placeholder={'1. Objetivo del curso\n2. Riesgos y prevención\n   a) Evaluación de riesgos\n3. Uso del equipo'} />
                            <p className="mt-2 text-xs text-muted-foreground">Un tema por línea; puedes numerar y añadir sangrías para los subtemas. Máximo 45 líneas y 4000 caracteres. Se usa en certificados virtuales y presenciales y en su verificación por QR. Los certificados nuevos conservan el temario y la duración que tenían al emitirse.</p>
                        </Field>
                    </div>
                </div>

                <Separator className="md:col-span-2 lg:col-span-3" />

                {/* Precio y acceso */}
                <div>
                    <SectionHeading icon={BadgeDollarSign} title="Precio y acceso" color="blue" />
                    <div className="space-y-3">
                        <ToggleRow
                            id="is_free"
                            label="Curso gratuito"
                            hint="Sin costo de inscripcion"
                            checked={data.is_free}
                            onCheckedChange={(v) => setData("is_free", v)}
                        />

                        {!data.is_free && (
                            <>
                                <Field label="Modalidad de cobro" htmlFor="billing_type" error={errors.billing_type}>
                                    <Select
                                        value={data.billing_type ?? "unico"}
                                        onValueChange={(v) => setData("billing_type", v)}
                                    >
                                        <SelectTrigger id="billing_type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unico">Pago unico</SelectItem>
                                            <SelectItem value="matricula_mensualidad">Matricula + mensualidades</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                {(data.billing_type ?? "unico") === "unico" ? (
                                    <Field label="Precio" htmlFor="price" error={errors.price}>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-muted-foreground">
                                                S/
                                            </span>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="pl-9"
                                                value={data.price}
                                                onChange={(e) => setData("price", e.target.value)}
                                            />
                                        </div>
                                    </Field>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            <Field label="Matricula (inscripcion)" htmlFor="enrollment_fee" error={errors.enrollment_fee}>
                                                <div className="relative">
                                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-muted-foreground">
                                                        S/
                                                    </span>
                                                    <Input
                                                        id="enrollment_fee"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        className="pl-9"
                                                        value={data.enrollment_fee ?? ""}
                                                        onChange={(e) => setData("enrollment_fee", e.target.value)}
                                                    />
                                                </div>
                                            </Field>
                                            <Field label="Mensualidad" htmlFor="monthly_fee" error={errors.monthly_fee}>
                                                <div className="relative">
                                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-muted-foreground">
                                                        S/
                                                    </span>
                                                    <Input
                                                        id="monthly_fee"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        className="pl-9"
                                                        value={data.monthly_fee ?? ""}
                                                        onChange={(e) => setData("monthly_fee", e.target.value)}
                                                    />
                                                </div>
                                            </Field>
                                            <Field label="Duracion (meses)" htmlFor="duration_months" error={errors.duration_months}>
                                                <Input
                                                    id="duration_months"
                                                    type="number"
                                                    min="1"
                                                    max="60"
                                                    value={data.duration_months ?? ""}
                                                    onChange={(e) => setData("duration_months", e.target.value)}
                                                />
                                            </Field>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Al inscribirse, el estudiante genera 1 cuota de matricula y una cuota
                                            mensual por cada mes de duracion.
                                        </p>
                                    </>
                                )}

                                <ToggleRow
                                    id="payment_required"
                                    label="Pago obligatorio para avanzar"
                                    hint="Si esta activo, el estudiante no puede ver las clases mientras tenga una cuota vencida sin pagar."
                                    checked={data.payment_required ?? true}
                                    onCheckedChange={(v) => setData("payment_required", v)}
                                />
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <SectionHeading icon={ShieldAlert} title="Restricciones" color="red" />
                    <Field
                        label="Edad minima requerida"
                        htmlFor="min_age"
                        error={errors.min_age}
                        className="max-w-xs"
                    >
                        <div className="relative">
                            <Input
                                id="min_age"
                                type="number"
                                min="0"
                                max="99"
                                placeholder="Sin restriccion"
                                value={data.min_age ?? ""}
                                onChange={(e) => setData("min_age", e.target.value)}
                            />
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm font-medium text-muted-foreground">
                                años
                            </span>
                        </div>
                    </Field>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Dejalo vacio si el curso no tiene restriccion de edad. Si pones un numero (ej. 18), el
                        sistema no permite inscribir a un estudiante mas joven a ese curso.
                    </p>

                    <Field
                        label="Duracion de acceso"
                        htmlFor="access_duration_days"
                        error={errors.access_duration_days}
                        className="mt-4 max-w-xs"
                    >
                        <div className="relative">
                            <Input
                                id="access_duration_days"
                                type="number"
                                min="1"
                                max="730"
                                placeholder="Sin vencimiento"
                                value={data.access_duration_days ?? ""}
                                onChange={(e) => setData("access_duration_days", e.target.value)}
                            />
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm font-medium text-muted-foreground">
                                dias
                            </span>
                        </div>
                    </Field>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Dejalo vacio si el curso no vence. Se cuenta desde la fecha de inscripcion del estudiante;
                        al vencer, se bloquea el acceso a las clases hasta coordinar una extension.
                    </p>

                    <Field
                        label="Curso requisito previo"
                        htmlFor="prerequisite_course_id"
                        error={errors.prerequisite_course_id}
                        className="mt-4 max-w-xs"
                    >
                        <SearchableCourseSelect
                            courses={courses}
                            value={data.prerequisite_course_id}
                            onChange={(v) => setData("prerequisite_course_id", v)}
                        />
                    </Field>
                    <p className="mt-2 text-xs text-muted-foreground">
                        El estudiante solo puede inscribirse si ya completo ese curso con nosotros o si un admin
                        registro una convalidacion (certificado externo validado presencialmente) desde su perfil.
                    </p>
                </div>

                <div className="space-y-5">
                    <div>
                        <SectionHeading icon={GraduationCap} title="Evaluacion" color="amber" />
                        <p className="text-xs text-muted-foreground">
                            La nota minima para aprobar un quiz o examen es <strong>13/20</strong>, fija para todos
                            los cursos (no se configura por curso).
                        </p>
                    </div>

                    {showPublish && (
                        <div>
                            <SectionHeading icon={Eye} title="Visibilidad" color="violet" />
                            <ToggleRow
                                id="is_published"
                                label="Publicado"
                                hint="Visible en el catalogo del aula virtual"
                                checked={data.is_published}
                                onCheckedChange={(v) => setData("is_published", v)}
                            />
                        </div>
                    )}
                </div>
            </div>
            </CardContent>
        </Card>
    );
}
