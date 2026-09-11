import { Link } from "@inertiajs/react";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { AvatarPicker } from "@/Components/ui/avatar-picker";
import { cn } from "@/lib/utils";
import { GraduationCap, Award, CreditCard, Mail, Phone, Calendar, FileText, ClipboardList, Receipt, Wallet, CalendarClock } from "lucide-react";

// Piezas visuales compartidas entre el perfil del propio estudiante
// (Aula/Perfil.jsx) y la vista de administracion de un estudiante
// (Admin/Students/Show.jsx). Deben verse identicas en ambos lugares.

export const STAT_COLORS = {
    sky: { icon: "from-sky-400 to-sky-600", text: "text-sky-600" },
    amber: { icon: "from-amber-400 to-amber-600", text: "text-amber-600" },
    green: { icon: "from-[#59CAF4] to-[#024A7D]", text: "text-[#024A7D]" },
};

export function StatCard({ icon: Icon, value, label, color = "sky" }) {
    const c = STAT_COLORS[color];
    return (
        <div className="group flex min-w-[92px] flex-col items-center gap-1 rounded-xl border bg-white px-5 py-2.5 shadow-sm transition-shadow hover:shadow-md">
            <span
                className={cn(
                    "box-border flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br leading-none text-white shadow-sm",
                    c.icon
                )}
            >
                <Icon className="h-4 w-4 shrink-0" />
            </span>
            <div className={cn("text-lg font-extrabold leading-none", c.text)}>{value}</div>
            <div className="text-center text-[10.5px] font-medium leading-tight text-slate-500">
                {label}
            </div>
        </div>
    );
}

export function initialsOf(name) {
    return (name || "U")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
}

export function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export const ORDER_STATUS = {
    pending: { label: "Pendiente", className: "bg-amber-100 text-amber-700" },
    paid: { label: "Pagado", className: "bg-[#00ADEE]/15 text-[#024A7D]" },
    rejected: { label: "Rechazado", className: "bg-red-100 text-red-700" },
};

export function AcademicoTab({ enrollments, courseHref, canContinue = true, adminReports = false, studentId }) {
    if (enrollments.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                    <GraduationCap className="h-10 w-10 text-slate-300" />
                    <p className="text-slate-500">Aun no esta inscrito en ningun curso.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {enrollments.map((e) => (
                <Card key={e.id}>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0">
                                <p className="font-semibold text-[#024A7D]">{e.course.title}</p>
                                <p className="text-xs text-slate-500">
                                    Inscrito el {formatDate(e.created_at)}
                                </p>
                            </div>
                            <Badge variant={e.status === "completed" ? "default" : "secondary"}>
                                {e.status === "completed" ? "Completado" : "En curso"}
                            </Badge>
                        </div>

                        <div className="mt-3">
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#00ADEE] to-[#59CAF4]"
                                    style={{ width: `${e.progress}%` }}
                                />
                            </div>
                            <span className="text-xs text-slate-500">{e.progress}% completado</span>
                        </div>

                        {(canContinue || e.certificate || adminReports) && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {canContinue && (
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={courseHref ? courseHref(e) : `/aula/${e.course.slug}/continuar`}>
                                            Ir al curso
                                        </Link>
                                    </Button>
                                )}
                                {adminReports && (
                                    <>
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={`/admin/estudiantes/${studentId}/matricula/${e.id}`}>
                                                <FileText className="h-3.5 w-3.5 text-sky-600" />
                                                Ficha de matricula
                                            </Link>
                                        </Button>
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={`/admin/estudiantes/${studentId}/notas/${e.id}`}>
                                                <ClipboardList className="h-3.5 w-3.5 text-amber-600" />
                                                Record de notas (RCI)
                                            </Link>
                                        </Button>
                                    </>
                                )}
                                {e.certificate && (
                                    <Button asChild size="sm">
                                        <Link href={`/aula/certificado/${e.id}`}>
                                            <Award className="h-3.5 w-3.5" />
                                            Ver certificado
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

const INSTALLMENT_TYPE_LABEL = { matricula: "Matricula", mensualidad: "Mensualidad" };

/**
 * Cuotas (matricula + mensualidades) de cursos con esa modalidad de cobro.
 * `onPay(installment)`, si se pasa, agrega el boton "Marcar pagado" (uso
 * exclusivo del admin - el estudiante solo las ve, no las marca el mismo).
 */
export function InstallmentsList({ installments, onPay, onViewTicket, onExtend }) {
    if (!installments || installments.length === 0) return null;

    return (
        <Card>
            <CardContent className="p-0">
                <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
                    <CreditCard className="h-4 w-4 text-sky-600" />
                    <h3 className="text-sm font-semibold text-[#024A7D]">Cuotas del curso</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                <th className="px-4 py-3">Curso</th>
                                <th className="px-4 py-3">Cuota</th>
                                <th className="px-4 py-3">Monto</th>
                                <th className="px-4 py-3">Vencimiento</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {installments.map((i) => {
                                const label = INSTALLMENT_TYPE_LABEL[i.type] ?? i.type;
                                const isPaid = i.status === "paid";
                                return (
                                    <tr key={i.id} className="border-b last:border-0">
                                        <td className="px-4 py-3 font-medium text-[#024A7D]">{i.course_title}</td>
                                        <td className="px-4 py-3">
                                            {label}
                                            {i.installment_number ? ` #${i.installment_number}` : ""}
                                        </td>
                                        <td className="px-4 py-3">S/ {Number(i.amount).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {formatDate(i.due_date)}
                                            {i.was_extended && (
                                                <span className="ml-1.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
                                                    Ampliado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    "rounded-full px-2.5 py-1 text-xs font-medium",
                                                    isPaid
                                                        ? "bg-[#00ADEE]/15 text-[#024A7D]"
                                                        : i.overdue
                                                          ? "bg-red-100 text-red-700"
                                                          : "bg-amber-100 text-amber-700"
                                                )}
                                            >
                                                {isPaid ? "Pagado" : i.overdue ? "Vencido" : "Pendiente"}
                                            </span>
                                        </td>
                                        {(onPay || (isPaid && onViewTicket) || (!isPaid && onExtend)) && (
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    {!isPaid && onPay && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onPay(i)}
                                                            className="inline-flex items-center gap-1 text-xs font-medium text-[#024A7D] hover:underline"
                                                        >
                                                            <Wallet className="h-3.5 w-3.5" />
                                                            Registrar pago
                                                        </button>
                                                    )}
                                                    {!isPaid && onExtend && !i.was_extended && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onExtend(i)}
                                                            className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:underline"
                                                        >
                                                            <CalendarClock className="h-3.5 w-3.5" />
                                                            Ampliar plazo
                                                        </button>
                                                    )}
                                                    {isPaid && i.receipt_code && onViewTicket && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onViewTicket(i)}
                                                            className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:underline"
                                                        >
                                                            <Receipt className="h-3.5 w-3.5" />
                                                            Ver ticket
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

export function PagosTab({ orders, installments, onPayInstallment, onViewTicket, onExtendInstallment }) {
    const hasInstallments = installments && installments.length > 0;

    if (orders.length === 0 && !hasInstallments) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                    <CreditCard className="h-10 w-10 text-slate-300" />
                    <p className="text-slate-500">Aun no tiene pagos ni solicitudes registradas.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {hasInstallments && (
                <InstallmentsList
                    installments={installments}
                    onPay={onPayInstallment}
                    onViewTicket={onViewTicket}
                    onExtend={onExtendInstallment}
                />
            )}

            {orders.length > 0 && (
                <Card>
                    <CardContent className="p-0">
                        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
                            <FileText className="h-4 w-4 text-amber-600" />
                            <h3 className="text-sm font-semibold text-[#024A7D]">Pedidos de curso (pago único)</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/20 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="px-4 py-3">Curso</th>
                                        <th className="px-4 py-3">Monto</th>
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => {
                                        const status = ORDER_STATUS[o.status] ?? ORDER_STATUS.pending;
                                        return (
                                            <tr key={o.id} className="border-b last:border-0">
                                                <td className="px-4 py-3 font-medium text-[#024A7D]">{o.course_title}</td>
                                                <td className="px-4 py-3">S/ {Number(o.amount).toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", status.className)}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{formatDate(o.created_at)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

/**
 * Banner de portada + avatar + stats + pestañas, identico para el perfil
 * propio del estudiante (Aula/Perfil.jsx) y la vista de un estudiante desde
 * el panel admin (Admin/Students/Show.jsx). `extraAction` reemplaza el
 * boton "Editar perfil" por lo que necesite cada contexto.
 */
export function ProfileHeader({
    name,
    avatarUrl,
    onAvatarChange,
    avatarUploading,
    subtitle,
    email,
    phone,
    createdAt,
    hasCertificate,
    stats,
    tabs,
    tab,
    setTab,
    extraAction,
}) {
    return (
        <div className="-mx-4 -mt-4 mb-0 overflow-hidden rounded-b-xl shadow-sm ring-1 ring-black/5 md:-mx-6 md:-mt-6">
            <div className="relative overflow-hidden bg-[#024A7D]">
                <img
                    src="/assets/img/slider/slider4.jpg"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#024A7D]/90 via-[#024A7D]/75 to-[#4E80A4]/55" />

                <div className="relative px-4 pb-6 pt-12 md:px-6 md:pb-8 md:pt-16">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            {onAvatarChange ? (
                                <AvatarPicker
                                    value={null}
                                    onChange={onAvatarChange}
                                    currentUrl={avatarUrl}
                                    name={name}
                                    uploading={avatarUploading}
                                    size="h-16 w-16 md:h-20 md:w-20 border-white/90 shadow-lg"
                                />
                            ) : (
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-white/90 bg-gradient-to-br from-[#00ADEE] to-[#024A7D] shadow-lg md:h-20 md:w-20">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white md:text-2xl">
                                            {initialsOf(name)}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg font-bold text-white md:text-xl">{name}</h1>
                                    {hasCertificate && (
                                        <Badge className="border-0 bg-[#00ADEE]/25 text-[#59CAF4]">
                                            <Award className="mr-1 h-3 w-3" />
                                            Certificado
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-white/70">{subtitle}</p>
                                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
                                    {email && (
                                        <span className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {email}
                                        </span>
                                    )}
                                    {phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {phone}
                                        </span>
                                    )}
                                    {createdAt && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Miembro desde {formatDate(createdAt)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {stats && stats.length > 0 && (
                            <div className="flex gap-2 self-start sm:self-auto">
                                {stats.map((s) => (
                                    <StatCard key={s.label} icon={s.icon} value={s.value} label={s.label} color={s.color} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-14 flex flex-wrap items-center justify-between gap-3 md:mt-20">
                        <div className="flex gap-1 overflow-x-auto rounded-lg bg-white/10 p-1">
                            {tabs.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTab(t.id)}
                                    className={cn(
                                        "group/tab relative flex shrink-0 items-center gap-1.5 overflow-hidden rounded-md px-4 py-2 text-sm font-medium",
                                        tab === t.id
                                            ? "bg-white text-[#024A7D] shadow-sm"
                                            : "text-white/75 hover:text-white"
                                    )}
                                >
                                    {tab !== t.id && (
                                        <span
                                            className="absolute inset-0 origin-right scale-x-0 bg-white/15 transition-transform duration-300 ease-out group-hover/tab:scale-x-100"
                                            aria-hidden="true"
                                        />
                                    )}
                                    <t.icon className="relative h-4 w-4" />
                                    <span className="relative">{t.label}</span>
                                </button>
                            ))}
                        </div>

                        {extraAction}
                    </div>
                </div>
            </div>
        </div>
    );
}
