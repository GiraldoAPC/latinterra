import { Dialog, DialogContent } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { ShieldAlert } from "lucide-react";

/**
 * Alerta modal (no un banner inline) para cuando la edad del estudiante no
 * alcanza el minimo configurado en el curso elegido. Se dispara desde
 * useStudentStepValidation al intentar avanzar de paso.
 */
export default function AgeRestrictionModal({ message, onClose }) {
    return (
        <Dialog open={!!message} onOpenChange={(v) => !v && onClose()}>
            <DialogContent
                showClose={false}
                className="max-w-sm overflow-hidden border-0 p-0 shadow-2xl"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <div className="bg-gradient-to-br from-red-500 to-red-700 px-6 pb-8 pt-7 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
                        <ShieldAlert className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mt-4 text-base font-bold text-white">
                        Edad minima no cumplida
                    </h2>
                </div>

                <div className="-mt-4 space-y-4 rounded-t-2xl bg-background px-6 pb-6 pt-5">
                    <p className="text-center text-sm leading-relaxed text-foreground">{message}</p>
                    <Button className="w-full" onClick={onClose}>
                        Entendido
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
