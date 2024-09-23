import{S as p}from"./q-21d7061a.js";import{e as L,P as e,q as m,E as v,K as i,b as y,w as _}from"./q-cea67d7a.js";import{useLoaderSuccess as g}from"./q-ec3dd6e8.js";import"./q-97996d90.js";const f=()=>{var t,s,l,n,a,c,u,d;const o=g(),r=`
  window.renderOptIn = function() {
    window.gapi.load('surveyoptin', function() {
      window.gapi.surveyoptin.render(
        {
          // REQUIRED
          "merchant_id": "5086882223",
          "order_id": "${(s=(t=o.value)==null?void 0:t.dataForSurvey)==null?void 0:s.order_id}",
          "email": "${(n=(l=o.value)==null?void 0:l.dataForSurvey)==null?void 0:n.email}",
          "delivery_country": "${(c=(a=o.value)==null?void 0:a.dataForSurvey)==null?void 0:c.country}",
          "estimated_delivery_date": "${(d=(u=o.value)==null?void 0:u.dataForSurvey)==null?void 0:d.delivery_date}",
        });
    });
  }`;return L(m(()=>Promise.resolve().then(()=>w),"s_WOWRdoy8QI0",[o])),e("div",null,{class:"flex flex-col justify-center items-center gap-10 mb-10"},[v(p,{pageType:"confirmation",[i]:{pageType:i}},3,"XE_0"),e("div",null,{class:"bg-[url('/Vector.svg')]"},e("svg",null,{fill:"none",height:"264",viewBox:"0 0 263 264",width:"263",xmlns:"http://www.w3.org/2000/svg"},[e("path",null,{d:"M131.5 0.75L160.875 23.25L197.125 18.25L210.875 52.625L245.25 66.375L240.25 102.625L262.75 132L240.25 161.375L245.25 197.625L210.875 211.375L197.125 245.75L160.875 240.75L131.5 263.25L102.125 240.75L65.875 245.75L52.125 211.375L17.75 197.625L22.75 161.375L0.25 132L22.75 102.625L17.75 66.375L52.125 52.625L65.875 18.25L102.125 23.25L131.5 0.75Z",fill:"#18181B"},null,3,null),e("path",null,{d:"M197.75 73.25L112.75 158.25L77.75 123.25L60.25 140.75L112.75 193.25L215.25 90.75L197.75 73.25Z",fill:"#FAFAFA"},null,3,null)],3,null),3,null),e("h1",null,{class:"text-3xl font-semibold text-center"},"Thank you for your order!",3,null),e("p",null,{class:"text-sm font-light text-center"},"Your order has been placed and will be processed shortly.",3,null),e("script",null,{async:!0,defer:!0,src:"https://apis.google.com/js/platform.js?onload=renderOptIn"},null,3,null),e("script",{dangerouslySetInnerHTML:r},null,null,3,null)],1,"XE_1")},h=()=>{var l,n;const[o]=y(),r=`
      gtag('event', 'conversion', {
          'send_to': 'AW-11167601664/ApSoCLPu2IwZEICokM0p',
          'transaction_id': '${(n=(l=o.value)==null?void 0:l.dataForSurvey)==null?void 0:n.order_id}',
    `,t=document.createElement("script");t.innerHTML=r,document.head.appendChild(t),localStorage.getItem("copon")==="true"&&localStorage.removeItem("copon")},w=Object.freeze(Object.defineProperty({__proto__:null,_hW:_,s_Lp0WM1Yk7GU:f,s_WOWRdoy8QI0:h},Symbol.toStringTag,{value:"Module"}));export{_ as _hW,f as s_Lp0WM1Yk7GU,h as s_WOWRdoy8QI0};
