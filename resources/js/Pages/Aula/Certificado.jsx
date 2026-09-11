import { Head, Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Button } from "@/Components/ui/button";
import { Printer } from "lucide-react";

export default function Certificado({ certificate, enrollment }) {
    const verifyUrl = `${window.location.origin}/certificado/verificar/${certificate.code}`;
    const issuedDate = new Date(certificate.issued_at).toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <>
            <Head title={`Certificado - ${enrollment.course.title}`} />
            <StudentLayout>
                <div className="mx-auto max-w-3xl">
                    <div
                        id="certificate-print"
                        className="rounded-2xl border-[10px] border-[#00ADEE] bg-white p-10 text-center shadow-lg sm:p-14"
                    >
                        <img src="/assets/img/LOGO-ACCESO-VERTICAL.png" alt="Acceso Vertical Perú" className="mx-auto mb-5 h-14" />
                        <p className="text-xs font-bold tracking-[0.2em] text-slate-500">
                            CERTIFICADO DE FINALIZACION
                        </p>
                        <h1 className="mt-4 text-2xl font-extrabold text-[#024A7D] sm:text-3xl">
                            {enrollment.user.name}
                        </h1>
                        <p className="mt-1 text-slate-500">ha completado satisfactoriamente el curso</p>
                        <h2 className="mt-5 text-xl font-extrabold text-[#024A7D] sm:text-2xl">
                            {enrollment.course.title}
                        </h2>
                        <p className="mt-6 text-sm text-slate-500">Emitido el {issuedDate}</p>
                        <p className="mt-4 text-xs text-slate-400">
                            Codigo de verificacion: <strong>{certificate.code}</strong>
                        </p>
                        <p className="break-all text-xs text-slate-400">{verifyUrl}</p>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center gap-2 print:hidden">
                        <Button onClick={() => window.print()}>
                            <Printer className="h-4 w-4" />
                            Imprimir / Guardar como PDF
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/aula-virtual/mis-cursos">Volver a mis cursos</Link>
                        </Button>
                    </div>
                </div>
            </StudentLayout>

            <style>{`
                @media print {
                    header, .print\\:hidden { display: none !important; }
                    #certificate-print { box-shadow: none !important; }
                }
            `}</style>
        </>
    );
}
