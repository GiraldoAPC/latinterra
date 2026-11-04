import { usePage, router } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Lock, LayoutGrid } from "lucide-react";

/**
 * Aviso centrado (mismo patron que DebtBlockModal) cuando el estudiante
 * intenta entrar a un curso cuyo plazo de acceso ya vencio.
 */
export default function CourseLockedModal() {
    const courseLocked = usePage().props.flash?.course_locked;

    if (!courseLocked) return null;

    return (
        <Dialog open onOpenChange={() => {}}>
            <DialogContent className="max-w-sm text-center" showClose={false}>
                <DialogHeader className="items-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                        <Lock className="h-7 w-7 text-amber-600" />
                    </span>
                    <DialogTitle className="mt-3 text-lg">{courseLocked.reason === "completed" ? "Curso finalizado" : "Acceso vencido"}</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    {courseLocked.message}
                    {courseLocked.course && (
                        <>
                            {" "}
                            <span className="font-medium text-[#024A7D]">({courseLocked.course})</span>
                        </>
                    )}
                </p>

                <Button className="mt-2 w-full" onClick={() => router.visit("/aula-virtual/mis-cursos")}>
                    <LayoutGrid className="h-4 w-4" />
                    Ver mis cursos
                </Button>
            </DialogContent>
        </Dialog>
    );
}
