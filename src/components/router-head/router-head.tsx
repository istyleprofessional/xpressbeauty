import { component$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  // const url = loc.url.href.split(".ca")[1];

  const googletagmanager = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TNWNEYMDFJ');
  gtag('config', 'AW-11356703111');
  gtag('config', 'AW-11167601664');
  `;

  const metaScript = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '628174676061797');
fbq('track', 'PageView');
`;
  const hotJar = `
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:3826566,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
`;

  const liveChat = `
  (function(){var pp=document.createElement('script'), ppr=document.getElementsByTagName('script')[0]; stid='YXJCd2ltTEtMWjh1ZWJJakJMVGVwZz09';pp.type='text/javascript'; pp.async=true; pp.src=('https:' == document.location.protocol ? 'https://' : 'http://') + 's01.live2support.com/dashboardv2/chatwindow/'; ppr.parentNode.insertBefore(pp, ppr);})();
`;

  const url = `https://${loc.url.host}${loc.url.pathname}`;
  return (
    <>
      <title>{head.title}</title>
      {import.meta.env.VITE_isLive && (
        <>
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-TNWNEYMDFJ"
          ></script>
          <script dangerouslySetInnerHTML={googletagmanager} />
        </>
      )}
      <script dangerouslySetInnerHTML={liveChat} />
      <script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
        defer
      ></script>

      <script dangerouslySetInnerHTML={hotJar} />
      <script dangerouslySetInnerHTML={metaScript} />
      <link rel="canonical" href={`${url}`} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/svg+xml" href="/logoX2.jpg" />
      <meta name="robots" content="max-snippet:50, max-image-preview:large" />
      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style key={s.key} {...s.props} dangerouslySetInnerHTML={s.style} />
      ))}
    </>
  );
});
