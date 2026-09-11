import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import NewStudentModal from "@/Components/Admin/NewStudentModal";
import EditStudentModal from "@/Components/Admin/EditStudentModal";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Download,
    Users,
    UserCheck,
    ShieldCheck,
    Building2,
    ChevronDown,
    Eye,
    KeyRound,
    UserX,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

function labelFrom(options, value) {
    return options?.find((o) => o.value === value)?.label ?? value ?? "—";
}

function StatCard({ icon: Icon, value, label, color }) {
    const colors = {
        sky: "bg-sky-500/10 text-sky-600",
        green: "bg-[#00ADEE]/10 text-[#024A7D]",
        amber: "bg-amber-500/10 text-amber-600",
        violet: "bg-violet-500/10 text-violet-600",
    };
    return (
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <span className={`box-border flex h-10 w-10 shrink-0 items-center justify-center rounded-lg leading-none ${colors[color]}`}>
                <Icon className="h-5 w-5" />
            </span>
            <div>
                <div className="text-xl font-bold leading-none">{value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{label}</div>
            </div>
        </div>
    );
}

const ACTION_ICON_COLORS = {
    sky: "bg-sky-500/10 text-sky-600",
    green: "bg-[#00ADEE]/10 text-[#024A7D]",
    amber: "bg-amber-500/10 text-amber-600",
    red: "bg-red-500/10 text-red-600",
    slate: "bg-slate-500/10 text-slate-600",
};

function ActionIcon({ icon: Icon, color }) {
    return (
        <span className={`box-border flex h-6 w-6 shrink-0 items-center justify-center rounded-md leading-none ${ACTION_ICON_COLORS[color]}`}>
            <Icon className="h-3.5 w-3.5" />
        </span>
    );
}

export default function Index({ students, filters, stats, courses, documentTypes, genderOptions, sctrOptions }) {
    const [search, setSearch] = useState(filters?.search ?? "");
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const isFirstRun = useRef(true);

    // Busqueda automatica: espera a que el usuario deje de escribir (300ms)
    // y consulta sin recargar la pagina, sin necesidad de boton "Buscar".
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            router.get(
                "/admin/cursos/estudiantes",
                { search },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const [openMenuId, setOpenMenuId] = useState(null);

    const openEdit = (student) => {
        // Cierra el DropdownMenu de forma explicita y recien despues (dado
        // tiempo a que termine su animacion de cierre) abre el modal de
        // edicion. Dejarselo al cierre "automatico" de Radix + abrir el
        // Dialog en el mismo evento es justo lo que lo hace cerrarse solo.
        setOpenMenuId(null);
        setTimeout(() => setEditingStudent(student), 200);
    };

    const handleDelete = (student) => {
        if (!confirm(`¿Eliminar al estudiante "${student.name}"? Esta accion no se puede deshacer.`)) return;
        router.delete(`/admin/estudiantes/${student.id}`);
    };

    const handleToggleActive = (student) => {
        router.post(`/admin/estudiantes/${student.id}/toggle-active`, {}, { preserveScroll: true });
    };

    const handleResetPassword = (student) => {
        if (!confirm(`¿Restablecer la contrasena de "${student.name}" a su numero de documento (${student.dni || "sin DNI"})?`)) return;
        router.post(`/admin/estudiantes/${student.id}/reset-password`, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Estudiantes" />
            <AdminLayout title="Estudiantes">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Estudiantes</h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona las cuentas de estudiantes del aula virtual.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/admin/estudiantes/exportar">
                                <Download className="h-4 w-4" />
                                Exportar reporte
                            </a>
                        </Button>
                        <Button onClick={() => setShowModal(true)}>
                            <Plus className="h-4 w-4" />
                            Nuevo estudiante
                        </Button>
                    </div>
                </div>

                {stats && (
                    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatCard icon={Users} value={stats.total} label="Total estudiantes" color="sky" />
                        <StatCard icon={UserCheck} value={stats.active} label="Cuentas activas" color="green" />
                        <StatCard icon={ShieldCheck} value={stats.sctr_vigente} label="SCTR vigente" color="amber" />
                        <StatCard icon={Building2} value={stats.companies} label="Empresas distintas" color="violet" />
                    </div>
                )}

                <div className="relative mb-4 max-w-sm">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, email, DNI o empresa..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto rounded-xl border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Apellidos y nombres</TableHead>
                                <TableHead>Tipo doc.</TableHead>
                                <TableHead>N° documento</TableHead>
                                <TableHead>Telefono</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Curso</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        No se encontraron estudiantes.
                                    </TableCell>
                                </TableRow>
                            )}
                            {students.map((student) => {
                                const courseTitles = student.course_titles ?? [];
                                return (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#00ADEE] to-[#024A7D] text-xs font-bold leading-none text-white">
                                                    {student.avatar_url ? (
                                                        <img src={student.avatar_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        (student.name?.[0] ?? "?").toUpperCase()
                                                    )}
                                                </span>
                                                <div>
                                                    <div className="font-medium">
                                                        {[student.last_name, student.name].filter(Boolean).join(" ")}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{student.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="uppercase">{labelFrom(documentTypes, student.document_type)}</TableCell>
                                        <TableCell>{student.dni || "—"}</TableCell>
                                        <TableCell>{student.phone || "—"}</TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    "border-0",
                                                    student.is_active
                                                        ? "bg-[#00ADEE]/15 text-[#024A7D] hover:bg-[#00ADEE]/15"
                                                        : "bg-red-100 text-red-700 hover:bg-red-100"
                                                )}
                                            >
                                                {student.is_active ? "Activo" : "Suspendido"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[220px]">
                                            {courseTitles.length === 0 ? (
                                                <span className="text-xs text-muted-foreground">Sin cursos</span>
                                            ) : (
                                                <span className="text-sm">
                                                    {courseTitles[0]}
                                                    {courseTitles.length > 1 && (
                                                        <span className="ml-1 text-xs text-muted-foreground">
                                                            +{courseTitles.length - 1}
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu
                                                open={openMenuId === student.id}
                                                onOpenChange={(v) => setOpenMenuId(v ? student.id : null)}
                                            >
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm">
                                                        Acciones
                                                        <ChevronDown className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-52"
                                                    onCloseAutoFocus={(e) => e.preventDefault()}
                                                >
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/estudiantes/${student.id}/perfil`}>
                                                            <ActionIcon icon={Eye} color="sky" />
                                                            Ver perfil
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onSelect={(e) => {
                                                            e.preventDefault();
                                                            openEdit(student);
                                                        }}
                                                    >
                                                        <ActionIcon icon={Pencil} color="green" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleResetPassword(student)}>
                                                        <ActionIcon icon={KeyRound} color="amber" />
                                                        Restablecer contrasena
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleActive(student)}>
                                                        {student.is_active ? (
                                                            <>
                                                                <ActionIcon icon={UserX} color="slate" />
                                                                Suspender
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ActionIcon icon={UserCheck} color="green" />
                                                                Activar
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(student)}
                                                        className="text-destructive data-[highlighted]:text-destructive"
                                                    >
                                                        <ActionIcon icon={Trash2} color="red" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </AdminLayout>

            <NewStudentModal
                open={showModal}
                onOpenChange={setShowModal}
                courses={courses}
                documentTypes={documentTypes}
                genderOptions={genderOptions}
                sctrOptions={sctrOptions}
            />
            <EditStudentModal
                open={!!editingStudent}
                onOpenChange={(v) => !v && setEditingStudent(null)}
                student={editingStudent}
                documentTypes={documentTypes}
                genderOptions={genderOptions}
                sctrOptions={sctrOptions}
                courses={courses}
            />
        </>
    );
}
