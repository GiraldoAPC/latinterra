import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import PaymentTicket from "@/Components/Shared/PaymentTicket";
import { ArrowLeft } from "lucide-react";

export default function ReciboOtroPago({ student, installment }) {
    return (
        <>
            <Head title={`Ticket de pago - ${installment.receipt_code}`} />
            <AdminLayout title="Ticket de pago">
                <Link
                    href="/admin/ventas/otros-pagos"
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground print:hidden"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver a otros pagos
                </Link>

                <PaymentTicket student={student} installment={installment} />
            </AdminLayout>
        </>
    );
}
