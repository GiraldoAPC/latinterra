import { Head, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import StudentFormFields from "@/Components/Admin/StudentFormFields";
import { Button } from "@/Components/ui/button";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        last_name: "",
        gender: "",
        email: "",
        phone: "",
        document_type: "dni",
        dni: "",
        company: "",
        position: "",
        birth_date: "",
        address: "",
        district: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        blood_type: "",
        medical_conditions: "",
        sctr_status: "",
        sctr_expires_at: "",
        previous_experience: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/admin/estudiantes");
    };

    return (
        <>
            <Head title="Nuevo estudiante" />
            <AdminLayout title="Nuevo estudiante">
                <form onSubmit={submit} className="max-w-3xl space-y-6">
                    <StudentFormFields data={data} setData={setData} errors={errors} showAccountFields />

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Registrar estudiante
                        </Button>
                    </div>
                </form>
            </AdminLayout>
        </>
    );
}
