import { useEffect } from "react";
import { Dialog, DialogContent } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import CourseStepper from "@/Components/Admin/CourseStepper";
import { ArrowLeft, ArrowRight, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Standard "branded gradient header + step content + sticky footer" modal
 * used across the admin panel for multi-step create/edit flows (students,
 * and any future module that needs the same pattern).
 *
 * IMPORTANT: the gradient background lives directly on DialogContent (not
 * on a separate nested div) and the body's white background lives on its
 * own inner div. This specific structure was tuned to avoid a 1px seam
 * Chrome leaves when a differently-colored rounded child is clipped inside
 * a rounded, overflow-hidden parent — don't "simplify" it back to a nested
 * colored header div without re-checking the corners.
 *
 * Props:
 * - open, onOpenChange
 * - icon: lucide icon component for the header badge
 * - title: string
 * - stepLabel: string, e.g. `Paso ${step} de ${total}`
 * - steps: [{ id, label }] for the CourseStepper
 * - currentStep, onStepClick
 * - meta: { icon, title, description, color } for the active step's inline heading (color = tailwind bg/text classes)
 * - onBack, onNext, onSubmit, canGoBack, isLastStep, submitLabel, processing
 * - onClose
 * - children: the active step's fields
 */
export default function StepperModal({
    open,
    onOpenChange,
    icon: HeaderIcon,
    title,
    stepLabel,
    steps,
    currentStep,
    onStepClick,
    meta,
    headerExtra,
    onBack,
    onNext,
    onSubmit,
    canGoBack,
    isLastStep,
    submitLabel = "Guardar",
    processing = false,
    onClose,
    children,
}) {
    // Dialog modal={false} (necesario para que los <Select>/<Popover> de
    // adentro sean clickeables) hace que Radix NO bloquee el scroll del
    // fondo por su cuenta. Lo hacemos a mano: mientras el modal esta
    // abierto, la pagina de atras no debe poder scrollear ni mostrar su
    // propio scrollbar.
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    return (
        <Dialog modal={false} open={open} onOpenChange={(v) => (v ? onOpenChange(true) : onClose())}>
            <DialogContent
                className="max-w-5xl gap-0 overflow-hidden rounded-lg bg-gradient-to-r from-[#024A7D] via-[#024A7D] to-[#4E80A4] p-0"
                showClose={false}
                onOpenAutoFocus={(e) => e.preventDefault()}
                // Este modal solo debe cerrarse con la X o "Cancelar" - nunca
                // por clic afuera ni por interacciones con Select/Popover
                // (que ya de por si generaban cierres falsos al ser un
                // Dialog no-modal). Escape sigue funcionando (no lo tocamos).
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <div className="flex min-h-0 flex-1 flex-col">
                    <div className="relative flex shrink-0 items-center px-5 py-2.5">
                        <div className="flex items-center gap-2.5">
                            <span className="box-border flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00ADEE] to-[#024A7D] leading-none text-white">
                                {HeaderIcon && <HeaderIcon className="h-5 w-5 shrink-0" />}
                            </span>
                            <div>
                                <h2 className="text-sm font-bold leading-tight text-white">{title}</h2>
                                {stepLabel && <p className="text-[11px] leading-tight text-white/60">{stepLabel}</p>}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Cerrar"
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-[18px] w-[18px]" />
                        </button>
                    </div>

                    <div className="lt-modal-scroll min-h-0 flex-1 overflow-y-auto rounded-b-lg bg-background px-6 pt-4">
                        {steps && (
                            <CourseStepper
                                steps={steps}
                                current={currentStep}
                                completedUntil={steps.length}
                                onStepClick={onStepClick}
                                bare
                            />
                        )}

                        <form
                            onSubmit={onSubmit}
                            onKeyDown={(e) => {
                                // El form es unico para los 4 pasos: sin esto,
                                // un Enter presionado en cualquier campo (de
                                // cualquier paso) enviaria el formulario de
                                // inmediato en vez de simplemente avanzar.
                                // Solo debe enviarse desde el boton final.
                                if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                                    e.preventDefault();
                                    if (!isLastStep) onNext();
                                }
                            }}
                        >
                            <div
                                key={currentStep}
                                className="animate-in fade-in slide-in-from-right-4 duration-300 ease-out"
                            >
                                {meta && (
                                    <div className="mb-4 flex items-start justify-between gap-2.5">
                                        <div className="flex items-start gap-2.5">
                                            <span
                                                className={cn(
                                                    "box-border flex h-8 w-8 shrink-0 items-center justify-center rounded-lg leading-none",
                                                    meta.color
                                                )}
                                            >
                                                <meta.icon className="h-4.5 w-4.5" />
                                            </span>
                                            <div>
                                                <h3 className="text-sm font-semibold text-foreground">{meta.title}</h3>
                                                <p className="text-xs text-muted-foreground">{meta.description}</p>
                                            </div>
                                        </div>
                                        {headerExtra}
                                    </div>
                                )}

                                {children}
                            </div>

                            <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-between bg-background px-6 py-4 shadow-[0_-1px_6px_rgba(0,0,0,0.06)]">
                                <Button type="button" variant="outline" disabled={!canGoBack} onClick={onBack}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Anterior
                                </Button>

                                {!isLastStep ? (
                                    // key distinta a la del boton de abajo:
                                    // sin esto React reutiliza el MISMO
                                    // <button> y solo le cambia el atributo
                                    // type de "button" a "submit" al llegar
                                    // al ultimo paso - y el navegador evalua
                                    // la accion del click con el type NUEVO,
                                    // enviando el formulario con ese mismo
                                    // clic en "Siguiente".
                                    <Button key="next" type="button" onClick={onNext}>
                                        Siguiente
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button key="submit" type="submit" disabled={processing}>
                                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {processing ? "Guardando..." : submitLabel}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
