import { useEffect, useRef } from 'react';
import { BrowserQRCodeSvgWriter } from '@zxing/library';

export default function CertificateTemplate({ name, course, code, issuedAt, expiresAt, score, status, preview = false }) {
    const qrRef = useRef(null);
    const verifyUrl = `${window.location.origin}/certificado/verificar/${encodeURIComponent(code)}`;
    useEffect(() => {
        const container = qrRef.current;
        if (!container || preview) return;
        container.replaceChildren(new BrowserQRCodeSvgWriter().write(verifyUrl, 92, 92));
        return () => container.replaceChildren();
    }, [verifyUrl, preview]);
    const date = new Date(issuedAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
    return <>
        <article id="certificate-print" className="certificate-sheet">
            <div className="certificate-inner">
                <img src="/assets/img/LOGO-ACCESO-VERTICAL.png" alt="Acceso Vertical Perú" />
                <p className="eyebrow">{preview ? 'MODELO · SIN VALIDEZ' : 'ACCESO VERTICAL PERÚ'}</p>
                <h1>CERTIFICADO</h1><p className="subtitle">DE FINALIZACIÓN</p>
                <p>Se otorga el presente certificado a</p>
                <h2>{name}</h2>
                <p>Por haber completado satisfactoriamente el curso</p>
                <h3>{course}</h3>
                <p className="date">Emitido el {date}</p>
                <p>
                    Nota: {score == null ? 'No registrada' : `${Number(score).toFixed(2)} / 20`}
                    {expiresAt && <> · Vence el {new Date(expiresAt).toLocaleDateString('es-PE')}</>}
                    {status && <> · {status === 'valid' ? 'Vigente' : status === 'expired' ? 'Vencido' : 'Vigencia no disponible'}</>}
                </p>
                <div className="signatures">
                    <div>Representante de la empresa<small>Firma institucional</small></div>
                    <div>Instructor responsable<small>Firma del instructor</small></div>
                </div>
                <footer><span>Código: <strong>{code}</strong></span>
                    {preview ? <span>Datos de ejemplo · Firmas pendientes de configurar</span> : <a className="certificate-verification" href={verifyUrl}><span ref={qrRef} aria-hidden="true" />Verificar autenticidad</a>}
                </footer>
            </div>
        </article>
        <style>{`
            .certificate-sheet { box-sizing:border-box; width:100%; max-width:1120px; margin:auto; padding:18px; border:2px solid #024a7d; background:linear-gradient(135deg,#024a7d 0 3%,white 3% 97%,#00adee 97%); color:#183449; box-shadow:0 12px 40px #024a7d18; }
            .certificate-inner { padding:28px 44px 20px; border:1px solid #a9c9da; background:white; text-align:center; }
            .certificate-inner>img { width:180px; height:70px; object-fit:contain; margin:auto; }
            .certificate-sheet .eyebrow { margin:20px 0 8px; font-size:11px; letter-spacing:4px; }
            .certificate-sheet h1 { font-family:Georgia,serif; font-size:clamp(28px,5vw,56px); letter-spacing:4px; line-height:1.15; color:#024a7d; }
            .certificate-sheet .subtitle { margin:10px 0 28px; letter-spacing:5px; font-size:12px; color:#397b98; }
            .certificate-sheet p { color:#607381; font-size:14px; margin:14px 0; }
            .certificate-sheet h2 { font-family:Georgia,serif; font-size:clamp(24px,4vw,36px); line-height:1.25; border-bottom:1px solid #bcd6e1; padding:0 12px 16px; margin:0 auto 18px; overflow-wrap:anywhere; }
            .certificate-sheet h3 { font-size:clamp(18px,3vw,25px); font-weight:700; color:#024a7d; line-height:1.3; overflow-wrap:anywhere; }
            .certificate-sheet .date { margin:22px 0; font-size:13px; }
            .certificate-sheet .signatures { display:flex; justify-content:space-around; gap:40px; margin:60px 0 28px; }
            .certificate-sheet .signatures>div { border-top:1px solid #69899b; padding-top:10px; width:240px; font-size:12px; }
            .certificate-sheet small { display:block; color:#718491; margin-top:3px; }
            .certificate-sheet footer { border-top:1px solid #dce9ef; padding-top:14px; display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; font-size:10px; color:#607381; }
            .certificate-sheet footer a { text-decoration:underline; }
            .certificate-verification { display:flex; align-items:center; gap:10px; }
            .certificate-verification svg { width:92px; height:92px; }
            @media(max-width:640px) { .certificate-inner { padding:20px 14px; } .certificate-sheet .signatures { gap:20px; } }
            @media print {
                @page { size:A4 landscape; margin:10mm; }
                body * { visibility:hidden !important; }
                #certificate-print, #certificate-print * { visibility:visible !important; }
                #certificate-print { position:absolute; left:0; top:0; width:277mm; max-width:none; box-shadow:none; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
                .certificate-inner { padding:7mm 12mm 5mm; }
                .certificate-sheet h1 { font-size:48px; }
                .certificate-sheet h2 { font-size:32px; }
                .certificate-sheet h3 { font-size:23px; }
                .certificate-sheet .signatures { break-inside:avoid; margin-top:14mm; }
            }
        `}</style>
    </>;
}
