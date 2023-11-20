import { component$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  const url = loc.url.href.split(".ca")[1];

  const googletagmanager = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TNWNEYMDFJ');
  gtag('config', 'AW-11356703111');
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
      <script dangerouslySetInnerHTML={metaScript} />
      <link rel="canonical" href={`https://xpressbeauty.ca${url}`} />
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
