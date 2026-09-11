import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";

function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
}

function StatusBadge({ passed }) {
    if (passed === null || passed === undefined) {
        return <Badge variant="secondary">Sin rendir</Badge>;
    }
    return (
        <Badge className={passed ? "border-0 bg-[#00ADEE]/15 text-[#024A7D]" : "border-0 bg-red-100 text-red-700"}>
            {passed ? "Aprobado" : "Desaprobado"}
        </Badge>
    );
}

export default function RecordNotas({ student, enrollment, modules, finalExam }) {
    const fullName = [student.last_name, student.name].filter(Boolean).join(" ") || student.name;

    return (
        <>
            <Head title={`Record de notas - ${fullName}`} />
            <AdminLayout title="Record de notas (RCI)">
                <Link
                    href={`/admin/estudiantes/${student.id}/perfil`}
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground print:hidden"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver al perfil
                </Link>

                <div className="mx-auto max-w-3xl">
                    <div id="rci-print" className="rounded-xl border bg-white p-8 shadow-sm">
                        <div className="mb-6 flex items-center justify-between border-b-4 border-[#00ADEE] pb-4">
                            <img src="/assets/img/LOGO-ACCESO-VERTICAL.png" alt="Acceso Vertical Perú" className="h-10" />
                            <div className="text-right">
                                <h1 className="text-lg font-extrabold text-[#024A7D]">RECORD INTEGRAL DE NOTAS (RCI)</h1>
                                <p className="text-xs text-slate-500">Emitido el {formatDate(new Date())}</p>
                            </div>
                        </div>

                        <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                            <p><span className="text-slate-500">Estudiante: </span><span className="font-medium text-[#024A7D]">{fullName}</span></p>
                            <p><span className="text-slate-500">DNI/Doc: </span><span className="font-medium text-[#024A7D]">{student.dni ?? "—"}</span></p>
                            <p><span className="text-slate-500">Curso: </span><span className="font-medium text-[#024A7D]">{enrollment.course.title}</span></p>
                            <p><span className="text-slate-500">Inscrito el: </span><span className="font-medium text-[#024A7D]">{formatDate(enrollment.created_at)}</span></p>
                        </div>

                        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#024A7D]">
                            Evaluaciones por modulo
                        </h2>
                        <div className="mb-5 overflow-hidden rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="px-3 py-2">Modulo</th>
                                        <th className="px-3 py-2">Nota</th>
                                        <th className="px-3 py-2">Resultado</th>
                                        <th className="px-3 py-2">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modules.map((m, i) => (
                                        <tr key={i} className="border-b last:border-0">
                                            <td className="px-3 py-2 font-medium text-[#024A7D]">{m.title}</td>
                                            <td className="px-3 py-2">{m.has_exam ? (m.score ?? "—") : "Sin quiz"}</td>
                                            <td className="px-3 py-2">{m.has_exam ? <StatusBadge passed={m.passed} /> : "—"}</td>
                                            <td className="px-3 py-2 text-slate-500">{formatDate(m.submitted_at)}</td>
                                        </tr>
                                    ))}
                                    {modules.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                                                Este curso no tiene modulos.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {finalExam && (
                            <>
                                <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#024A7D]">
                                    Examen final
                                </h2>
                                <div className="mb-5 flex items-center justify-between rounded-md border px-4 py-3 text-sm">
                                    <div>
                                        <p className="font-medium text-[#024A7D]">
                                            Nota: {finalExam.score ?? "—"} / Minimo para aprobar: {Number(finalExam.passing_score).toFixed(0)}
                                        </p>
                                        <p className="text-xs text-slate-500">Rendido el {formatDate(finalExam.submitted_at)}</p>
                                    </div>
                                    <StatusBadge passed={finalExam.passed} />
                                </div>
                            </>
                        )}

                        <div className="mt-6 flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm">
                            <span className="text-slate-500">Estado general del curso</span>
                            <Badge className={enrollment.status === "completed" ? "border-0 bg-[#00ADEE]/15 text-[#024A7D]" : "border-0"}>
                                {enrollment.status === "completed" ? "Completado" : `En curso (${enrollment.progress}%)`}
                            </Badge>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center gap-2 print:hidden">
                        <Button onClick={() => window.print()}>
                            <Printer className="h-4 w-4" />
                            Imprimir / Guardar como PDF
                        </Button>
                    </div>
                </div>
            </AdminLayout>

            <style>{`
                @media print {
                    header, .print\\:hidden { display: none !important; }
                    #rci-print { box-shadow: none !important; border: none !important; }
                }
            `}</style>
        </>
    );
}
