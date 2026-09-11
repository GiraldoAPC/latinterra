import { useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { cn } from "@/lib/utils";
import {
    User as UserIcon,
    GraduationCap,
    Award,
    CheckCircle2,
    CreditCard,
    Pencil,
    AlertTriangle,
    UserCircle,
    Building2,
    HeartPulse,
    ShieldCheck,
    IdCard,
    Hash,
    Cake,
    Smartphone,
    Mail,
    MapPin,
    Globe2,
    VenetianMask,
    Briefcase,
    History,
    ContactRound,
    PhoneCall,
    Droplet,
    Stethoscope,
    CalendarClock,
} from "lucide-react";
import { ProfileHeader, AcademicoTab, PagosTab } from "@/Components/Aula/ProfileShared";
import TicketModal from "@/Components/Shared/TicketModal";
import EditProfileModal from "@/Components/Aula/EditProfileModal";
import IncompleteProfileModal from "@/Components/Aula/IncompleteProfileModal";

const TABS = [
    { id: "info", label: "Informacion personal", icon: UserIcon },
    { id: "academico", label: "Academico", icon: GraduationCap },
    { id: "pagos", label: "Pagos", icon: CreditCard },
];

const DOCUMENT_LABELS = { dni: "DNI", ce: "Carne de extranjeria", pasaporte: "Pasaporte", ruc: "RUC" };
const GENDER_LABELS = { m: "Masculino", f: "Femenino", otro: "Otro" };

// Campos que el estudiante necesita completar para que el sistema (ficha
// de matricula, certificados, SCTR, etc.) funcione sin baches - coincide
// con lo que exige StudentProfileController::validated() en el backend.
function missingFields(profileUser) {
    const missing = [];
    if (!profileUser.document_type) missing.push("Tipo de documento");
    if (!profileUser.dni) missing.push("Numero de documento");
    if (!profileUser.last_name) missing.push("Apellidos");
    if (!profileUser.birth_date) missing.push("Fecha de nacimiento");
    if (!profileUser.phone) missing.push("Numero de celular");
    if (!profileUser.address) missing.push("Direccion");
    if (!profileUser.pais_id) missing.push("Pais");
    if (profileUser.pais_id && !profileUser.distrito_id && !profileUser.ciudad_extranjero) {
        missing.push("Distrito / Ciudad");
    }
    return missing;
}

const SECTION_COLORS = {
    green: { chip: "bg-[#00ADEE]/10 text-[#024A7D]", ring: "before:bg-[#00ADEE]" },
    blue: { chip: "bg-sky-500/10 text-sky-600", ring: "before:bg-sky-500" },
    red: { chip: "bg-red-500/10 text-red-600", ring: "before:bg-red-500" },
    amber: { chip: "bg-amber-500/10 text-amber-600", ring: "before:bg-amber-500" },
};

function Field({ icon: Icon, label, value, span }) {
    const empty = !value;
    return (
        <div className={cn("group flex items-start gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/50", span && "sm:col-span-2 md:col-span-1")}>
            {Icon && (
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground">
                    <Icon className="h-4 w-4" />
                </span>
            )}
            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className={cn("mt-0.5 truncate text-sm font-semibold text-foreground", empty && "italic font-normal text-muted-foreground/70")}>
                    {value || "Sin registrar"}
                </p>
            </div>
        </div>
    );
}

const SCTR_BADGE = {
    vigente: { label: "Vigente", className: "bg-[#00ADEE]/10 text-[#024A7D] border-[#00ADEE]/20" },
    no_vigente: { label: "No vigente", className: "bg-red-500/10 text-red-600 border-red-500/20" },
    no_aplica: { label: "No aplica", className: "bg-muted text-muted-foreground border-transparent" },
};

function InfoSection({ icon: Icon, title, color, badge, children }) {
    const c = SECTION_COLORS[color];
    return (
        <Card className={cn("relative overflow-hidden border-border/60 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-1", c.ring)}>
            <CardContent className="p-5 pl-6">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg leading-none", c.chip)}>
                            <Icon className="h-4 w-4" />
                        </span>
                        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    </div>
                    {badge}
                </div>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3">{children}</div>
            </CardContent>
        </Card>
    );
}

function InfoTab({ profileUser }) {
    const ubicacion = profileUser.distrito_nombre || profileUser.ciudad_extranjero || null;
    const sctr = SCTR_BADGE[profileUser.sctr_status];

    return (
        <div className="space-y-4">
            <InfoSection icon={UserCircle} title="Datos principales" color="green">
                <Field icon={IdCard} label="Tipo de documento" value={DOCUMENT_LABELS[profileUser.document_type] ?? profileUser.document_type} />
                <Field icon={Hash} label="Numero de documento" value={profileUser.dni} />
                <Field icon={UserIcon} label="Nombres" value={profileUser.name} />
                <Field icon={UserIcon} label="Apellidos" value={profileUser.last_name} />
                <Field icon={VenetianMask} label="Genero" value={GENDER_LABELS[profileUser.gender] ?? profileUser.gender} />
                <Field icon={Cake} label="Fecha de nacimiento" value={profileUser.birth_date ? new Date(profileUser.birth_date).toLocaleDateString("es-PE") : null} />
                <Field icon={Smartphone} label="Numero de celular" value={profileUser.phone} />
                <Field icon={Mail} label="Correo electronico" value={profileUser.email} />
                <Field icon={MapPin} label="Direccion" value={profileUser.address} />
                <Field icon={Globe2} label="Pais" value={profileUser.pais_nombre} />
                <Field icon={MapPin} label="Distrito / Ciudad" value={ubicacion} />
            </InfoSection>

            {(profileUser.company || profileUser.position || profileUser.previous_experience) && (
                <InfoSection icon={Building2} title="Datos laborales" color="blue">
                    <Field icon={Building2} label="Empresa" value={profileUser.company} />
                    <Field icon={Briefcase} label="Cargo" value={profileUser.position} />
                    <Field icon={History} label="Experiencia previa" value={profileUser.previous_experience} span />
                </InfoSection>
            )}

            <InfoSection icon={HeartPulse} title="Emergencia y salud" color="red">
                <Field icon={ContactRound} label="Contacto de emergencia" value={profileUser.emergency_contact_name} />
                <Field icon={PhoneCall} label="Telefono de emergencia" value={profileUser.emergency_contact_phone} />
                <Field icon={Droplet} label="Tipo de sangre" value={profileUser.blood_type} />
                <Field icon={Stethoscope} label="Condiciones medicas / alergias" value={profileUser.medical_conditions} span />
            </InfoSection>

            <InfoSection
                icon={ShieldCheck}
                title="SCTR"
                color="amber"
                badge={sctr && <Badge variant="outline" className={cn("text-[11px] font-semibold", sctr.className)}>{sctr.label}</Badge>}
            >
                <Field icon={ShieldCheck} label="Estado" value={sctr?.label} />
                <Field icon={CalendarClock} label="Fecha de vencimiento" value={profileUser.sctr_expires_at ? new Date(profileUser.sctr_expires_at).toLocaleDateString("es-PE") : null} />
            </InfoSection>
        </div>
    );
}

export default function Perfil({ profileUser, enrollments, orders, installments, stats, documentTypes, genderOptions, sctrOptions }) {
    const [tab, setTab] = useState("info");
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [viewingTicket, setViewingTicket] = useState(null);

    const missing = useMemo(() => missingFields(profileUser), [profileUser]);
    const [incompleteAlertOpen, setIncompleteAlertOpen] = useState(missing.length > 0);

    const uploadAvatar = (file) => {
        setAvatarUploading(true);
        router.post(
            "/aula-virtual/perfil/foto",
            { avatar: file },
            { preserveScroll: true, forceFormData: true, onFinish: () => setAvatarUploading(false) }
        );
    };

    return (
        <>
            <Head title="Mi perfil | Aula Virtual" />
            <StudentLayout title="Mi perfil">
                <ProfileHeader
                    name={profileUser.name}
                    avatarUrl={profileUser.avatar_url}
                    onAvatarChange={uploadAvatar}
                    avatarUploading={avatarUploading}
                    subtitle="Estudiante Acceso Vertical Perú"
                    email={profileUser.email}
                    phone={profileUser.phone}
                    createdAt={profileUser.created_at}
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
                        <Button
                            size="sm"
                            variant="secondary"
                            className="group/edit relative shrink-0 overflow-hidden bg-white/10 text-white hover:bg-white/10"
                            onClick={() => setEditOpen(true)}
                        >
                            <span
                                className="absolute inset-0 origin-right scale-x-0 bg-white/20 transition-transform duration-300 ease-out group-hover/edit:scale-x-100"
                                aria-hidden="true"
                            />
                            <Pencil className="relative h-3.5 w-3.5" />
                            <span className="relative">Editar perfil</span>
                        </Button>
                    }
                />

                {missing.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setIncompleteAlertOpen(true)}
                        className="mt-4 flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:underline"
                    >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Tienes datos pendientes de actualizar
                    </button>
                )}

                <div key={tab} className="mt-6 animate-in fade-in slide-in-from-right-4 duration-300 ease-out">
                    {tab === "info" && <InfoTab profileUser={profileUser} />}
                    {tab === "academico" && <AcademicoTab enrollments={enrollments} />}
                    {tab === "pagos" && (
                        <PagosTab orders={orders} installments={installments} onViewTicket={(i) => setViewingTicket(i)} />
                    )}
                </div>
            </StudentLayout>

            <TicketModal
                open={!!viewingTicket}
                onOpenChange={(v) => !v && setViewingTicket(null)}
                dataUrl={viewingTicket ? `/aula-virtual/perfil/cuotas/${viewingTicket.id}/recibo-datos` : null}
            />

            <EditProfileModal
                open={editOpen}
                onOpenChange={setEditOpen}
                profileUser={profileUser}
                documentTypes={documentTypes}
                genderOptions={genderOptions}
                sctrOptions={sctrOptions}
            />

            <IncompleteProfileModal
                open={incompleteAlertOpen && missing.length > 0}
                missing={missing}
                onUpdate={() => {
                    setIncompleteAlertOpen(false);
                    setEditOpen(true);
                }}
                onDismiss={() => setIncompleteAlertOpen(false)}
            />
        </>
    );
}
