import{b as v,d as x,P as l,E as S,q as m,M as d,w as $}from"./q-cea67d7a.js";import{getUserServer as A,useUserTableData as I,getAllUsersServer as C,accessServerAccount as O}from"./q-d22a3b63.js";import{f as E}from"./q-3239778f.js";import{a as L}from"./q-97996d90.js";const k=async o=>{const[r,a]=v(),b=o.target.value,i=await A(b),h=JSON.parse(i);a.value={result:h.result},r.value=h.total;const e=new URL(window.location.href);e.searchParams.set("page","1"),e.searchParams.set("search",b),history.pushState({},"",e.toString())},M=()=>{const[o]=v(),r=new URL(window.location.href);r.searchParams.set("page",(parseInt(o)-1).toString()),location.href=r.toString()},j=()=>{const[o,r,a]=v();o.value=!0,r.value=a},H=()=>{const[o,r]=v();o.value=!1,r.value={}},R=()=>{var g,N,U,y,_,D;const o=L(),r=I(),a=x(JSON.parse(((g=r.value)==null?void 0:g.res)??"[]")),b=x(a.value.count),i=o.url.searchParams.get("page")??"1",h=b.value??0,e=Math.ceil(h/20),w=o.url.searchParams.get("search")??"",p=x(!1),c=x({});return l("div",null,{class:"flex flex-col w-full h-full bg-[#F9FAFB]"},[l("div",null,{class:"flex flex-row gap-5 items-center"},[l("h1",null,{class:"text-2xl font-bold p-2"},"Users",3,null),l("input",{value:w},{class:"input input-bordered w-[20rem] m-2",onInput$:m(()=>Promise.resolve().then(()=>f),"s_0EmMJ93nBjA",[b,a]),placeholder:"Search For Users",type:"text"},null,3,null),l("button",null,{class:"btn btn-primary",onClick$:m(()=>Promise.resolve().then(()=>f),"s_Ba4duMrMdcQ")},"Download Users",3,null)],1,null),l("div",null,{class:"overflow-x-auto h-[80vh] bg-[#FFF]"},l("table",null,{class:"table table-pin-rows table-sm h-full"},[l("thead",null,null,[l("tr",null,null,[" ",l("th",null,null,l("label",null,null,l("input",null,{class:"checkbox",type:"checkbox"},null,3,null),3,null),3,null),l("th",null,{align:"right",colSpan:7},l("button",null,{class:"flex flex-row gap-2 items-center btn btn-ghost"},S(E,null,3,"lH_0"),1,null),1,null)],1,null),l("tr",null,{class:"bg-[#F1F5F9]"},[l("th",null,null,null,3,null),l("th",null,null,"Name",3,null),l("th",null,null,"Email",3,null),l("th",null,null,"Phone",3,null),l("th",null,null,"Create Date",3,null),l("th",null,null,"Email Verified",3,null),l("th",null,null,"Phone Verified",3,null),l("th",null,null,"Action",3,null)],3,null)],1,null),l("tbody",null,null,[((N=a==null?void 0:a.value.result)==null?void 0:N.length)>0&&((y=(U=a==null?void 0:a.value)==null?void 0:U.result)==null?void 0:y.map((n,t)=>{const s=new Date(n.createdAt);return l("tr",null,null,[l("th",null,null,l("label",null,null,l("input",null,{class:"checkbox",type:"checkbox"},null,3,null),3,null),3,null),l("td",null,null,[n==null?void 0:n.firstName," ",n==null?void 0:n.lastName],1,null),l("td",null,null,n==null?void 0:n.email,1,null),l("td",null,null,n==null?void 0:n.phoneNumber,1,null),l("td",null,null,s.toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}),1,null),l("td",null,null,n!=null&&n.isEmailVerified?"Yes":"No",1,null),l("td",null,null,n!=null&&n.isPhoneVerified?"Yes":"No",1,null),l("td",null,null,l("button",{onClick$:m(()=>Promise.resolve().then(()=>f),"s_Uz2Jx8lta4c",[p,c,n])},{class:"btn btn-primary"},"Veiw Details",2,null),1,null),l("td",null,null,l("button",{onClick$:m(()=>Promise.resolve().then(()=>f),"s_vne72Ht9r0Q",[n])},{class:"btn btn-primary"},"Access User Account",2,null),1,null)],1,t)})),((D=(_=a==null?void 0:a.value)==null?void 0:_.result)==null?void 0:D.length)===0&&l("tr",null,null,l("td",null,{class:"text-center",colSpan:8},"No users found",3,null),3,"lH_1")],1,null)],1,null),1,null),l("div",null,{class:"bg-[#fff]"},l("div",null,{class:"flex flex-row justify-between gap-2 p-2"},[l("button",{class:`btn btn-ghost btn-sm ${i==="1"?"text-[#D1D5DB]":"text-[#7C3AED]"} text-xs`,disabled:i==="1",onClick$:m(()=>Promise.resolve().then(()=>f),"s_IGX2VZJiuUs",[i])},null,"Previous",2,null),l("p",null,{class:"text-xs"},[i," of ",e],1,null),l("button",{class:`btn btn-ghost btn-sm text-xs ${i===e.toString()?"text-[#D1D5DB]":"text-[#7C3AED]"}`,disabled:i===e.toString(),onClick$:m(()=>Promise.resolve().then(()=>f),"s_QwLbZAHcbcg",[i])},null,"Next",2,null)],1,null),1,null),p.value&&l("div",null,{class:"fixed inset-0 z-[100] bg-[#00000080] flex justify-center items-center"},l("div",null,{class:"bg-[#fff] w-[80%] h-[80%] rounded-md"},[l("div",null,{class:"flex flex-row justify-between items-center p-2"},[l("h1",null,{class:"text-xl font-bold"},"User Details",3,null),l("button",null,{class:"btn btn-ghost btn-xs",onClick$:m(()=>Promise.resolve().then(()=>f),"s_M4PnI1nRH6U",[p,c])},"Close",3,null)],3,null),l("div",null,{class:"overflow-x-auto h-[80%] "},l("table",null,{class:"table table-pin-rows table-sm h-full"},l("thead",null,{class:""},[l("tr",null,{class:"bg-[#F1F5F9]"},[l("th",null,null,"First Name",3,null),l("td",null,null,d(n=>{var t;return(t=n.value)==null?void 0:t.firstName},[c]),3,null)],3,null),l("tr",null,{class:"bg-[#F1F5F9]"},[l("th",null,null,"Last Name",3,null),l("td",null,null,d(n=>{var t;return(t=n.value)==null?void 0:t.lastName},[c]),3,null)],3,null),l("tr",null,{class:"bg-[#F1F5F9]"},[l("th",null,null,"Email :",3,null),l("td",null,null,d(n=>{var t;return(t=n.value)==null?void 0:t.email},[c]),3,null)],3,null),l("tr",null,{class:"bg-[#F1F5F9]"},[l("th",null,null,"Phone Number :",3,null),l("td",null,null,d(n=>{var t;return(t=n.value)==null?void 0:t.phoneNumber},[c]),3,null)],3,null),l("tr",null,{class:"bg-[#F1F5F9]"},[l("th",null,null,"Address :",3,null),l("td",null,null,[" ",l("span",null,null,d(n=>{var t,s,u;return(u=(s=(t=n.value)==null?void 0:t.generalInfo)==null?void 0:s.address)==null?void 0:u.addressLine1},[c]),3,null),", ",l("span",null,null,d(n=>{var t,s,u;return(u=(s=(t=n.value)==null?void 0:t.generalInfo)==null?void 0:s.address)==null?void 0:u.city},[c]),3,null),", ",l("span",null,null,d(n=>{var t,s,u;return(u=(s=(t=n.value)==null?void 0:t.generalInfo)==null?void 0:s.address)==null?void 0:u.state},[c]),3,null),", ",l("span",null,null,d(n=>{var t,s,u;return(u=(s=(t=n.value)==null?void 0:t.generalInfo)==null?void 0:s.address)==null?void 0:u.postalCode},[c]),3,null),", ",l("span",null,null,d(n=>{var t,s,u;return(u=(s=(t=n.value)==null?void 0:t.generalInfo)==null?void 0:s.address)==null?void 0:u.country},[c]),3,null)],3,null)],3,null),l("tr",null,{class:"bg-[#F1F5F9]"},[l("th",null,null,"Company Name :",3,null),l("td",null,null,d(n=>{var t,s,u;return(u=(s=(t=n.value)==null?void 0:t.generalInfo)==null?void 0:s.company)==null?void 0:u.companyName},[c]),3,null)],3,null)],3,null),3,null),3,null)],3,null),3,"lH_2")],1,"lH_3")},J=async()=>{const o=await C(),r=JSON.parse(o);console.log(r);let a="Email,First Name,Last Name,Country,Zip,Email,Zip,Phone,Phone";r.forEach(e=>{var w,p,c,F,P,g;a+=`
${e.email},${e.firstName},${e.lastName},${((p=(w=e.generalInfo)==null?void 0:w.address)==null?void 0:p.country)??""},${((F=(c=e.generalInfo)==null?void 0:c.address)==null?void 0:F.postalCode)??""},${e.email},${((g=(P=e.generalInfo)==null?void 0:P.address)==null?void 0:g.postalCode)??""},${(e==null?void 0:e.phoneNumber)??""},${(e==null?void 0:e.phoneNumber)??""}`});const b=new Blob([a],{type:"text/csv"}),i=window.URL.createObjectURL(b),h=document.createElement("a");h.href=i,h.download="users.csv",h.click(),window.URL.revokeObjectURL(i)},B=()=>{const[o]=v(),r=new URL(window.location.href);r.searchParams.set("page",(parseInt(o)+1).toString()),location.href=r.toString()},V=async()=>{const[o]=v();await O(o.email)},f=Object.freeze(Object.defineProperty({__proto__:null,_hW:$,s_0EmMJ93nBjA:k,s_Ba4duMrMdcQ:J,s_IGX2VZJiuUs:M,s_M4PnI1nRH6U:H,s_QwLbZAHcbcg:B,s_Uz2Jx8lta4c:j,s_nGqftbAX9KU:R,s_vne72Ht9r0Q:V},Symbol.toStringTag,{value:"Module"}));export{$ as _hW,k as s_0EmMJ93nBjA,J as s_Ba4duMrMdcQ,M as s_IGX2VZJiuUs,H as s_M4PnI1nRH6U,B as s_QwLbZAHcbcg,j as s_Uz2Jx8lta4c,R as s_nGqftbAX9KU,V as s_vne72Ht9r0Q};