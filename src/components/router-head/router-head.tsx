import { component$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  const url = loc.url.href.split(".ca")[1];

  const trackingCode = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-11356703111');
  `;

  const googletagmanager = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-TNWNEYMDFJ');
  `;

  return (
    <>
      <title>{head.title}</title>
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=AW-11356703111"
      ></script>
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-TNWNEYMDFJ"
      ></script>
      <script dangerouslySetInnerHTML={googletagmanager} />
      <script dangerouslySetInnerHTML={trackingCode} />
      <link rel="canonical" href={`https://xpressbeauty.ca${url}`} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/svg+xml" href="/new logo 1.jpg" />

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
