import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import PaymentTicket from "@/Components/Shared/PaymentTicket";
import { ArrowLeft } from "lucide-react";

export default function ReciboPago({ student, installment }) {
    return (
        <>
            <Head title={`Ticket de pago - ${installment.receipt_code}`} />
            <AdminLayout title="Ticket de pago">
                <Link
                    href={`/admin/estudiantes/${student.id}/perfil`}
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground print:hidden"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver al perfil
                </Link>

                <PaymentTicket student={student} installment={installment} />
            </AdminLayout>
        </>
    );
}
