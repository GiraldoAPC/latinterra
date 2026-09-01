import { Head, Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { GraduationCap } from "lucide-react";

export default function MisCursos({ enrollments }) {
    return (
        <>
            <Head title="Mis Cursos | Aula Virtual" />
            <StudentLayout title="Mis cursos">
                {enrollments.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <GraduationCap className="h-10 w-10 text-slate-300" />
                            <p className="text-slate-500">Aun no estas inscrito en ningun curso.</p>
                            <Button asChild>
                                <Link href="/aula">Ver catalogo de cursos</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {enrollments.map((e) => (
                            <Card key={e.id}>
                                <CardContent className="p-5">
                                    <Badge variant={e.status === "completed" ? "default" : "secondary"}>
                                        {e.status === "completed" ? "Completado" : "En curso"}
                                    </Badge>
                                    <h3 className="mt-2 font-semibold text-[#14264a]">{e.course.title}</h3>

                                    <div className="mt-3">
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-[#58b22d]"
                                                style={{ width: `${e.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500">{e.progress}% completado</span>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Button asChild size="sm">
                                            <Link href={`/aula/${e.course.slug}`}>
                                                {e.progress >= 100 ? "Revisar" : "Continuar"}
                                            </Link>
                                        </Button>
                                        {e.progress >= 100 && (
                                            <Button asChild size="sm" variant="secondary">
                                                <Link href={`/aula/${e.course.slug}/examen`}>Examen</Link>
                                            </Button>
                                        )}
                                        {e.has_certificate && (
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/aula/certificado/${e.id}`}>Certificado</Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </StudentLayout>
        </>
    );
}
