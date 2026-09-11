import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Muestra los mensajes de back()->with('success'|'error', ...) que los
 * controladores ya seteaban por todo el sistema pero que nunca llegaban a
 * verse (Inertia no comparte los flash de sesion automaticamente, a
 * diferencia de "errors" de validacion - se comparten a mano en
 * HandleInertiaRequests). Se cierra solo a los 5s o con la X.
 */
export default function FlashToast() {
    const { success, error } = usePage().props.flash ?? {};
    const [dismissedKey, setDismissedKey] = useState(null);

    const message = error || success;
    const isError = !!error;
    const key = message ? `${isError ? "e" : "s"}:${message}` : null;

    useEffect(() => {
        if (!key || key === dismissedKey) return;
        const t = setTimeout(() => setDismissedKey(key), 5000);
        return () => clearTimeout(t);
    }, [key, dismissedKey]);

    if (!message || key === dismissedKey) return null;

    return (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
            <div
                className={cn(
                    "pointer-events-auto flex max-w-md items-start gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm",
                    isError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
                )}
            >
                {isError ? (
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                ) : (
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                )}
                <p className="font-medium leading-snug">{message}</p>
                <button
                    type="button"
                    onClick={() => setDismissedKey(key)}
                    className="ml-1 shrink-0 opacity-60 hover:opacity-100"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
