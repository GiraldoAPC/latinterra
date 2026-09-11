import { Head, Link, router } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { GraduationCap, Lock, ArrowRight, Clock3 } from "lucide-react";

const BANNER_GRADIENTS = [
    "from-[#024A7D] to-[#4E80A4]",
    "from-[#024A7D] to-[#00ADEE]",
    "from-[#0f6f96] to-[#14a0c9]",
    "from-[#7c3aed] to-[#a78bfa]",
];

function bannerFor(id) {
    return BANNER_GRADIENTS[id % BANNER_GRADIENTS.length];
}

export default function CatalogoSistema({ courses }) {
    const requestAccess = (course) => {
        router.post(`/aula/${course.slug}/inscribirme`);
    };

    return (
        <>
            <Head title="Catalogo de cursos | Aula Virtual" />
            <StudentLayout title="Catalogo de cursos">
                <h1 className="mb-1 text-xl font-bold text-[#024A7D]">Catalogo de cursos</h1>
                <p className="mb-4 text-sm text-slate-500">
                    Explora todos los cursos disponibles e inscribete sin salir del panel.
                </p>

                {courses.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <GraduationCap className="h-10 w-10 text-slate-300" />
                            <p className="text-slate-500">Todavia no hay cursos publicados.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => {
                            const locked = !course.enrolled && !course.pending;

                            return (
                                <Card key={course.id} className="group overflow-hidden py-0 transition-shadow hover:shadow-lg">
                                    <div
                                        className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${bannerFor(
                                            course.id
                                        )}`}
                                    >
                                        <GraduationCap className="h-10 w-10 text-white/25" />
                                        <div className="absolute left-3 top-3">
                                            <Badge
                                                className={
                                                    course.enrolled
                                                        ? "border-0 bg-white text-[#024A7D]"
                                                        : "border-0 bg-white/15 text-white backdrop-blur"
                                                }
                                            >
                                                {course.enrolled
                                                    ? "Inscrito"
                                                    : course.pending
                                                    ? "Solicitud enviada"
                                                    : course.is_free
                                                    ? "Gratis"
                                                    : `S/ ${Number(course.price).toFixed(2)}`}
                                            </Badge>
                                        </div>
                                        {locked && (
                                            <div className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
                                                <Lock className="h-3.5 w-3.5" />
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="p-5">
                                        <h3 className="line-clamp-2 font-semibold leading-snug text-[#024A7D]">
                                            {course.title}
                                        </h3>
                                        {course.summary && (
                                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{course.summary}</p>
                                        )}

                                        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Clock3 className="h-3.5 w-3.5" />
                                                {course.total_lessons} clases
                                            </span>
                                            <span>{course.enrollments_count} inscritos</span>
                                        </div>

                                        <div className="mt-4">
                                            {course.enrolled ? (
                                                <Button asChild size="sm" className="w-full">
                                                    <Link href={`/aula/${course.slug}/continuar`}>
                                                        Continuar
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                            ) : course.pending ? (
                                                <Button size="sm" variant="outline" className="w-full" disabled>
                                                    Solicitud en revision
                                                </Button>
                                            ) : (
                                                <Button size="sm" className="w-full" onClick={() => requestAccess(course)}>
                                                    <Lock className="h-3.5 w-3.5" />
                                                    {course.is_free ? "Inscribirme gratis" : "Solicitar acceso"}
                                                </Button>
                                            )}
                                        </div>
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
