import{b as r,x,E as a,P as n,q as s,M as i,_}from"./q-cea67d7a.js";import{i as m,j as w,k,l as C,m as v}from"./q-3239778f.js";const g=()=>{const[e]=r();return e.handleHideClick(e.i)},b=e=>{const[t]=r();return t.handleOnChange(e,t.i,"regular_price")},E=(e,t)=>{const[l]=r();return l.handleRowClick(l.i,t)},P=e=>{var d;x();const t=(d=e.product.product_name)==null?void 0:d.replace(/[^\w\s]|_/g,"").replace(/\s+/g,""),l=e.data_widths?e.data_widths[e.data_widths.length-1]:300,u=`/products-images-2/${t}/primary-image-${l}w.webp`;return a(_,{children:[n("th",null,{class:"text-sm overflow-hidden w-20 bg-red-200 text-black"},n("div",null,{class:"flex flex-col gap-3 justify-center items-center"},[e.isEdit===!0&&e.index===e.i?n("button",null,{"aria-label":"Done edit product",onClick$:s(()=>Promise.resolve().then(()=>c),"s_TxinPdWMsrs",[e])},a(m,null,3,"jH_0"),1,"jH_1"):n("button",null,{"aria-label":"edit product",onClick$:s(()=>Promise.resolve().then(()=>c),"s_zXpHAdaVF0E",[e])},a(w,null,3,"jH_2"),1,null),n("button",null,{"aria-label":"Delete product",onClick$:s(()=>Promise.resolve().then(()=>c),"s_dybDAr09Hzs",[e])},a(k,null,3,"jH_3"),1,null),n("button",null,{"aria-label":"Hide product",onClick$:s(()=>Promise.resolve().then(()=>c),"s_EEaBkvxzYws",[e])},e.product.isHidden?a(C,null,3,"jH_4"):a(v,null,3,"jH_5"),1,null)],1,null),1,null),n("td",null,{class:"whitespace-normal text-black font-bold text-lg w-56 text-left",onClick$:s(()=>Promise.resolve().then(()=>c),"s_tog0AhwEdp8",[e])},i(o=>o.product.product_name??"",[e]),3,null),n("td",null,{class:"text-sm text-center w-56 text-black",onClick$:s(()=>Promise.resolve().then(()=>c),"s_3oESge5b1rE",[e])},e.isEdit===!0&&e.index===e.i?n("input",null,{class:"input input-bordered w-full max-w-lg text-xs",onChange$:s(()=>Promise.resolve().then(()=>c),"s_nKmT8TXxFxQ",[e]),type:"text",value:i(o=>o.product.price??"",[e])},null,3,"jH_6"):e.product.price??"",1,null),n("td",null,{class:"text-sm text-center overflow-hidden w-56 text-black",onClick$:s(()=>Promise.resolve().then(()=>c),"s_wwY07gCjKu0",[e])},e.isEdit===!0&&e.index===e.i?n("textarea",null,{class:"textarea textarea-xs textarea-bordered w-full",onChange$:s(()=>Promise.resolve().then(()=>c),"s_HCK4OV2sWPs",[e]),placeholder:i(o=>{var h;return((h=o.product)==null?void 0:h.categories[0].toString())??""},[e]),value:i(o=>o.product.categories??"",[e])},null,3,"jH_7"):e.product.categories??"",1,null),n("td",null,{class:"text-sm whitespace-normal text-center text-black overflow-hidden w-56",onClick$:s(()=>Promise.resolve().then(()=>c),"s_djmq6SYlgOg",[e])},e.isEdit===!0&&e.index===e.i?n("textarea",null,{class:"textarea textarea-xs textarea-bordered w-full",onChange$:s(()=>Promise.resolve().then(()=>c),"s_LEM3oJoiOIU",[e]),placeholder:i(o=>o.product.description??"",[e]),value:i(o=>o.product.description??"",[e])},null,3,"jH_8"):e.product.description??"",1,null),n("td",null,{class:"text-sm whitespace-normal text-center text-black overflow-hidden w-56",onClick$:s(()=>Promise.resolve().then(()=>c),"s_1ei1oc90rWU",[e])},e.isEdit===!0&&e.index===e.i?n("textarea",null,{class:"textarea textarea-xs textarea-bordered w-full",onChange$:s(()=>Promise.resolve().then(()=>c),"s_7pyl6ek8NpQ",[e]),placeholder:i(o=>o.product.item_no?o.product.item_no:"Item number",[e]),value:i(o=>o.product.item_no??"",[e])},null,3,"jH_9"):e.product.item_no??"",1,null),n("td",null,{class:"text-sm text-center text-black overflow-hidden w-56",onClick$:s(()=>Promise.resolve().then(()=>c),"s_qZkjNBL5c08",[e])},e.isEdit===!0&&e.index===e.i?n("textarea",null,{class:"textarea textarea-xs textarea-bordered w-full",onChange$:s(()=>Promise.resolve().then(()=>c),"s_7ZDIoTZRcH0",[e]),placeholder:i(o=>o.product.sku?o.product.sku:"SKU",[e]),value:i(o=>o.product.sku,[e])},null,3,"jH_10"):e.product.sku,1,null),n("td",null,{class:"text-sm whitespace-normal text-black text-center overflow-hidden w-56",onClick$:s(()=>Promise.resolve().then(()=>c),"s_Mn5dYS0yToI",[e])},i(o=>o.product.quantity_on_hand,[e]),3,null),n("td",null,{class:"text-sm text-center text-black overflow-hidden w-56",onClick$:s(()=>Promise.resolve().then(()=>c),"s_1ON1SlqGrhw",[e])},i(o=>o.product.bar_code_value,[e]),3,null),n("td",null,{class:"text-sm text-center text-black overflow-hidden w-56",onClick$:s(()=>Promise.resolve().then(()=>c),"s_GoryVrPG7mI",[e])},i(o=>o.product.isHidden?"hide":"active",[e]),3,null),n("td",null,{class:"text-sm text-center text-black overflow-hidden w-56",onClick$:s(()=>Promise.resolve().then(()=>c),"s_npKmwjQ2BKU",[e])},e.isEdit===!0&&e.index===e.i?n("select",null,{class:"select",onChange$:s(()=>Promise.resolve().then(()=>c),"s_5vP7hEkw654",[e])},[n("option",null,{selected:!0},"NORMAL",3,null),n("option",null,null,"NEW ARRIVAL",3,null),n("option",null,null,"SALE",3,null),n("option",null,null,"LIMITED EDITION",3,null)],3,"jH_11"):e.product.status,1,null),n("td",null,{class:"text-center text-black overflow-hidden w-56"},n("a",{href:u},{target:"_blank"},n("img",{src:u},{class:"w-full h-full object-contain"},null,3,null),1,null),1,null)]},1,"jH_12")},f=()=>{const[e]=r();return e.handleDeleteClick(e.i)},j=(e,t)=>{const[l]=r();return l.handleRowClick(l.i,t)},H=(e,t)=>{const[l]=r();return l.handleRowClick(l.i,t)},$=(e,t)=>{const[l]=r();return l.handleRowClick(l.i,t)},I=e=>{const[t]=r();return t.handleOnChange(e,t.i,"sku")},O=(e,t)=>{const[l]=r();return l.handleRowClick(l.i,t)},y=e=>{const[t]=r();return t.handleOnChange(e,t.i,"description")},R=e=>{const[t]=r();return t.handleOnChange(e,t.i,"item_no")},S=e=>{const[t]=r();return t.handleOnChange(e,t.i,"status")},T=(e,t)=>{const[l]=r();return l.handleRowClick(l.i,t)},D=(e,t)=>{const[l]=r();return l.handleRowClick(l.i,t)},M=(e,t)=>{const[l]=r();return l.handleRowClick(l.i,t)},K=()=>{const[e]=r();return e.handleDoneClick(e.i)},A=(e,t)=>{const[l]=r();return l.handleRowClick(l.i,t)},N=(e,t)=>{const[l]=r();return l.handleRowClick(l.i,t)},q=()=>{const[e]=r();return e.handleEditClick(e.i)},B=e=>{const[t]=r();return t.handleOnChange(e,t.i,"category")},c=Object.freeze(Object.defineProperty({__proto__:null,s_1ON1SlqGrhw:E,s_1ei1oc90rWU:$,s_3oESge5b1rE:M,s_5vP7hEkw654:S,s_7ZDIoTZRcH0:I,s_7pyl6ek8NpQ:R,s_EEaBkvxzYws:g,s_GoryVrPG7mI:H,s_HCK4OV2sWPs:B,s_LEM3oJoiOIU:y,s_Mn5dYS0yToI:O,s_TxinPdWMsrs:K,s_djmq6SYlgOg:A,s_dybDAr09Hzs:f,s_j802Qn4iMB4:P,s_nKmT8TXxFxQ:b,s_npKmwjQ2BKU:D,s_qZkjNBL5c08:j,s_tog0AhwEdp8:T,s_wwY07gCjKu0:N,s_zXpHAdaVF0E:q},Symbol.toStringTag,{value:"Module"}));export{E as s_1ON1SlqGrhw,$ as s_1ei1oc90rWU,M as s_3oESge5b1rE,S as s_5vP7hEkw654,I as s_7ZDIoTZRcH0,R as s_7pyl6ek8NpQ,g as s_EEaBkvxzYws,H as s_GoryVrPG7mI,B as s_HCK4OV2sWPs,y as s_LEM3oJoiOIU,O as s_Mn5dYS0yToI,K as s_TxinPdWMsrs,A as s_djmq6SYlgOg,f as s_dybDAr09Hzs,P as s_j802Qn4iMB4,b as s_nKmT8TXxFxQ,D as s_npKmwjQ2BKU,j as s_qZkjNBL5c08,T as s_tog0AhwEdp8,N as s_wwY07gCjKu0,q as s_zXpHAdaVF0E};