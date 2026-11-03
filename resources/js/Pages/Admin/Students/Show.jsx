import { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import SearchableCourseSelect from "@/Components/Admin/SearchableCourseSelect";
import FileInput from "@/Components/Admin/FileInput";
import {
    ArrowLeft,
    Pencil,
    Plus,
    User as UserIcon,
    GraduationCap,
    Award,
    CheckCircle2,
    CreditCard,
    ShoppingCart,
    Receipt,
    ShoppingBag,
    BadgeCheck,
    Trash2,
    Loader2,
} from "lucide-react";
import { ProfileHeader, AcademicoTab, PagosTab, formatDate } from "@/Components/Aula/ProfileShared";
import EditStudentModal from "@/Components/Admin/EditStudentModal";
import NewStudentModal from "@/Components/Admin/NewStudentModal";
import RegisterPaymentModal from "@/Components/Admin/RegisterPaymentModal";
import ExtendInstallmentModal from "@/Components/Admin/ExtendInstallmentModal";
import RegisterOrderPaymentModal from "@/Components/Admin/RegisterOrderPaymentModal";
import SplitOrderModal from "@/Components/Admin/SplitOrderModal";
import SellProductModal from "@/Components/Admin/SellProductModal";
import TicketModal from "@/Components/Shared/TicketModal";

const TABS = [
    { id: "info", label: "Informacion personal", icon: UserIcon },
    { id: "academico", label: "Academico", icon: GraduationCap },
    { id: "pagos", label: "Pagos", icon: CreditCard },
];

// Colores del badge de SCTR por codigo; si el admin agrega un estado nuevo
// desde /admin/catalogos que no esta en este mapa, cae al estilo neutro.
const SCTR_BADGE_STYLE = {
    vigente: "bg-[#00ADEE]/10 text-[#024A7D]",
    no_vigente: "bg-red-100 text-red-700",
    no_aplica: "bg-muted text-muted-foreground",
};

function labelFrom(options, value) {
    return options?.find((o) => o.value === value)?.label ?? value;
}

function InfoRow({ label, value }) {
    return (
        <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-sm font-medium">{value || "—"}</div>
        </div>
    );
}

function SectionCard({ title, children }) {
    return (
        <Card>
            <CardContent className="space-y-4 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-[#024A7D]">{title}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">{children}</div>
            </CardContent>
        </Card>
    );
}

function InfoTab({ student, documentTypes, genderOptions, sctrOptions }) {
    return (
        <div className="space-y-4">
            <SectionCard title="Datos principales">
                <InfoRow label="Tipo de documento" value={labelFrom(documentTypes, student.document_type)} />
                <InfoRow label="Numero de documento" value={student.dni} />
                <InfoRow label="Genero" value={labelFrom(genderOptions, student.gender)} />
                <InfoRow label="Fecha de nacimiento" value={formatDate(student.birth_date)} />
                <InfoRow label="Direccion" value={student.address} />
                <InfoRow label="Distrito" value={student.district} />
            </SectionCard>

            <SectionCard title="Datos laborales">
                <InfoRow label="Empresa" value={student.company} />
                <InfoRow label="Cargo" value={student.position} />
                <InfoRow label="Experiencia previa" value={student.previous_experience} />
            </SectionCard>

            <SectionCard title="Emergencia y salud">
                <InfoRow label="Contacto de emergencia" value={student.emergency_contact_name} />
                <InfoRow label="Telefono de emergencia" value={student.emergency_contact_phone} />
                <InfoRow label="Tipo de sangre" value={student.blood_type} />
                <InfoRow label="Condiciones medicas" value={student.medical_conditions} />
            </SectionCard>

            <SectionCard title="SCTR">
                <div>
                    <div className="text-xs text-muted-foreground">Estado</div>
                    {student.sctr_status ? (
                        <Badge className={`mt-0.5 border-0 ${SCTR_BADGE_STYLE[student.sctr_status] ?? "bg-muted text-muted-foreground"}`}>
                            {labelFrom(sctrOptions, student.sctr_status)}
                        </Badge>
                    ) : (
                        <div className="text-sm font-medium">—</div>
                    )}
                </div>
                <InfoRow label="Vencimiento" value={formatDate(student.sctr_expires_at)} />
            </SectionCard>
        </div>
    );
}

/**
 * Convalidacion manual de un curso-requisito: la validacion del contenido
 * la hace el admin en persona (ver checklist de requerimientos - Aula
 * Virtual, audio 2 y 3); el escaneo del certificado y la nota obtenida son
 * opcionales, solo de respaldo/referencia.
 */
function EquivalenciasCard({ studentId, equivalencies, allCourses }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        course_id: "",
        issuing_institution: "",
        note: "",
        score: "",
        file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/admin/estudiantes/${studentId}/convalidaciones`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    const remove = (eq) => {
        router.delete(`/admin/estudiantes/${studentId}/convalidaciones/${eq.id}`, { preserveScroll: true });
    };

    return (
        <Card>
            <CardContent className="space-y-4 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-[#024A7D]" />
                    <h3 className="text-sm font-semibold text-[#024A7D]">Convalidaciones (certificados externos)</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                    Si el estudiante curso o se certifico en otra institucion y ya validaste el certificado en
                    persona, registralo aca para que cumpla el requisito previo de los cursos que lo pidan.
                </p>

                {equivalencies.length > 0 && (
                    <ul className="space-y-1.5">
                        {equivalencies.map((eq) => (
                            <li
                                key={eq.id}
                                className="flex items-start justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium text-[#024A7D]">
                                        {eq.course.title}
                                        {eq.score !== null && eq.score !== undefined && (
                                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                                (nota {Number.isInteger(Number(eq.score)) ? Number(eq.score) : Number(eq.score).toFixed(1)}/20)
                                            </span>
                                        )}
                                    </p>
                                    {eq.issuing_institution && (
                                        <p className="text-xs font-medium text-muted-foreground">{eq.issuing_institution}</p>
                                    )}
                                    {eq.note && <p className="whitespace-pre-line text-xs text-muted-foreground">{eq.note}</p>}
                                    {eq.file_url && (
                                        <a
                                            href={eq.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:underline"
                                        >
                                            Ver certificado escaneado
                                        </a>
                                    )}
                                    <p className="text-[11px] text-muted-foreground">
                                        {formatDate(eq.created_at)}
                                        {eq.granted_by ? ` · ${eq.granted_by}` : ""}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(eq)}
                                    className="shrink-0 text-muted-foreground hover:text-destructive"
                                    title="Eliminar convalidacion"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <form onSubmit={submit} className="space-y-3 border-t pt-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <Label className="text-xs text-muted-foreground">Curso convalidado</Label>
                            <div className="mt-1">
                                <SearchableCourseSelect
                                    courses={allCourses}
                                    value={data.course_id}
                                    onChange={(v) => setData("course_id", v)}
                                    placeholder="Selecciona el curso"
                                    allowEmpty={false}
                                />
                            </div>
                            {errors.course_id && <p className="mt-1 text-xs text-destructive">{errors.course_id}</p>}
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Empresa / institucion que emitio el certificado</Label>
                            <Input
                                className="mt-1"
                                placeholder="Ej: Empresa XYZ"
                                value={data.issuing_institution}
                                onChange={(e) => setData("issuing_institution", e.target.value)}
                            />
                            {errors.issuing_institution && (
                                <p className="mt-1 text-xs text-destructive">{errors.issuing_institution}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <Label className="text-xs text-muted-foreground">Calificacion obtenida (0-20, opcional)</Label>
                            <Input
                                className="mt-1"
                                type="number"
                                min="0"
                                max="20"
                                step="0.5"
                                placeholder="Ej: 18"
                                value={data.score}
                                onChange={(e) => setData("score", e.target.value)}
                            />
                            {errors.score && <p className="mt-1 text-xs text-destructive">{errors.score}</p>}
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Certificado escaneado (opcional)</Label>
                            <div className="mt-1">
                                <FileInput
                                    value={data.file}
                                    onChange={(file) => setData("file", file)}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                            </div>
                            {errors.file && <p className="mt-1 text-xs text-destructive">{errors.file}</p>}
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">Nota (opcional)</Label>
                        <Textarea
                            className="mt-1"
                            rows={3}
                            placeholder="Detalle adicional: fecha del certificado, quien lo valido, contenido verificado, etc."
                            value={data.note}
                            onChange={(e) => setData("note", e.target.value)}
                        />
                        {errors.note && <p className="mt-1 text-xs text-destructive">{errors.note}</p>}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing || !data.course_id}>
                            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                            Registrar
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default function Show({
    student,
    enrollments,
    orders,
    installments,
    otherPayments,
    stats,
    documentTypes,
    genderOptions,
    sctrOptions,
    courses,
    equivalencies = [],
    allCourses = [],
}) {
    const [tab, setTab] = useState("info");
    const [showEdit, setShowEdit] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showSell, setShowSell] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [payingInstallment, setPayingInstallment] = useState(null);
    const [extendingInstallment, setExtendingInstallment] = useState(null);
    const [payingOrder, setPayingOrder] = useState(null);
    const [splittingOrder, setSplittingOrder] = useState(null);
    const [viewingTicket, setViewingTicket] = useState(null);
    const [viewingSaleTicket, setViewingSaleTicket] = useState(null);
    const fullName = [student.last_name, student.name].filter(Boolean).join(" ") || student.name;

    const uploadAvatar = (file) => {
        setAvatarUploading(true);
        router.post(
            `/admin/estudiantes/${student.id}/foto`,
            { avatar: file },
            { preserveScroll: true, forceFormData: true, onFinish: () => setAvatarUploading(false) }
        );
    };

    return (
        <>
            <Head title={`Perfil: ${fullName}`} />
            <AdminLayout title={fullName}>
                <ProfileHeader
                    name={fullName}
                    avatarUrl={student.avatar_url}
                    onAvatarChange={uploadAvatar}
                    avatarUploading={avatarUploading}
                    subtitle="Estudiante Acceso Vertical Perú"
                    email={student.email}
                    phone={student.phone}
                    createdAt={student.created_at}
                    hasCertificate={stats.certificates > 0}
                    stats={[
                        { icon: GraduationCap, value: stats.courses, label: "Cursos", color: "sky" },
                        { icon: CheckCircle2, value: stats.completed, label: "Completados", color: "amber" },
                        { icon: Award, value: stats.certificates, label: "Certificados", color: "green" },
                    ]}
                    tabs={TABS}
                    tab={tab}
                    setTab={setTab}
                    extraAction={
                        <div className="flex shrink-0 items-center gap-2">
                            <Link
                                href="/admin/cursos/estudiantes"
                                className="group/back relative inline-flex items-center gap-1.5 overflow-hidden rounded-md bg-white/10 px-3 py-2 text-sm text-white/80 hover:text-white"
                            >
                                <span
                                    className="absolute inset-0 origin-right scale-x-0 bg-white/20 transition-transform duration-300 ease-out group-hover/back:scale-x-100"
                                    aria-hidden="true"
                                />
                                <ArrowLeft className="relative h-3.5 w-3.5" />
                                <span className="relative">Volver a estudiantes</span>
                            </Link>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="group/edit relative overflow-hidden bg-white/10 text-white hover:bg-white/10"
                                onClick={() => setShowEdit(true)}
                            >
                                <span
                                    className="absolute inset-0 origin-right scale-x-0 bg-white/20 transition-transform duration-300 ease-out group-hover/edit:scale-x-100"
                                    aria-hidden="true"
                                />
                                <Pencil className="relative h-3.5 w-3.5" />
                                <span className="relative">Editar</span>
                            </Button>
                            <Button
                                size="sm"
                                className="group/new relative overflow-hidden"
                                onClick={() => setShowNew(true)}
                            >
                                <span
                                    className="absolute inset-0 origin-right scale-x-0 bg-white/20 transition-transform duration-300 ease-out group-hover/new:scale-x-100"
                                    aria-hidden="true"
                                />
                                <Plus className="relative h-3.5 w-3.5" />
                                <span className="relative">Nuevo estudiante</span>
                            </Button>
                        </div>
                    }
                />

                <div key={tab} className="mt-6 animate-in fade-in slide-in-from-right-4 duration-300 ease-out">
                    {tab === "info" && (
                        <InfoTab
                            student={student}
                            documentTypes={documentTypes}
                            genderOptions={genderOptions}
                            sctrOptions={sctrOptions}
                        />
                    )}
                    {tab === "academico" && (
                        <div className="space-y-4">
                            <AcademicoTab enrollments={enrollments} canContinue={false} adminReports studentId={student.id} />
                            <EquivalenciasCard studentId={student.id} equivalencies={equivalencies} allCourses={allCourses} />
                        </div>
                    )}
                    {tab === "pagos" && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#00ADEE]/20 bg-[#00ADEE]/5 px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00ADEE]/15 text-[#024A7D]">
                                        <ShoppingCart className="h-4.5 w-4.5" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-[#024A7D]">¿El estudiante quiere comprar algo?</p>
                                        <p className="text-xs text-muted-foreground">
                                            Casco, guantes, arnés u otro producto de tu catálogo — se registra al toque, con su ticket.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    className="shrink-0 bg-[#024A7D] text-white hover:bg-[#00ADEE]"
                                    onClick={() => setShowSell(true)}
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    Vender producto
                                </Button>
                            </div>

                            <PagosTab
                                orders={orders}
                                installments={installments}
                                onPayInstallment={(i) => setPayingInstallment(i)}
                                onViewTicket={(i) => setViewingTicket(i)}
                                onExtendInstallment={(i) => setExtendingInstallment(i)}
                                onPayOrder={(o) => setPayingOrder(o)}
                                onSplitOrder={(o) => setSplittingOrder(o)}
                            />

                            {otherPayments.length > 0 && (
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
                                            <ShoppingBag className="h-4 w-4 text-[#024A7D]" />
                                            <h3 className="text-sm font-semibold text-[#024A7D]">Ventas de productos</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b bg-muted/20 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                                        <th className="px-4 py-3">Ticket</th>
                                                        <th className="px-4 py-3">Concepto</th>
                                                        <th className="px-4 py-3">Doc.</th>
                                                        <th className="px-4 py-3">Monto</th>
                                                        <th className="px-4 py-3">Fecha</th>
                                                        <th className="px-4 py-3"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {otherPayments.map((p) => (
                                                        <tr key={p.id} className="border-b last:border-0">
                                                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.receipt_code}</td>
                                                            <td className="px-4 py-3 font-medium text-[#024A7D]">{p.concept}</td>
                                                            <td className="px-4 py-3">
                                                                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
                                                                    {p.document_type ?? "ticket"}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">S/ {Number(p.amount).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-slate-500">{formatDate(p.paid_at)}</td>
                                                            <td className="px-4 py-3 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setViewingSaleTicket(p)}
                                                                    className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:underline"
                                                                >
                                                                    <Receipt className="h-3.5 w-3.5" />
                                                                    Ver ticket
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </AdminLayout>

            <RegisterPaymentModal
                open={!!payingInstallment}
                onOpenChange={(v) => !v && setPayingInstallment(null)}
                studentId={student.id}
                installment={payingInstallment}
            />

            <RegisterOrderPaymentModal
                open={!!payingOrder}
                onOpenChange={(v) => !v && setPayingOrder(null)}
                order={payingOrder}
                onPaid={() => router.reload({ only: ["orders", "enrollments", "stats"] })}
            />

            <SplitOrderModal
                open={!!splittingOrder}
                onOpenChange={(v) => !v && setSplittingOrder(null)}
                order={splittingOrder}
                onSplit={() => router.reload({ only: ["orders", "installments", "enrollments", "stats"] })}
            />

            <ExtendInstallmentModal
                open={!!extendingInstallment}
                onOpenChange={(v) => !v && setExtendingInstallment(null)}
                studentId={student.id}
                installment={extendingInstallment}
            />

            <SellProductModal
                open={showSell}
                onOpenChange={setShowSell}
                studentId={student.id}
                studentName={fullName}
                studentDni={student.dni}
                onSold={() =>
                    router.reload({
                        only: ["otherPayments"],
                        onSuccess: (page) => {
                            const latest = page.props.otherPayments?.[0];
                            if (latest) setViewingSaleTicket(latest);
                        },
                    })
                }
            />

            <TicketModal
                open={!!viewingTicket}
                onOpenChange={(v) => !v && setViewingTicket(null)}
                dataUrl={viewingTicket ? `/admin/estudiantes/${student.id}/cuotas/${viewingTicket.id}/recibo-datos` : null}
            />

            <TicketModal
                open={!!viewingSaleTicket}
                onOpenChange={(v) => !v && setViewingSaleTicket(null)}
                dataUrl={viewingSaleTicket ? `/admin/ventas/otros-pagos/${viewingSaleTicket.id}/recibo-datos` : null}
            />

            <EditStudentModal
                open={showEdit}
                onOpenChange={setShowEdit}
                student={student}
                documentTypes={documentTypes}
                genderOptions={genderOptions}
                sctrOptions={sctrOptions}
                courses={courses}
            />
            <NewStudentModal
                open={showNew}
                onOpenChange={setShowNew}
                courses={courses}
                documentTypes={documentTypes}
                genderOptions={genderOptions}
                sctrOptions={sctrOptions}
            />
        </>
    );
}
