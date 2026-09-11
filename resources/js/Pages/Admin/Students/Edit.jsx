import { Head, Link, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import StudentFormFields from "@/Components/Admin/StudentFormFields";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useFocusFirstError } from "@/hooks/useFocusFirstError";

export default function Edit({ student }) {
    const { data, setData, put, processing, errors } = useForm({
        name: student.name ?? "",
        last_name: student.last_name ?? "",
        gender: student.gender ?? "",
        email: student.email ?? "",
        phone: student.phone ?? "",
        document_type: student.document_type ?? "dni",
        dni: student.dni ?? "",
        company: student.company ?? "",
        position: student.position ?? "",
        is_active: student.is_active,
        birth_date: student.birth_date ?? "",
        address: student.address ?? "",
        district: student.district ?? "",
        emergency_contact_name: student.emergency_contact_name ?? "",
        emergency_contact_phone: student.emergency_contact_phone ?? "",
        blood_type: student.blood_type ?? "",
        medical_conditions: student.medical_conditions ?? "",
        sctr_status: student.sctr_status ?? "",
        sctr_expires_at: student.sctr_expires_at ?? "",
        previous_experience: student.previous_experience ?? "",
    });

    useFocusFirstError(errors);

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/estudiantes/${student.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title={`Estudiante: ${student.name}`} />
            <AdminLayout title={student.name}>
                <Link
                    href="/admin/cursos/estudiantes"
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver a estudiantes
                </Link>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
                    <form onSubmit={submit} className="space-y-6">
                        <StudentFormFields data={data} setData={setData} errors={errors} />

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                Guardar cambios
                            </Button>
                        </div>
                    </form>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Cursos inscritos ({student.enrollments_count})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {student.enrollments.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Sin inscripciones.</p>
                                )}
                                {student.enrollments.map((e) => (
                                    <div key={e.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                        <span className="truncate">{e.course.title}</span>
                                        <Badge variant={e.status === "completed" ? "default" : "secondary"}>
                                            {e.status === "completed" ? "Completado" : "En curso"}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Ordenes de pago</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {student.course_orders.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Sin ordenes registradas.</p>
                                )}
                                {student.course_orders.map((o) => (
                                    <div key={o.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                        <span className="truncate">{o.course.title}</span>
                                        <span className="text-xs text-muted-foreground">
                                            S/ {Number(o.amount).toFixed(2)} · {o.status}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
