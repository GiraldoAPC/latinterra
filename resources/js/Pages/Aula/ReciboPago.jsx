import { Head, Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import PaymentTicket from "@/Components/Shared/PaymentTicket";
import { ArrowLeft } from "lucide-react";

export default function ReciboPago({ student, installment }) {
    return (
        <>
            <Head title={`Ticket de pago - ${installment.receipt_code}`} />
            <StudentLayout title="Ticket de pago">
                <Link
                    href="/aula-virtual/perfil"
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground print:hidden"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver a mi perfil
                </Link>

                <PaymentTicket student={student} installment={installment} />
            </StudentLayout>
        </>
    );
}
