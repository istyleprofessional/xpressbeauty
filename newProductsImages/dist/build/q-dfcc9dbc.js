import{b as i,d as u,T as p,E as g,P as s,q as o,_ as d,M as m,w as _}from"./q-cea67d7a.js";import{d as P,e as f}from"./q-3239778f.js";const w=()=>{const[e]=i(),t=new URL(window.location.href);t.searchParams.set("page",e.value.toString()),location.href=t.toString()},k=()=>{const[e]=i(),t=new URL(window.location.href);t.searchParams.set("page",e.toString()),location.href=t.toString()},x=()=>{const[e]=i(),t=new URL(window.location.href);t.searchParams.set("page",(parseInt(e.page)-1).toString()),location.href=t.toString()},I=e=>{const t=u(0),a=u([]),l=u(0);return p(o(()=>Promise.resolve().then(()=>r),"s_419GG9TBbPw",[t,e])),p(o(()=>Promise.resolve().then(()=>r),"s_60ZRpi5SGVM",[t,e,a,l])),g(d,{children:s("div",null,{class:"flex flex-row gap-2"},[s("button",{class:`btn btn-sm md:btn-md w-fit inline-flex items-center text-xs md:text-sm font-medium text-gray-500
          bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700
          ${parseInt(e.page??"1")===1?"pointer-events-none":""}`},{"aria-label":"Pervious Page",onClick$:o(()=>Promise.resolve().then(()=>r),"s_WCT10rkKmTk",[e]),role:"button"},[g(P,null,3,"lK_0"),s("span",null,{class:"hidden md:block"},"Previous",3,null)],1,null),e.page>2&&g(d,{children:[s("button",null,{"aria-label":"page 1",class:m(n=>`btn btn-sm md:btn-md ${parseInt(n.page??"1")===1?"btn-active":""} `,[e]),onClick$:o(()=>import("./q-2fec7288.js"),"s_uqlh93DWfYo")},"1",3,null),parseInt(e.page??"1")>3&&s("p",null,{class:"btn-disabled text-black btn btn-sm md:btn-md"},"...",3,"lK_1")]},1,"lK_2"),a.value.map((n,c)=>s("button",{"aria-label":`page ${n}`,class:`btn btn-sm md:btn-md ${parseInt(e.page??"1")===n?"btn-active":""} `,onClick$:o(()=>Promise.resolve().then(()=>r),"s_IHBI1nIKFSs",[n])},null,n,0,c)),e.page<=l.value-2&&g(d,{children:[e.page<l.value-2&&s("p",null,{class:"btn btn-disabled text-black btn-sm md:btn-md"},"...",3,"lK_3"),s("button",null,{class:m((n,c)=>`btn btn-sm md:btn-md ${parseInt(n.page??"1")===c.value?"btn-active":""} `,[e,l]),onClick$:o(()=>Promise.resolve().then(()=>r),"s_0Xk4f0ldXxk",[l])},m(n=>n.value,[l]),3,null)]},1,"lK_4"),s("button",{class:`btn btn-sm md:btn-md w-fit inline-flex items-center px-4 py-2 text-xs md:text-sm font-medium text-gray-500
           bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700
          ${parseInt(e.page??"1")===l.value?"pointer-events-none":""}`},{"aria-label":"Next Page",onClick$:o(()=>Promise.resolve().then(()=>r),"s_wkNGkq5V8bc",[e])},[s("span",null,{class:"hidden md:block"},"Next",3,null),g(f,null,3,"lK_5")],1,null)],1,null)},1,"lK_6")},S=({track:e})=>{const[t,a,l,n]=i();e(()=>{a.page,t.value}),l.value=[];const c=t.value/(a.perPage??12);n.value=Math.ceil(c);const h=(parseInt(a.page)??1)-1,v=(parseInt(a.page)??1)+1;for(let b=h;b<=v;b++)b>0&&b<=n.value&&l.value.push(b)},y=()=>{const[e]=i(),t=new URL(window.location.href);t.searchParams.set("page",(parseInt(e.page)+1).toString()),location.href=t.toString()},K=({track:e})=>{const[t,a]=i();e(()=>{a.totalProductsNo}),t.value=a.totalProductsNo},r=Object.freeze(Object.defineProperty({__proto__:null,_hW:_,s_0Xk4f0ldXxk:w,s_419GG9TBbPw:K,s_60ZRpi5SGVM:S,s_IHBI1nIKFSs:k,s_WCT10rkKmTk:x,s_pYra8nIRKkQ:I,s_wkNGkq5V8bc:y},Symbol.toStringTag,{value:"Module"}));export{_ as _hW,w as s_0Xk4f0ldXxk,K as s_419GG9TBbPw,S as s_60ZRpi5SGVM,k as s_IHBI1nIKFSs,x as s_WCT10rkKmTk,I as s_pYra8nIRKkQ,y as s_wkNGkq5V8bc};