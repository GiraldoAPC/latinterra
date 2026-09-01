import { Head, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        summary: "",
        description: "",
        price: "0",
        is_free: true,
        passing_score: "70",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/admin/cursos");
    };

    return (
        <>
            <Head title="Nuevo curso" />
            <AdminLayout title="Nuevo curso">
                <Card className="max-w-2xl">
                    <CardContent className="p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Titulo del curso</label>
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                    value={data.title}
                                    onChange={(e) => setData("title", e.target.value)}
                                />
                                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium">Resumen corto</label>
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                    value={data.summary}
                                    onChange={(e) => setData("summary", e.target.value)}
                                    placeholder="Aparece en la tarjeta del catalogo"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Descripcion completa</label>
                                <textarea
                                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                    rows={5}
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_free"
                                    checked={data.is_free}
                                    onChange={(e) => setData("is_free", e.target.checked)}
                                />
                                <label htmlFor="is_free" className="text-sm font-medium">
                                    Curso gratuito
                                </label>
                            </div>

                            {!data.is_free && (
                                <div>
                                    <label className="text-sm font-medium">Precio (S/)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                        value={data.price}
                                        onChange={(e) => setData("price", e.target.value)}
                                    />
                                    {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium">Nota minima para aprobar el examen (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                    value={data.passing_score}
                                    onChange={(e) => setData("passing_score", e.target.value)}
                                />
                            </div>

                            <Button type="submit" disabled={processing}>
                                Crear curso y continuar
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </AdminLayout>
        </>
    );
}
