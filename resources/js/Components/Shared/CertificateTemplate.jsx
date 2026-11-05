import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BrowserQRCodeSvgWriter } from '@zxing/library';
import './certificate.css';

const dateLabel = (value) => value ? new Date(value).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Por registrar';
const hoursLabel = (value) => value != null && value !== '' ? `${Number(value).toLocaleString('es-PE', { maximumFractionDigits: 2 })} horas` : 'Por configurar';

function VerificationCode({ url, preview }) {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current || preview) return;
        const element = ref.current;
        element.replaceChildren(new BrowserQRCodeSvgWriter().write(url, 108, 108));
        return () => element.replaceChildren();
    }, [url, preview]);
    return preview ? <div className="cert-qr-placeholder">QR de verificación<br />al emitir</div> : <a href={url} className="cert-qr-link" aria-label="Verificar autenticidad del certificado"><span ref={ref} /></a>;
}

function Syllabus({ content }) {
    const ref = useRef(null);
    useEffect(() => {
        const element = ref.current;
        const fit = () => {
            if (!element?.clientWidth || !element?.clientHeight) return;
            let size = 13;
            element.style.fontSize = `${size}px`;
            while (size > 9.5 && (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)) {
                size -= .25;
                element.style.fontSize = `${size}px`;
            }
        };
        const observer = new ResizeObserver(fit);
        if (element) observer.observe(element);
        document.fonts?.ready.then(fit);
        window.addEventListener('beforeprint', fit);
        fit();
        return () => { observer.disconnect(); window.removeEventListener('beforeprint', fit); };
    }, [content]);
    const lines = String(content ?? '').trim().split(/\r\n|\r|\n/).filter((line) => line.trim());
    return <div className="cert-syllabus" ref={ref}>
        {lines.length ? lines.map((line, i) => <p key={i} className={/^\s+/.test(line) ? 'cert-subtopic' : ''}>{line.trim()}</p>) : <p className="cert-unconfigured">El temario de este curso está pendiente de configuración.</p>}
    </div>;
}

function CertificateFrame() {
    return <svg className="cert-frame" viewBox="0 0 297 210" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <rect x="2" y="2" width="293" height="206" fill="none" stroke="#024a7d" strokeWidth=".7" />
        <rect x="6" y="6" width="285" height="198" fill="none" stroke="#9bbdce" strokeWidth=".25" />
        <path d="M0 0H82L75 3H3V46L0 53ZM297 210H215L222 207H294V164L297 157Z" fill="#024a7d" />
        <path d="M5 5H58L53 6H6V33L5 35ZM292 205H239L244 204H291V177L292 175Z" fill="#00adee" />
        <path d="M297 0H258L263 2H295V30L297 34ZM0 210H39L34 208H2V180L0 176Z" fill="#00adee" />
        <path d="M10 10H28M10 10V28M287 200H269M287 200V182M287 10H275M287 10V22M10 200H22M10 200V188" fill="none" stroke="#024a7d" strokeWidth=".45" />
    </svg>;
}

function CertificateSheets({ name, course, code, issuedAt, expiresAt, score, signatories, documentLabel, modality, preview, content, durationHours, verifyUrl }) {
    return <>
        <article className="certificate-sheet cert-front" data-certificate-face="front">
            <CertificateFrame />
            <header className="cert-header">
                <div className="cert-issuer"><img src="/assets/img/LOGO-ACCESO-VERTICAL.png" alt="Acceso Vertical" /><div><strong>ACCESO VERTICAL S.A.C.</strong><span>Capacitación y formación técnica</span></div></div>
                <div className="cert-reference"><span>{preview ? 'MODELO · SIN VALIDEZ' : 'CERTIFICADO DE CAPACITACIÓN'}</span><strong>{code}</strong></div>
            </header>
            <div className="cert-award">
                <h1>CERTIFICADO</h1>
                <p className="cert-subtitle">DE CAPACITACIÓN</p>
                <p>Acceso Vertical S.A.C. otorga el presente certificado a</p>
                <h2 className={name?.length > 48 ? 'cert-long-name' : ''}>{name}</h2>
                {documentLabel && <p className="cert-document">Identificado(a) con {documentLabel}</p>}
                <p>Por haber completado satisfactoriamente el curso</p>
                <h3>{course}</h3>
                {modality && <p className="cert-modality">{modality}</p>}
                <div className="cert-issue"><span>Fecha de emisión: <strong>{dateLabel(issuedAt)}</strong></span>{score != null && <span>Nota final: <strong>{Number(score).toFixed(2)} / 20</strong></span>}</div>
            </div>
            <div className="cert-signatures">
                {(signatories.length ? signatories : [{ name: 'Representante de la empresa', role: 'company' }, { name: 'Instructor responsable', role: 'instructor' }]).map((signer, i) => <div key={i}>
                    <div className="cert-signature-image">{signer.url ? <img src={signer.url} alt={`Firma de ${signer.name}`} /> : <span>Firma pendiente</span>}</div>
                    <strong>{signer.name}</strong><span>{signer.role === 'company' ? 'Representante de la empresa' : 'Instructor'}</span>
                </div>)}
            </div>
            <footer className="cert-front-footer"><span>{preview ? 'Documento de ejemplo, sin validez.' : 'La autenticidad de este documento se verifica mediante el código QR del reverso.'}</span><span>Anverso · 1 / 2</span></footer>
        </article>
        <article className="certificate-sheet cert-back" data-certificate-face="back">
            <CertificateFrame />
            <header className="cert-back-header"><div><p>CONTENIDO DE LA CAPACITACIÓN</p><h2>{course}</h2></div><span>{code}</span></header>
            <Syllabus content={content} />
            <footer className="cert-back-footer">
                <div className="cert-duration"><span>DURACIÓN TOTAL</span><strong>{hoursLabel(durationHours)}</strong><p>{expiresAt ? `Certificado válido hasta el ${dateLabel(expiresAt)}.` : 'Vigencia pendiente de registrar.'}</p><small>{name} · Reverso · 2 / 2</small></div>
                <div className="cert-verification"><div><strong>Verificación de autenticidad</strong><span>{code}</span>{!preview && <a href={verifyUrl}>{verifyUrl}</a>}</div><VerificationCode url={verifyUrl} preview={preview} /></div>
            </footer>
        </article>
    </>;
}

export default function CertificateTemplate({ name, course, code, issuedAt, expiresAt, score, status, signatories = [], documentLabel, modality, preview = false, content, durationHours }) {
    useEffect(() => {
        document.body.classList.add('lt-certificate-document');
        return () => document.body.classList.remove('lt-certificate-document');
    }, []);
    const verifyUrl = `${window.location.origin}/certificado/verificar/${encodeURIComponent(code)}`;
    const props = { name, course, code, issuedAt, expiresAt, score, signatories, documentLabel, modality, preview, content, durationHours, verifyUrl };
    return <>
        <style media="print">{'@page { size:A4 landscape; margin:10mm; }'}</style>
        <div className="certificate-screen-root">
            <div className="cert-screen-note">Anverso y reverso · A4 horizontal. En celular, desliza cada hoja para revisarla.{status === 'expired' && ' Este certificado se encuentra vencido.'}</div>
            <div className="certificate-preview"><CertificateSheets {...props} /></div>
        </div>
        {createPortal(<div className="certificate-print-root"><CertificateSheets {...props} /></div>, document.body)}
    </>;
}
