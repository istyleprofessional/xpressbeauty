import{Q as l,d as m}from"./q-97996d90.js";import{b as d,g as u,i as w,r as y}from"./q-cea67d7a.js";const b=async function(...o){const[i]=d(),n=o.length>0&&o[0]instanceof AbortSignal?o.shift():void 0;{const s=u(),f=o.map(t=>t instanceof SubmitEvent&&t.target instanceof HTMLFormElement?new FormData(t.target):t instanceof Event||t instanceof Node?null:t),a=i.getHash(),e=await fetch(`?${l}=${a}`,{method:"POST",headers:{"Content-Type":"application/qwik-json","X-QRL":a},signal:n,body:await w([i,...f])}),c=e.headers.get("Content-Type");if(e.ok&&c==="text/qwik-json-stream"&&e.body)return async function*(){try{for await(const t of m(e.body,s??document.documentElement,n))yield t}finally{n!=null&&n.aborted||await e.body.cancel()}}();if(c==="application/qwik-json"){const t=await e.text(),r=await y(t,s??document.documentElement);if(e.status===500)throw r;return r}}};export{b as s_wOIPfiQ04l4};