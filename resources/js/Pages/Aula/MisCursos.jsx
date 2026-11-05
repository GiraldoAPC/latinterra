import { PageHeader } from '@/Components/Shared/PageDesign';
import { GraduationCap as DesignIcon } from 'lucide-react';
import { Head, Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { GraduationCap, Award, CheckCircle2, ArrowRight } from "lucide-react";

const BANNER_GRADIENTS = [
    "from-[#024A7D] to-[#4E80A4]",
    "from-[#024A7D] to-[#00ADEE]",
    "from-[#0f6f96] to-[#14a0c9]",
    "from-[#0077a8] to-[#59CAF4]",
];

function bannerFor(id) {
    return BANNER_GRADIENTS[id % BANNER_GRADIENTS.length];
}

export default function MisCursos({ enrollments }) {
    return (
        <>
            <Head title="Mis Cursos | Aula Virtual" />
            <StudentLayout title="Mis cursos">
                <PageHeader icon={DesignIcon} title="Mis cursos" description="Consulta tu avance, continúa tu formación y accede a tus certificados." />
                {enrollments.filter((enrollment) => enrollment.certificate_notice).map((enrollment) => (
                    <div key={`notice-${enrollment.id}`} role="status" className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                        <strong>{enrollment.course.title}</strong>
                        <p>{enrollment.certificate_notice.message}</p>
                        <p>Vencimiento: {new Date(enrollment.certificate_notice.expires_at).toLocaleDateString('es-PE')}</p>
                    </div>
                ))}

                {enrollments.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <GraduationCap className="h-10 w-10 text-slate-300" />
                            <p className="text-slate-500">Aun no estas inscrito en ningun curso.</p>
                            <Button asChild>
                                <Link href="/aula-virtual/catalogo">Ver catalogo de cursos</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {enrollments.map((e) => {
                            // "Completado" solo cuando aprobo el quiz de cada
                            // modulo (enrollment.status), no solo por ver
                            // todas las clases (e.progress solo mide avance).
                            const isCertified = e.status === "completed";

                            return (
                                <Card
                                    key={e.id}
                                    className="group overflow-hidden py-0 transition-shadow hover:shadow-lg"
                                >
                                    {/* Banner */}
                                    <div
                                        className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${bannerFor(
                                            e.course.id
                                        )}`}
                                    >
                                        <GraduationCap className="h-10 w-10 text-white/25" />
                                        <div className="absolute left-3 top-3">
                                            <Badge
                                                className={
                                                    isCertified
                                                        ? "border-0 bg-white text-[#024A7D]"
                                                        : "border-0 bg-white/15 text-white backdrop-blur"
                                                }
                                            >
                                                {isCertified ? (
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Completado
                                                    </span>
                                                ) : (
                                                    "En curso"
                                                )}
                                            </Badge>
                                        </div>
                                        {e.has_certificate && (
                                            <div className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
                                                <Award className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="p-5">
                                        <h3 className="line-clamp-2 font-semibold leading-snug text-[#024A7D]">
                                            {e.course.title}
                                        </h3>
                                        {e.course.summary && (
                                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                                {e.course.summary}
                                            </p>
                                        )}

                                        <div className="mt-4">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500">Progreso</span>
                                                <span className="font-semibold text-[#024A7D]">
                                                    {e.progress}%
                                                </span>
                                            </div>
                                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-[#00ADEE] to-[#59CAF4] transition-all"
                                                    style={{ width: `${e.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                            {!isCertified && (
                                            <Button asChild size="sm">
                                                <Link href={`/aula/${e.course.slug}/continuar`}>
                                                    Continuar
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </Button>
                                            )}
                                            {e.has_certificate && (
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/aula/certificado/${e.id}`}>
                                                        <Award className="h-3.5 w-3.5" />
                                                        Certificado
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                        {isCertified && (
                                            <p className="mt-3 text-xs text-slate-500">Curso finalizado. El acceso al contenido está cerrado.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </StudentLayout>
        </>
    );
}
