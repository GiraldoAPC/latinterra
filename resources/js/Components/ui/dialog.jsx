import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Un <Select>/<Popover> o un <Dialog> anidado (ej. "agregar cliente" desde
// adentro de "vender producto") renderiza su contenido en un portal aparte
// (document.body), fuera del DOM de este DialogContent. Cuando el Dialog es
// modal={false} (nuestro caso, para que el calendario/selects de adentro
// sean clickeables), Radix trata ese clic como "fuera" del Dialog y lo
// cierra. Esto detecta ambos casos (el wrapper que Radix le pone a todo
// contenido tipo popper: Select, Popover, DropdownMenu... y el role="dialog"
// de un Dialog anidado) y evita que el Dialog se cierre por eso.
function isInsideNestedRadixContent(target) {
    return !!(
        target instanceof Element &&
        (target.closest("[data-radix-popper-content-wrapper]") || target.closest('[role="dialog"]'))
    );
}

const DialogContent = React.forwardRef(
    ({ className, children, showClose = true, onPointerDownOutside, onInteractOutside, ...props }, ref) => (
        <DialogPortal>
            {/* DialogPrimitive.Overlay solo se renderiza cuando el Dialog es
                modal (Radix la oculta por completo si modal={false}), y
                aca usamos modal={false} a proposito para que los
                Select/Popover de adentro sean clickeables. Este div
                reemplaza esa pieza puramente visual (el fondo oscuro) sin
                depender de esa bandera - el cierre por click afuera lo
                sigue manejando el propio Dialog, no este div. */}
            <div className="fixed inset-0 z-50 animate-in bg-black/80 fade-in" aria-hidden="true" />
            <DialogPrimitive.Content
                ref={ref}
                className={cn(
                    "fixed left-[50%] top-[50%] z-50 flex max-h-[96vh] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-hidden bg-background p-6 shadow-xl outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
                    className
                )}
                onPointerDownOutside={(e) => {
                    if (isInsideNestedRadixContent(e.target)) {
                        e.preventDefault();
                        return;
                    }
                    onPointerDownOutside?.(e);
                }}
                onInteractOutside={(e) => {
                    if (isInsideNestedRadixContent(e.target)) {
                        e.preventDefault();
                        return;
                    }
                    onInteractOutside?.(e);
                }}
                {...props}
            >
            {children}
            {showClose && (
                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Cerrar</span>
                </DialogPrimitive.Close>
            )}
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }) => (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
};
