import{k as b,b as d,d as o,e as _,E as f,q as k,P as g,_ as T,w as P}from"./q-cea67d7a.js";import{s as y}from"./q-97996d90.js";const w=y(b("s_udUd00iVwKk")),E=y(b("s_M5On8Mw0lks")),O=async({track:s})=>{var c,l,r,n,u,i,v,h;const[t,e,a]=d();s(()=>{var p;return(p=e.cart)==null?void 0:p.totalPrice}),s(()=>e.currencyObject),e.subTotal.value=(c=e.cart)==null?void 0:c.totalPrice,localStorage.getItem("copon")==="true"&&(e.subTotal.value=e.subTotal.value-e.subTotal.value*.1),t.value=(i=(u=(n=(r=(l=e.user)==null?void 0:l.generalInfo)==null?void 0:r.address)==null?void 0:n.country)==null?void 0:u.toLowerCase())!=null&&i.includes("united")?0:(((v=e.cart)==null?void 0:v.totalPrice)??0)*e.taxRate,await E((h=e.cart)==null?void 0:h.products)||e.subTotal.value>200?e.shipping.value=0:e.shipping.value=15,e.total.value=e.subTotal.value+t.value+e.shipping.value,e.currencyObject==="1"?a.value="USD":a.value="CAD"},C=async()=>{const[s]=d(),t=await w();s.value=t},D=s=>{const t=o(0),e=o("CAD"),a=o(!0);return _(k(()=>Promise.resolve().then(()=>m),"s_MEolats3AWc",[t,s,e])),_(k(()=>Promise.resolve().then(()=>m),"s_E0WRTk8h04k",[a])),f(T,{children:g("div",null,{id:"checkout"},null,3,null)},3,"iM_0")},m=Object.freeze(Object.defineProperty({__proto__:null,_hW:P,s_E0WRTk8h04k:C,s_MEolats3AWc:O,s_m3EY6OjHZfA:D},Symbol.toStringTag,{value:"Module"}));export{P as _hW,C as s_E0WRTk8h04k,O as s_MEolats3AWc,D as s_m3EY6OjHZfA};