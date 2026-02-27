import { Head, router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import GlobalLoader from "@/Components/GlobalLoader";

export default function PublicLayout({ title = "Latin Terra", children }) {
  const [show, setShow] = useState(false);

  const delayRef = useRef(null);
  const minRef = useRef(null);
  const shownRef = useRef(false);

  useEffect(() => {
    const start = () => {
      clearTimeout(delayRef.current);
      clearTimeout(minRef.current);

      // Delay anti-parpadeo
      delayRef.current = setTimeout(() => {
        shownRef.current = true;
        setShow(true);
      }, 120);
    };

    const finish = () => {
      clearTimeout(delayRef.current);

      // Si nunca llegó a mostrarse, no hagas nada
      if (!shownRef.current) {
        setShow(false);
        return;
      }

      // Duración mínima para que se vea “pro”
      minRef.current = setTimeout(() => {
        shownRef.current = false;
        setShow(false);
      }, 250);
    };

    // ✅ Inertia: router.on() retorna "unsubscribe"
    const unStart = router.on("start", start);
    const unFinish = router.on("finish", finish);

    return () => {
      unStart?.();
      unFinish?.();
      clearTimeout(delayRef.current);
      clearTimeout(minRef.current);
    };
  }, []);

  return (
    <>
      <Head title={title} />
      <GlobalLoader show={show} />
      <div className="lt-public min-h-screen flex flex-col bg-[#f4f7fb] text-slate-900">{children}</div>
    </>
  );
}
