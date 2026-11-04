import{r as h,j as e}from"./app-DqZlHsn8.js";import{BrowserQRCodeSvgWriter as u}from"./index-BNTu4YSw.js";function v({name:x,course:m,code:n,issuedAt:f,expiresAt:s,score:c,status:r,signatories:o=[],documentLabel:d,modality:p,preview:t=!1}){const l=h.useRef(null),a=`${window.location.origin}/certificado/verificar/${encodeURIComponent(n)}`;h.useEffect(()=>{const i=l.current;if(!(!i||t))return i.replaceChildren(new u().write(a,92,92)),()=>i.replaceChildren()},[a,t]);const g=new Date(f).toLocaleDateString("es-PE",{year:"numeric",month:"long",day:"numeric"});return e.jsxs(e.Fragment,{children:[e.jsx("article",{id:"certificate-print",className:"certificate-sheet",children:e.jsxs("div",{className:"certificate-inner",children:[e.jsx("img",{src:"/assets/img/LOGO-ACCESO-VERTICAL.png",alt:"Acceso Vertical Perú"}),e.jsx("p",{className:"eyebrow",children:t?"MODELO · SIN VALIDEZ":"ACCESO VERTICAL PERÚ"}),e.jsx("h1",{children:"CERTIFICADO"}),e.jsx("p",{className:"subtitle",children:"DE FINALIZACIÓN"}),e.jsx("p",{children:"Se otorga el presente certificado a"}),e.jsx("h2",{children:x}),d&&e.jsx("p",{children:d}),e.jsx("p",{children:"Por haber completado satisfactoriamente el curso"}),e.jsx("h3",{children:m}),p&&e.jsx("p",{children:p}),e.jsxs("p",{className:"date",children:["Emitido el ",g]}),e.jsxs("p",{children:["Nota: ",c==null?"No registrada":`${Number(c).toFixed(2)} / 20`,s&&e.jsxs(e.Fragment,{children:[" · Vence el ",new Date(s).toLocaleDateString("es-PE")]}),r&&e.jsxs(e.Fragment,{children:[" · ",r==="valid"?"Vigente":r==="expired"?"Vencido":"Vigencia no disponible"]})]}),e.jsx("div",{className:"signatures",children:o.length?o.map((i,w)=>e.jsxs("div",{children:[e.jsx("img",{src:i.url,alt:`Firma de ${i.name}`}),e.jsx("strong",{children:i.name}),e.jsx("small",{children:i.role==="company"?"Representante de la empresa":"Instructor"})]},w)):e.jsxs(e.Fragment,{children:[e.jsxs("div",{children:["Representante de la empresa",e.jsx("small",{children:"Firma no registrada"})]}),e.jsxs("div",{children:["Instructor responsable",e.jsx("small",{children:"Firma no registrada"})]})]})}),e.jsxs("footer",{children:[e.jsxs("span",{children:["Código: ",e.jsx("strong",{children:n})]}),t?e.jsx("span",{children:"Datos de ejemplo · Firmas pendientes de configurar"}):e.jsxs("a",{className:"certificate-verification",href:a,children:[e.jsx("span",{ref:l,"aria-hidden":"true"}),"Verificar autenticidad"]})]})]})}),e.jsx("style",{children:`
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
            .certificate-sheet .signatures { display:flex; flex-wrap:wrap; justify-content:space-around; gap:24px; margin:28px 0; }
            .certificate-sheet .signatures>div { padding-top:10px; width:200px; max-width:100%; font-size:12px; }
            .certificate-sheet .signatures img { width:150px; height:60px; object-fit:contain; margin:0 auto 5px; }
            .certificate-sheet .signatures strong { display:block; border-top:1px solid #69899b; padding-top:6px; }
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
                #certificate-print { position:absolute; left:0; top:0; width:277mm; height:190mm; max-width:none; padding:4mm; box-shadow:none; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
                .certificate-inner { box-sizing:border-box; height:100%; padding:5mm 8mm; display:flex; flex-direction:column; align-items:center; justify-content:space-between; gap:1mm; }
                .certificate-inner>img { width:42mm; height:12mm; margin:0 auto; }
                .certificate-sheet h1 { font-size:38px; line-height:1.1; }
                .certificate-sheet h2 { width:100%; font-size:27px; margin:0; padding:0 0 2mm; }
                .certificate-sheet h3 { width:100%; font-size:20px; }
                #certificate-print p { margin:0; font-size:11px; line-height:1.2; }
                .certificate-sheet .signatures { width:100%; break-inside:avoid; margin:0; flex-wrap:nowrap; gap:3mm; }
                .certificate-sheet .signatures>div { flex:1; min-width:0; width:auto; font-size:9px; overflow-wrap:anywhere; }
                .certificate-sheet .signatures img { width:100%; height:12mm; }
                .certificate-sheet footer { width:100%; padding-top:2mm; font-size:9px; }
                .certificate-verification svg { width:20mm; height:20mm; }
            }
        `})]})}export{v as C};
