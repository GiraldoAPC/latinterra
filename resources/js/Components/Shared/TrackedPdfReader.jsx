import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import PdfViewer from './PdfViewer';

export default function TrackedPdfReader({ material, onComplete }) {
    const [progress, setProgress] = useState(null);
    const [page, setPage] = useState(1);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState('');
    const [paused, setPaused] = useState(false);
    const live = useRef({ page, ready });
    live.current = { page, ready };
    const completed = useRef(onComplete);
    completed.current = onComplete;
    const sendRef = useRef(null);

    useEffect(() => {
        let disposed = false, token = null, done = false, queue = Promise.resolve();
        const base = `/aula/material/${material.id}/lectura`;
        const accept = (data) => {
            if (disposed) return;
            setProgress(data);
            setError('');
            if (data.complete && !done) { done = true; completed.current?.(material.id); }
        };
        const failed = (err) => {
            if (disposed) return;
            const data = err.response?.data;
            setError(Object.values(data?.errors ?? {}).flat()[0] || data?.message || 'No se pudo guardar la lectura. Cierra el material y vuelve a abrirlo para retomar tu avance.');
            // Stop approval after stale sessions, access revocation or network failure.
            token = null;
        };
        const send = () => {
            const snapshot = { page: live.current.page, active: live.current.ready && document.visibilityState === 'visible' && document.hasFocus() };
            setPaused(!snapshot.active);
            queue = queue.then(async () => {
                if (disposed || !token || done) return;
                try { accept((await axios.post(`${base}/avance`, { token, ...snapshot }, { timeout: 10000 })).data); }
                catch (err) { failed(err); }
            });
        };
        sendRef.current = send;
        axios.post(`${base}/iniciar`, {}, { timeout: 20000 }).then(({ data }) => {
            if (disposed) return;
            token = data.token;
            setPage(data.page);
            live.current.page = data.page;
            accept(data);
        }).catch(failed);
        const interval = setInterval(send, 3000);
        document.addEventListener('visibilitychange', send);
        window.addEventListener('focus', send);
        window.addEventListener('blur', send);
        return () => {
            disposed = true;
            clearInterval(interval);
            document.removeEventListener('visibilitychange', send);
            window.removeEventListener('focus', send);
            window.removeEventListener('blur', send);
            sendRef.current = null;
            // Without a final pause, a quick reopen still cannot count time away: start rotates the token.
            if (token && !done) axios.post(`${base}/avance`, { token, page: live.current.page, active: false }, { timeout: 5000 }).catch(() => {});
        };
    }, [material.id]);

    useEffect(() => { sendRef.current?.(); }, [page, ready]);

    const changePage = (next) => {
        if (next === page) return;
        setReady(false);
        setPage(next);
    };
    const allowed = progress ? Math.min(progress.page_count, progress.completed_pages + 1) : 1;
    const elapsed = progress && page === progress.completed_pages + 1 ? progress.elapsed_ms : 0;
    const remaining = progress ? Math.ceil((progress.seconds_per_page * 1000 - elapsed) / 1000) : 12;

    return <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 border-b bg-white px-4 py-2 text-xs text-[#024A7D]" role="status" aria-live="polite">
            {error ? <span className="text-red-700">{error}</span> : !progress ? 'Preparando lectura…' : progress.complete ? 'Lectura completada y guardada.' : <>
                <span className="font-semibold">{progress.completed_pages} de {progress.page_count} páginas revisadas.</span>{' '}
                {page <= progress.completed_pages ? 'Página ya revisada.' : `Página ${page}: faltan ${remaining} s de lectura validada.`}{' '}
                {paused ? 'El tiempo se pausa al salir de la ventana.' : 'Mantén esta página visible para continuar.'}
            </>}
        </div>
        <div className="min-h-0 flex-1">
            {progress && <PdfViewer url={material.url} page={page} maxPage={allowed} expectedPages={progress.page_count} onPageChange={changePage} onPageReady={setReady} />}
        </div>
    </div>;
}
