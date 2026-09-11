import { useEffect, useRef } from "react";

/**
 * Cuando el backend devuelve errores de validacion (formularios largos de
 * una sola pagina, no wizard), lleva la pantalla y el foco al primer campo
 * invalido - igual que el salto de paso del stepper de admin, pero para
 * paginas planas (Perfil del estudiante, Editar estudiante).
 */
export function useFocusFirstError(errors) {
    const lastErrorsRef = useRef(null);

    useEffect(() => {
        const keys = Object.keys(errors ?? {});
        if (keys.length === 0) {
            lastErrorsRef.current = null;
            return;
        }
        // Solo salta cuando llega un error nuevo (no en cada render con los
        // mismos errores, por ej. al tipear en otro campo del mismo form).
        const signature = keys.join(",");
        if (signature === lastErrorsRef.current) return;
        lastErrorsRef.current = signature;

        const el = document.getElementById(keys[0]);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus?.({ preventScroll: true });
        }
    }, [errors]);
}
