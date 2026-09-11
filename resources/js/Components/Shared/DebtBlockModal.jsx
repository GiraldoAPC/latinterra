import { usePage, router } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { AlertTriangle, CreditCard } from "lucide-react";

/**
 * Aviso centrado (no el toast generico) cuando el estudiante intenta entrar
 * a una clase con una cuota vencida y el curso exige estar al dia para
 * avanzar - "Aceptar" lo manda directo a la pestana de Pagos de su perfil.
 */
export default function DebtBlockModal() {
    const debtBlock = usePage().props.flash?.debt_block;

    if (!debtBlock) return null;

    return (
        <Dialog open onOpenChange={() => {}}>
            <DialogContent className="max-w-sm text-center" showClose={false}>
                <DialogHeader className="items-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-7 w-7 text-red-600" />
                    </span>
                    <DialogTitle className="mt-3 text-lg">Cuota vencida</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    {debtBlock.message}
                    {debtBlock.course && (
                        <>
                            {" "}
                            <span className="font-medium text-[#024A7D]">({debtBlock.course})</span>
                        </>
                    )}
                </p>

                <Button
                    className="mt-2 w-full"
                    onClick={() => router.visit("/aula-virtual/perfil?tab=pagos")}
                >
                    <CreditCard className="h-4 w-4" />
                    Ver mis pagos
                </Button>
            </DialogContent>
        </Dialog>
    );
}
