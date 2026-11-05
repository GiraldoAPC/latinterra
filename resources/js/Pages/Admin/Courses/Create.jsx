import { PageHeader } from '@/Components/Shared/PageDesign';
import { GraduationCap as DesignIcon } from 'lucide-react';
import { Head, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import CourseStepper from "@/Components/Admin/CourseStepper";
import CourseInfoFields from "@/Components/Admin/CourseInfoFields";
import { Button } from "@/Components/ui/button";
import { ArrowRight } from "lucide-react";

const STEPS = [
    { id: 1, label: "Informacion general" },
    { id: 2, label: "Modulos y clases" },
    { id: 3, label: "Revisar y publicar" },
];

export default function Create({ courses = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        summary: "",
        description: "",
        price: "0",
        is_free: true,
        billing_type: "unico",
        enrollment_fee: "",
        monthly_fee: "",
        duration_months: "",
        payment_required: true,
        min_age: "",
        access_duration_days: "",
        prerequisite_course_id: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/admin/cursos");
    };

    return (
        <>
            <Head title="Nuevo curso" />
            <AdminLayout title="Nuevo curso">
                <PageHeader icon={DesignIcon} title="Nuevo curso" description="Configura la información, los módulos y la publicación del curso." />
                <CourseStepper steps={STEPS} current={1} completedUntil={1} />

                <form onSubmit={submit} className="space-y-6">
                    <CourseInfoFields data={data} setData={setData} errors={errors} courses={courses} />

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Crear curso y continuar
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </AdminLayout>
        </>
    );
}
