import{X as m,r as c,j as e}from"./app-DdphyB5N.js";import{C as p,c as u}from"./utils-LSITzVLx.js";import{c as i}from"./createLucideIcon-LRt0czJ1.js";/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],x=i("triangle-alert",h);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],k=i("x",f);function g(){const{success:l,error:o}=m().props.flash??{},[r,n]=c.useState(null),t=o||l,a=!!o,s=t?`${a?"e":"s"}:${t}`:null;return c.useEffect(()=>{if(!s||s===r)return;const d=setTimeout(()=>n(s),5e3);return()=>clearTimeout(d)},[s,r]),!t||s===r?null:e.jsx("div",{className:"pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4",children:e.jsxs("div",{className:u("pointer-events-auto flex max-w-md items-start gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm",a?"border-red-200 bg-red-50 text-red-700":"border-emerald-200 bg-emerald-50 text-emerald-700"),children:[a?e.jsx(x,{className:"h-4.5 w-4.5 shrink-0"}):e.jsx(p,{className:"h-4.5 w-4.5 shrink-0"}),e.jsx("p",{className:"font-medium leading-snug",children:t}),e.jsx("button",{type:"button",onClick:()=>n(s),className:"ml-1 shrink-0 opacity-60 hover:opacity-100",children:e.jsx(k,{className:"h-4 w-4"})})]})})}export{g as F,x as T,k as X};
