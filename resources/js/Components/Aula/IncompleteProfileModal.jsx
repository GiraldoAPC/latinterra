import { Dialog, DialogContent } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { UserCog } from "lucide-react";

/**
 * Alerta modal (no un banner inline) que se muestra al entrar al perfil si
 * al estudiante le faltan datos obligatorios (cuentas migradas antiguas,
 * etc.) - mismo estilo "premium" que AgeRestrictionModal.
 */
export default function IncompleteProfileModal({ open, missing, onUpdate, onDismiss }) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onDismiss()}>
            <DialogContent
                showClose={false}
                className="max-w-sm overflow-hidden border-0 p-0 shadow-2xl"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-6 pb-8 pt-7 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
                        <UserCog className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mt-4 text-base font-bold text-white">Es necesario actualizar tus datos</h2>
                </div>

                <div className="-mt-4 space-y-4 rounded-t-2xl bg-background px-6 pb-6 pt-5">
                    <p className="text-center text-sm leading-relaxed text-foreground">
                        Para seguir usando el sistema sin dificultades (ficha de matricula, certificados, etc.)
                        completa: <span className="font-semibold">{missing.join(", ")}</span>.
                    </p>
                    <div className="flex flex-col gap-2">
                        <Button className="w-full" onClick={onUpdate}>
                            Actualizar mis datos
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={onDismiss}>
                            Mas tarde
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
