import { component$, useVisibleTask$ } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";
import "./global.css";
import { initFlowbite } from "flowbite";

export default component$(() => {
  useVisibleTask$(() => {
    initFlowbite();
  });
  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="google-site-verification"
          content="tmLm-5c--tQDq1RnXHHJy_nIcVmme1FtttRBXY6xFRo"
        />
        <link rel="manifest" href="/manifest.json" />
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
