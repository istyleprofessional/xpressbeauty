import{P as x}from"./q-60d05858.js";import{P as g}from"./q-1dc7e6f6.js";import{x as b,d as v,e as P,s as y,P as t,M as r,q as u,E as m,K as a,b as d,w as _}from"./q-cea67d7a.js";import"./q-97996d90.js";const k=e=>{var c,n,s,h;b();const l=v(0);return P(u(()=>Promise.resolve().then(()=>i),"s_QWg0vA0JDXY",[e,l])),y("DOMContentLoaded",u(()=>Promise.resolve().then(()=>i),"s_MBQDEi0Bde0",[e])),t("div",null,{class:"flex flex-col gap-7 w-full"},[t("div",null,{class:"h-24 w-[100%] lg:flex lg:flex-row items-center hidden md:hidden"},[t("div",null,{class:" flex-row gap-1 justify-center items-center hidden lg:flex"},[t("input",null,{checked:r(o=>o.inStock.value,[e]),class:"checkbox checkbox-success",id:"checkbox",name:"checkbox",onChange$:u(()=>Promise.resolve().then(()=>i),"s_PdiQR2GB338",[e]),type:"checkbox"},null,3,null),t("label",null,{class:"font-bold",for:"checkbox"},"In Stock",3,null)],3,null),t("select",{onChange$:e.handleSorting},{class:"select w-52 max-w-xs bg-transparent text-[#52525B] ml-auto select-bordered mr-8 hidden md:block"},[t("option",null,{disabled:!0,selected:!0},"Sort By",3,null),t("option",null,null,"ASC",3,null),t("option",null,null,"DEC",3,null)],2,null)],1,null),t("div",null,{class:"flex flex-row flex-wrap justify-center gap-4"},(n=(c=e.products.value)==null?void 0:c.result)==null?void 0:n.map((o,f)=>t("div",null,null,m(g,{get currencyObject(){return e.currencyObject},cardSize:"sm",i:f,product:o,[a]:{cardSize:a,currencyObject:r(p=>p.currencyObject,[e])}},3,"U7_0"),1,f)),1,null),((h=(s=e.products.value)==null?void 0:s.result)==null?void 0:h.length)===0?t("div",null,{class:"flex flex-col items-center justify-center"},[t("h1",null,{class:"text-2xl font-bold text-black"},"No Products Found",3,null),t("p",null,{class:"text-lg text-[#52525B]"},"Try adjusting your search or filter to find what you are looking for.",3,null)],3,"U7_1"):t("div",null,{class:"flex flex-col items-center justify-center p-2"},m(x,{get page(){return e.currentPage},get totalProductsNo(){return l.value},perPage:20,[a]:{page:r(o=>o.currentPage,[e]),perPage:a,totalProductsNo:r(o=>o.value,[l])}},3,"U7_2"),1,null)],1,"U7_3")},w=({track:e})=>{const[l,c]=d();e(()=>l.products.value.total),c.value=l.products.value.total},S=(e,l)=>{const[c]=d();if(l.checked){c.inStock.value=!0;const n=new URL(window.location.href);n.searchParams.set("inStock","true"),location.href=n.pathname+n.search}else{c.inStock.value=!1;const n=new URL(window.location.href);n.searchParams.set("inStock","false"),location.href=n.pathname+n.search}},j=()=>{const[e]=d(),l=document.createElement("script");l.type="application/ld+json";const c={"@context":"https://schema.org/","@type":"ItemList",itemListElement:e.products.value.result.map((n,s)=>({"@type":"ListItem",position:s+1,url:`https://xpressbeauty.ca/products/${n.perfix}`}))};l.text=JSON.stringify(c),document.head.appendChild(l)},i=Object.freeze(Object.defineProperty({__proto__:null,_hW:_,s_MBQDEi0Bde0:j,s_PdiQR2GB338:S,s_QWg0vA0JDXY:w,s_XshhUGUahCE:k},Symbol.toStringTag,{value:"Module"}));export{_ as _hW,j as s_MBQDEi0Bde0,S as s_PdiQR2GB338,w as s_QWg0vA0JDXY,k as s_XshhUGUahCE};