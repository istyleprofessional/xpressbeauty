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

  return (
    <>
      <title>{head.title}</title>
      {process.env.isLive && (
        <>
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-TNWNEYMDFJ"
          ></script>
          <script dangerouslySetInnerHTML={googletagmanager} />
        </>
      )}

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
