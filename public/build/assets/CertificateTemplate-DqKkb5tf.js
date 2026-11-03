import{j as e}from"./app-WfjnknwL.js";function o({name:a,course:r,code:i,issuedAt:s,preview:t=!1}){const n=new Date(s).toLocaleDateString("es-PE",{year:"numeric",month:"long",day:"numeric"});return e.jsxs(e.Fragment,{children:[e.jsx("article",{id:"certificate-print",className:"certificate-sheet",children:e.jsxs("div",{className:"certificate-inner",children:[e.jsx("img",{src:"/assets/img/LOGO-ACCESO-VERTICAL.png",alt:"Acceso Vertical Perú"}),e.jsx("p",{className:"eyebrow",children:t?"MODELO · SIN VALIDEZ":"ACCESO VERTICAL PERÚ"}),e.jsx("h1",{children:"CERTIFICADO"}),e.jsx("p",{className:"subtitle",children:"DE FINALIZACIÓN"}),e.jsx("p",{children:"Se otorga el presente certificado a"}),e.jsx("h2",{children:a}),e.jsx("p",{children:"Por haber completado satisfactoriamente el curso"}),e.jsx("h3",{children:r}),e.jsxs("p",{className:"date",children:["Emitido el ",n]}),e.jsxs("div",{className:"signatures",children:[e.jsxs("div",{children:["Representante de la empresa",e.jsx("small",{children:"Firma institucional"})]}),e.jsxs("div",{children:["Instructor responsable",e.jsx("small",{children:"Firma del instructor"})]})]}),e.jsxs("footer",{children:[e.jsxs("span",{children:["Código: ",e.jsx("strong",{children:i})]}),t?e.jsx("span",{children:"Datos de ejemplo · Firmas pendientes de configurar"}):e.jsx("a",{href:`/certificado/verificar/${encodeURIComponent(i)}`,children:"Verificar autenticidad"})]})]})}),e.jsx("style",{children:`
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
        `})]})}export{o as C};
