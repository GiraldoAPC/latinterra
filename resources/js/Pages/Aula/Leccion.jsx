import { Head, Link, router } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { CircleCheck, CirclePlay } from "lucide-react";

export default function Leccion({ course, lesson, enrollment, completedLessonIds, allCompleted }) {
    const isCompleted = completedLessonIds.includes(lesson.id);

    const markComplete = () => {
        router.post(`/aula/${course.slug}/clase/${lesson.id}/completar`);
    };

    return (
        <>
            <Head title={`${lesson.title} - ${course.title}`} />
            <StudentLayout>
                <p className="mb-3 text-sm text-slate-500">
                    <Link href={`/aula/${course.slug}`} className="hover:underline">{course.title}</Link>
                    {" / "}
                    {lesson.title}
                </p>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                    <div>
                        <div className="relative overflow-hidden rounded-2xl bg-black" style={{ paddingTop: "56.25%" }}>
                            <iframe
                                src={`https://www.youtube-nocookie.com/embed/${lesson.youtube_video_id}`}
                                title={lesson.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 h-full w-full border-0"
                            />
                        </div>

                        <h1 className="mt-4 text-xl font-bold text-[#14264a]">{lesson.title}</h1>
                        {lesson.description && <p className="mt-1 text-slate-500">{lesson.description}</p>}

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button onClick={markComplete} disabled={isCompleted}>
                                {isCompleted ? "Clase completada" : "Marcar como completada"}
                            </Button>
                            {allCompleted && (
                                <Button asChild variant="secondary">
                                    <Link href={`/aula/${course.slug}/examen`}>Rendir examen final</Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <aside>
                        <Card className="mb-4">
                            <CardContent className="p-4">
                                <span className="text-sm text-slate-500">Progreso del curso</span>
                                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-[#58b22d]"
                                        style={{ width: `${enrollment.progress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-400">{enrollment.progress}%</span>
                            </CardContent>
                        </Card>

                        {course.modules.map((m) => (
                            <div key={m.id} className="mb-4">
                                <h4 className="mb-1.5 text-sm font-bold text-[#14264a]">{m.title}</h4>
                                <ul className="space-y-0.5">
                                    {m.lessons.map((l) => {
                                        const done = completedLessonIds.includes(l.id);
                                        const active = l.id === lesson.id;
                                        return (
                                            <li key={l.id}>
                                                <Link
                                                    href={`/aula/${course.slug}/clase/${l.id}`}
                                                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${
                                                        active
                                                            ? "bg-[#58b22d]/10 font-semibold text-[#3e9f25]"
                                                            : "text-slate-600 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    {done ? (
                                                        <CircleCheck className="h-4 w-4 shrink-0 text-[#58b22d]" />
                                                    ) : (
                                                        <CirclePlay className="h-4 w-4 shrink-0 text-slate-300" />
                                                    )}
                                                    {l.title}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </aside>
                </div>
            </StudentLayout>
        </>
    );
}
