import { router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

/**
 * Muestra/oculta el GlobalLoader en las transiciones de pagina de Inertia.
 * Mismo comportamiento en el sitio publico y en el panel admin - ver
 * PublicLayout/AdminLayout, que renderizan <GlobalLoader show={show} />.
 *
 * Delay anti-parpadeo (120ms) antes de mostrarlo, y duracion minima
 * (250ms) una vez mostrado, para que no "titile" en cargas muy rapidas.
 */
export function useGlobalLoader() {
    const [show, setShow] = useState(false);
    const delayRef = useRef(null);
    const minRef = useRef(null);
    const shownRef = useRef(false);

    useEffect(() => {
        const start = () => {
            clearTimeout(delayRef.current);
            clearTimeout(minRef.current);
            delayRef.current = setTimeout(() => {
                shownRef.current = true;
                setShow(true);
            }, 120);
        };

        const finish = () => {
            clearTimeout(delayRef.current);
            if (!shownRef.current) {
                setShow(false);
                return;
            }
            minRef.current = setTimeout(() => {
                shownRef.current = false;
                setShow(false);
            }, 250);
        };

        const unStart = router.on("start", start);
        const unFinish = router.on("finish", finish);

        return () => {
            unStart?.();
            unFinish?.();
            clearTimeout(delayRef.current);
            clearTimeout(minRef.current);
        };
    }, []);

    return show;
}
