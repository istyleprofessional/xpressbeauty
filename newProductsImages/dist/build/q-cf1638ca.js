import{d as m,E as v,P as e,q as i,M as u,_ as w,b as r,w as _}from"./q-cea67d7a.js";const b=s=>{const n=m(!0),t=m("/ps.jpg"),p=m("/ps.jpg"),d=m("/ps.jpg"),c=m("/ps.jpg"),h=i(()=>Promise.resolve().then(()=>o),"s_jIY0iSowTo8",[n]),a=i(()=>Promise.resolve().then(()=>o),"s_nJ0ldPWNdUk",[s,t,p,d,c]);return v(w,{children:[e("div",null,{class:u(l=>`flex w-1/3 flex-row items-center justify-center gap-3 rounded-md bg-slate-50 p-4 shadow-md  ${l.value?"hidden":"visible"} `,[n])},[e("div",null,null,[e("img",null,{alt:"",class:"h-24 w-24 cursor-pointer rounded-sm",height:24,onClick$:i(()=>import("./q-37349e2e.js"),"s_U4BaK54HQ0Y"),src:u(l=>l.value,[t]),width:24},null,3,null),e("input",null,{class:"file-input file-input-bordered file-input-sm hidden  w-full max-w-xs",id:"s1",onChange$:i(()=>Promise.resolve().then(()=>o),"s_tv9nXEpt0ew",[a]),type:"file"},null,3,null),e("input",null,{name:"s1Img",type:"hidden",value:u(l=>l.value,[t])},null,3,null)],3,null),e("div",null,null,[e("img",null,{alt:"",class:"h-24 w-24 cursor-pointer rounded-sm",height:24,onClick$:i(()=>import("./q-d60ecd21.js"),"s_ZRFfjziSuzE"),src:u(l=>l.value,[p]),width:24},null,3,null),e("input",null,{class:"file-input file-input-bordered file-input-sm hidden w-full max-w-xs",id:"s2",onChange$:i(()=>Promise.resolve().then(()=>o),"s_gpp2OuUlavQ",[a]),type:"file"},null,3,null),e("input",null,{name:"s2Img",type:"hidden",value:u(l=>l.value,[p])},null,3,null)],3,null),e("div",null,null,[e("img",null,{alt:"",class:"h-24 w-24 cursor-pointer rounded-sm",height:24,onClick$:i(()=>import("./q-4e156a22.js"),"s_TP40u8rDJrs"),src:u(l=>l.value,[d]),width:24},null,3,null),e("input",null,{class:"file-input file-input-bordered file-input-sm hidden w-full max-w-xs",id:"s3",onChange$:i(()=>Promise.resolve().then(()=>o),"s_K1awZUC8cZc",[a]),type:"file"},null,3,null),e("input",null,{name:"s3Img",type:"hidden",value:u(l=>l.value,[d])},null,3,null)],3,null),e("div",null,null,[e("img",null,{alt:"",class:"h-24 w-24 cursor-pointer rounded-sm",height:24,onClick$:i(()=>import("./q-6206471b.js"),"s_Jgj6zRZkwXg"),src:u(l=>l.value,[c]),width:24},null,3,null),e("input",null,{class:"file-input file-input-bordered file-input-sm hidden w-full max-w-xs",id:"s4",onChange$:i(()=>Promise.resolve().then(()=>o),"s_4ATBLEOj1Ks",[a]),type:"file"},null,3,null),e("input",null,{name:"s4Img",type:"hidden",value:u(l=>l.value,[c])},null,3,null)],3,null)],3,null),e("button",null,{class:"btn btn-square btn-primary w-fit p-2",onClick$:h,type:"button"},"Add More Images",3,null)]},3,"t9_0")},y=async(s,n)=>{var f;const[t,p,d,c,h]=r(),a=s.target.files[0];if(!a)return;const l=new FormData;if(l.append("image",a),l.append("name",`${(f=t.product_name)==null?void 0:f.replace(/ /g,"-").replace(/[^a-zA-Z0-9\s]/g,"")}-${n}/${a.name.split(".")[0].replace(/[^a-zA-Z0-9\s]/g,"")}.webp`),(await(await fetch("/api/admin/product/upload",{method:"POST",body:l})).json()).message!==200)return;const g=`https://xpressbeauty.s3.ca-central-1.amazonaws.com/products-images-2/${t.product_name.replace(/ /g,"-").replace(/[^a-zA-Z0-9\s]/g,"")}-${n}/${a.name.split(".")[0].replace(/[^a-zA-Z0-9\s]/g,"")}.webp`;n=="s1"&&(p.value=g),n=="s2"&&(d.value=g),n=="s3"&&(c.value=g),n=="s4"&&(h.value=g)},$=()=>{const[s]=r();s.value=!s.value},C=s=>{const[n]=r();n(s,"s3")},j=s=>{const[n]=r();n(s,"s4")},S=s=>{const[n]=r();n(s,"s1")},x=s=>{const[n]=r();n(s,"s2")},o=Object.freeze(Object.defineProperty({__proto__:null,_hW:_,s_4ATBLEOj1Ks:j,s_Ayyta9kK7kg:b,s_K1awZUC8cZc:C,s_gpp2OuUlavQ:x,s_jIY0iSowTo8:$,s_nJ0ldPWNdUk:y,s_tv9nXEpt0ew:S},Symbol.toStringTag,{value:"Module"}));export{_ as _hW,j as s_4ATBLEOj1Ks,b as s_Ayyta9kK7kg,C as s_K1awZUC8cZc,x as s_gpp2OuUlavQ,$ as s_jIY0iSowTo8,y as s_nJ0ldPWNdUk,S as s_tv9nXEpt0ew};