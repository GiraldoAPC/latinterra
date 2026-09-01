import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function Index({ courses }) {
    const handleDelete = (course) => {
        if (!confirm(`¿Eliminar el curso "${course.title}"? Esta accion no se puede deshacer.`)) {
            return;
        }
        router.delete(`/admin/cursos/${course.id}`);
    };

    return (
        <>
            <Head title="Aula virtual - Cursos" />
            <AdminLayout title="Aula virtual">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-lg font-semibold">Cursos</h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona el contenido del aula virtual.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/cursos/nuevo">
                            <Plus className="h-4 w-4" />
                            Nuevo curso
                        </Link>
                    </Button>
                </div>

                <div className="rounded-xl border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Titulo</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Modulos</TableHead>
                                <TableHead>Inscritos</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        Aun no hay cursos creados.
                                    </TableCell>
                                </TableRow>
                            )}
                            {courses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell>
                                        {course.is_free ? "Gratis" : `S/ ${Number(course.price).toFixed(2)}`}
                                    </TableCell>
                                    <TableCell>{course.modules_count}</TableCell>
                                    <TableCell>{course.enrollments_count}</TableCell>
                                    <TableCell>
                                        <Badge variant={course.is_published ? "default" : "secondary"}>
                                            {course.is_published ? "Publicado" : "Borrador"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/admin/cursos/${course.id}`}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(course)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </AdminLayout>
        </>
    );
}
