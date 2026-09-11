import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/Components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";

const DOC_LABELS = { dni: "DNI", ce: "Carne de extranjeria", pasaporte: "Pasaporte", ruc: "RUC" };

function labelFrom(options, value) {
    return options?.find((o) => o.value === value)?.label ?? value ?? "—";
}

function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between border-b border-dashed py-1.5 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-[#024A7D]">{value || "—"}</span>
        </div>
    );
}

export default function FichaMatricula({ student, enrollment, documentTypes, genderOptions }) {
    const fullName = [student.last_name, student.name].filter(Boolean).join(" ") || student.name;
    const location = student.distrito_id
        ? [student.district, "Peru"].filter(Boolean).join(", ")
        : [student.ciudad_extranjero, student.pais_nombre].filter(Boolean).join(", ");

    return (
        <>
            <Head title={`Ficha de matricula - ${fullName}`} />
            <AdminLayout title="Ficha de matricula">
                <Link
                    href={`/admin/estudiantes/${student.id}/perfil`}
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground print:hidden"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver al perfil
                </Link>

                <div className="mx-auto max-w-2xl">
                    <div id="ficha-print" className="rounded-xl border bg-white p-8 shadow-sm">
                        <div className="mb-6 flex items-center justify-between border-b-4 border-[#00ADEE] pb-4">
                            <div>
                                <img src="/assets/img/LOGO-ACCESO-VERTICAL.png" alt="Acceso Vertical Perú" className="h-10" />
                            </div>
                            <div className="text-right">
                                <h1 className="text-lg font-extrabold text-[#024A7D]">FICHA DE MATRICULA</h1>
                                <p className="text-xs text-slate-500">Emitida el {formatDate(new Date())}</p>
                            </div>
                        </div>

                        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#024A7D]">
                            Datos del estudiante
                        </h2>
                        <div className="mb-5">
                            <Row label="Nombres y apellidos" value={fullName} />
                            <Row label="Tipo y numero de documento" value={`${labelFrom(documentTypes, student.document_type) ?? DOC_LABELS[student.document_type]} ${student.dni ?? ""}`} />
                            <Row label="Genero" value={labelFrom(genderOptions, student.gender)} />
                            <Row label="Fecha de nacimiento" value={formatDate(student.birth_date)} />
                            <Row label="Correo electronico" value={student.email} />
                            <Row label="Telefono" value={student.phone} />
                            <Row label="Direccion" value={student.address} />
                            <Row label="Ubicacion" value={location} />
                            <Row label="Empresa" value={student.company} />
                            <Row label="Cargo" value={student.position} />
                        </div>

                        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#024A7D]">
                            Datos de la matricula
                        </h2>
                        <div className="mb-2">
                            <Row label="Curso" value={enrollment.course.title} />
                            <Row label="Fecha de inscripcion" value={formatDate(enrollment.created_at)} />
                            <Row label="Estado" value={enrollment.status === "completed" ? "Completado" : "En curso"} />
                        </div>

                        <div className="mt-10 flex justify-between text-center text-xs text-slate-500">
                            <div className="w-40 border-t pt-1">Firma del estudiante</div>
                            <div className="w-40 border-t pt-1">Firma / sello Acceso Vertical Perú</div>
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
                    #ficha-print { box-shadow: none !important; border: none !important; }
                }
            `}</style>
        </>
    );
}
