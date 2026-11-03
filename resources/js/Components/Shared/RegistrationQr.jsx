import { useEffect, useRef } from 'react';
import { BrowserQRCodeSvgWriter } from '@zxing/library';

export default function RegistrationQr({ url }) {
    const container = useRef(null);
    useEffect(() => {
        const element = container.current;
        element.replaceChildren(new BrowserQRCodeSvgWriter().write(url, 220, 220));
        return () => element.replaceChildren();
    }, [url]);
    return <div>
        <div ref={container} role="img" aria-label="QR para registrar participantes" className="w-fit bg-white p-2" />
        <button type="button" className="mt-2 text-sm underline" onClick={() => {
            const svg = container.current.querySelector('svg');
            if (!svg) return;
            const link = document.createElement('a');
            link.download = 'registro-participantes.svg';
            link.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
            link.click();
        }}>Descargar QR</button>
    </div>;
}
