import{r as H,a as C,c as K,$ as z,l as Y,L as q,q as v,x as p,O as G,E as J,n as O,j as m,m as T,P as Z}from"./q-cea67d7a.js";const X='((i,a,r,s)=>{r=e=>{const t=document.querySelector("[q\\\\:base]");t&&a.active&&a.active.postMessage({type:"qprefetch",base:t.getAttribute("q:base"),...e})},document.addEventListener("qprefetch",e=>{const t=e.detail;a?r(t):i.push(t)}),navigator.serviceWorker.register("/service-worker.js").then(e=>{s=()=>{a=e,i.forEach(r),r({bundles:i})},e.installing?e.installing.addEventListener("statechange",t=>{t.target.state=="activated"&&s()}):e.active&&s()}).catch(e=>console.error(e))})([])',tt=m("qc-s"),At=m("qc-c"),qt=m("qc-ic"),et=m("qc-h"),nt=m("qc-l"),st=m("qc-n"),rt=m("qc-a"),Ot=m("qc-ir"),Dt=v(()=>import("./q-663033b0.js"),"s_DyVc0YBIqQU"),kt=()=>{},Pt=O(v(()=>import("./q-a61abca9.js"),"s_e0ssiDXoeAM")),N=new WeakMap,_=new Map,R=new Set,M="qaction",Tt="qfunc",S=t=>t.pathname+t.search+t.hash,w=(t,e)=>new URL(t,e.href),ot=(t,e)=>t.origin===e.origin,L=t=>t.endsWith("/")?t:t+"/",B=({pathname:t},{pathname:e})=>{const n=Math.abs(t.length-e.length);return n===0?t===e:n===1&&L(t)===L(e)},it=(t,e)=>t.search===e.search,D=(t,e)=>it(t,e)&&B(t,e),at=(t,e,n)=>{let s=e??"";return n&&(s+=(s?"&":"?")+M+"="+encodeURIComponent(n.id)),t+(t.endsWith("/")?"":"/")+"q-data.json"+s},Nt=(t,e)=>{const n=t.href;if(typeof n=="string"&&typeof t.target!="string"&&!t.reload)try{const s=w(n.trim(),e.url),r=w("",e.url);if(ot(s,r))return S(s)}catch(s){console.error(s)}else if(t.reload)return S(w("",e.url));return null},Rt=(t,e)=>{if(t){const n=w(t,e.url),s=w("",e.url);return!D(n,s)}return!1},Lt=(t,e)=>{if(t){const n=w(t,e.url),s=w("",e.url);return!B(n,s)}return!1},ct=t=>t&&typeof t.then=="function",jt=(t,e,n,s)=>{const r=lt(),i={head:r,withLocale:a=>T(s,a),resolveValue:a=>{const c=a.__id;if(a.__brand==="server_loader"&&!(c in t.loaders))throw new Error("You can not get the returned data of a loader that has not been executed for this request.");const l=t.loaders[c];if(ct(l))throw new Error("Loaders returning a promise can not be resolved for the head function.");return l},...e};for(let a=n.length-1;a>=0;a--){const c=n[a]&&n[a].head;c&&(typeof c=="function"?j(r,T(s,()=>c(i))):typeof c=="object"&&j(r,c))}return i.head},j=(t,e)=>{typeof e.title=="string"&&(t.title=e.title),E(t.meta,e.meta),E(t.links,e.links),E(t.styles,e.styles),E(t.scripts,e.scripts),Object.assign(t.frontmatter,e.frontmatter)},E=(t,e)=>{if(Array.isArray(e))for(const n of e){if(typeof n.key=="string"){const s=t.findIndex(r=>r.key===n.key);if(s>-1){t[s]=n;continue}}t.push(n)}},lt=()=>({title:"",meta:[],links:[],styles:[],scripts:[],frontmatter:{}});function ft(t,e){const n=W(t),s=x(t),r=W(e),o=x(e);return U(t,n,s,e,r,o)}function U(t,e,n,s,r,o){let i=null;for(;e<n;){const a=t.charCodeAt(e++),c=s.charCodeAt(r++);if(a===91){const l=V(t,e),f=e+(l?3:0),u=A(t,f,n,93),h=t.substring(f,u),d=A(t,u+1,n,47),g=t.substring(u+1,d);e=u+1;const y=r-1;if(l){const P=ht(h,g,s,y,o,t,e+g.length+1,n);if(P)return Object.assign(i||(i={}),P)}const b=A(s,y,o,47,g);if(b==-1)return null;const k=s.substring(y,b);if(!l&&!g&&!k)return null;r=b,(i||(i={}))[h]=decodeURIComponent(k)}else if(a!==c&&!(isNaN(c)&&ut(t,e)))return null}return I(t,e)&&I(s,r)?i||{}:null}function ut(t,e){return t.charCodeAt(e)===91&&V(t,e+1)}function x(t){const e=t.length;return e>1&&t.charCodeAt(e-1)===47?e-1:e}function I(t,e){const n=t.length;return e>=n||e==n-1&&t.charCodeAt(e)===47}function W(t){return t.charCodeAt(0)===47?1:0}function V(t,e){return t.charCodeAt(e)===46&&t.charCodeAt(e+1)===46&&t.charCodeAt(e+2)===46}function A(t,e,n,s,r=""){for(;e<n&&t.charCodeAt(e)!==s;)e++;const o=r.length;for(let i=0;i<o;i++)if(t.charCodeAt(e-o+i)!==r.charCodeAt(i))return-1;return e-o}let F;(function(t){t[t.EOL=0]="EOL",t[t.OPEN_BRACKET=91]="OPEN_BRACKET",t[t.CLOSE_BRACKET=93]="CLOSE_BRACKET",t[t.DOT=46]="DOT",t[t.SLASH=47]="SLASH"})(F||(F={}));function ht(t,e,n,s,r,o,i,a){n.charCodeAt(s)===47&&s++;let c=r;const l=e+"/";let f=5;for(;c>=s&&f--;){const u=U(o,i,a,n,c,r);if(u){let h=n.substring(s,Math.min(c,r));return h.endsWith(l)&&(h=h.substring(0,h.length-l.length)),u[t]=decodeURIComponent(h),u}c=dt(n,s,l,c,s-1)+l.length}return null}function dt(t,e,n,s,r){let o=t.lastIndexOf(n,s);return o==s-n.length&&(o=t.lastIndexOf(n,s-n.length-1)),o>e?o:r}const xt=async(t,e,n,s)=>{if(Array.isArray(t))for(const r of t){const o=r[0],i=ft(o,s);if(i){const a=r[1],c=r[3],l=new Array(a.length),f=[],u=gt(e,s);let h;return a.forEach((d,g)=>{Q(d,f,y=>l[g]=y,n)}),Q(u,f,d=>h=d==null?void 0:d.default,n),f.length>0&&await Promise.all(f),[o,i,l,h,c]}}return null},Q=(t,e,n,s)=>{if(typeof t=="function"){const r=N.get(t);if(r)n(r);else{const o=t();typeof o.then=="function"?e.push(o.then(i=>{s!==!1&&N.set(t,i),n(i)})):o&&n(o)}}},gt=(t,e)=>{if(t){e=e.endsWith("/")?e:e+"/";const n=t.find(s=>s[0]===e||e.startsWith(s[0]+(e.endsWith("/")?"":"/")));if(n)return n[1]}},It=(t,e,n,s,r=!1)=>{if(e!=="popstate"){const o=D(n,s),i=n.hash===s.hash;if(!o||!i){const a={_qCityScroll:mt()};r?t.history.replaceState(a,"",S(s)):t.history.pushState(a,"",S(s))}}},mt=()=>({x:0,y:0,w:0,h:0}),yt=t=>{t=t.endsWith("/")?t:t+"/",R.has(t)||(R.add(t),document.dispatchEvent(new CustomEvent("qprefetch",{detail:{links:[t]}})))},Wt=async(t,e,n)=>{const s=t.pathname,r=t.search,o=at(s,r,n==null?void 0:n.action);let i;n!=null&&n.action||(i=_.get(o)),(n==null?void 0:n.prefetchSymbols)!==!1&&yt(s);let a;if(!i){const c=wt(n==null?void 0:n.action);n!=null&&n.action&&(n.action.data=void 0),i=fetch(o,c).then(l=>{const f=new URL(l.url),u=f.pathname.endsWith("/q-data.json");if(f.origin!==location.origin||!u){location.href=f.href;return}if((l.headers.get("content-type")||"").includes("json"))return l.text().then(h=>{const d=H(h,e);if(!d){location.href=t.href;return}if(n!=null&&n.clearCache&&_.delete(o),d.redirect)location.href=d.redirect;else if(n!=null&&n.action){const{action:g}=n,y=d.loaders[g.id];a=()=>{g.resolve({status:l.status,result:y})}}return d});(n==null?void 0:n.isPrefetch)!==!0&&(location.href=t.href)}),n!=null&&n.action||_.set(o,i)}return i.then(c=>(c||_.delete(o),a&&a(),c))},wt=t=>{const e=t==null?void 0:t.data;if(e)return e instanceof FormData?{method:"POST",body:e}:{method:"POST",body:JSON.stringify(e),headers:{"Content-Type":"application/json, charset=UTF-8"}}},Ft=()=>C(et),vt=()=>C(nt),Qt=()=>C(st),Ct=()=>C(rt),Ht=()=>K(z("qwikcity")),Mt=(t,e,n,s)=>{t==="popstate"&&s?window.scrollTo(s.x,s.y):(t==="link"||t==="form")&&(_t(e,n)||window.scrollTo(0,0))},_t=(t,e)=>{const n=t.hash.slice(1),s=n&&document.getElementById(n);return s?(s.scrollIntoView(),!0):!!(!s&&t.hash&&D(t,e))},Bt=t=>({x:t.scrollLeft,y:t.scrollTop,w:Math.max(t.scrollWidth,t.clientWidth),h:Math.max(t.scrollHeight,t.clientHeight)}),Ut=()=>{const t=history.state;return t==null?void 0:t._qCityScroll},Vt=t=>{const e=history.state||{};e._qCityScroll=t,history.replaceState(e,"")},$t=O(v(()=>import("./q-a63bfbed.js"),"s_TxCFOy819ag"));function Kt(t){for(;t&&t.nodeType!==Node.ELEMENT_NODE;)t=t.parentElement;return t.closest("[q\\:container]")}const zt=t=>Z("script",{nonce:q(t,"nonce")},{dangerouslySetInnerHTML:X},null,3,"1Z_0"),Et=(t,...e)=>{const{id:n,validators:s}=$(e,t);function r(){const o=vt(),i=Ct(),a={actionPath:`?${M}=${n}`,isRunning:!1,status:void 0,value:void 0,formData:void 0},c=Y(()=>{const f=i.value;if(f&&(f==null?void 0:f.id)===n){const u=f.data;if(u instanceof FormData&&(a.formData=u),f.output){const{status:h,result:d}=f.output;a.status=h,a.value=d}}return a}),l=v(()=>import("./q-118bff72.js"),"s_A5bZC7WO00A",[i,n,o,c]);return a.submit=l,c}return r.__brand="server_action",r.__validators=s,r.__qrl=t,r.__id=n,Object.freeze(r),r},Yt=(t,...e)=>Et(t,...e),pt=(t,...e)=>{const{id:n,validators:s}=$(e,t);function r(){return C(tt,o=>{if(!(n in o))throw new Error(`routeLoader$ "${t.getSymbol()}" was invoked in a route where it was not declared.
    This is because the routeLoader$ was not exported in a 'layout.tsx' or 'index.tsx' file of the existing route.
    For more information check: https://qwik.builder.io/qwikcity/route-loader/

    If your are managing reusable logic or a library it is essential that this function is re-exported from within 'layout.tsx' or 'index.tsx file of the existing route otherwise it will not run or throw exception.
    For more information check: https://qwik.builder.io/docs/cookbook/re-exporting-loaders/`);return q(o,n)})}return r.__brand="server_loader",r.__qrl=t,r.__validators=s,r.__id=n,Object.freeze(r),r},Gt=t=>{},Jt=t=>{function e(){return v(()=>import("./q-f3586c9e.js"),"s_wOIPfiQ04l4",[t])}return e()},$=(t,e)=>{let n;const s=[];if(t.length===1){const r=t[0];r&&typeof r=="object"&&("validate"in r?s.push(r):(n=r.id,r.validation&&s.push(...r.validation)))}else t.length>1&&s.push(...t.filter(r=>!!r));return typeof n=="string"?n=`id_${n}`:n=e.getHash(),{validators:s.reverse(),id:n}},Zt=async function*(t,e,n){const s=t.getReader();try{let r="";const o=new TextDecoder;for(;!(n!=null&&n.aborted);){const i=await s.read();if(i.done)break;r+=o.decode(i.value,{stream:!0});const a=r.split(/\n/);r=a.pop();for(const c of a)yield await H(c,e)}}finally{s.releaseLock()}},Xt=({action:t,spaReset:e,reloadDocument:n,onSubmit$:s,...r},o)=>(p(),t?G("form",{...r,action:q(t,"actionPath"),"preventdefault:submit":!n,["data-spa-reset"]:e?"true":void 0,onSubmit$:[n?void 0:t.submit,s]},{method:"post"},0,o):J(St,{onSubmit$:s,reloadDocument:n,spaReset:e,...r},0,o)),St=O(v(()=>import("./q-19459e0d.js"),"s_Nk9PlpjQm9Y"));export{jt as A,_ as B,qt as C,et as D,Vt as E,Bt as F,Dt as G,It as H,Kt as I,Ht as J,Xt as K,Yt as L,Gt as M,$t as N,Pt as O,Tt as Q,nt as R,zt as S,vt as a,kt as b,Et as c,Zt as d,Qt as e,lt as f,At as g,st as h,tt as i,rt as j,Ot as k,Wt as l,Nt as m,Rt as n,Lt as o,yt as p,ot as q,pt as r,Jt as s,w as t,Ft as u,D as v,Mt as w,Ut as x,xt as y,B as z};