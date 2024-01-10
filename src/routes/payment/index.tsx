import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useCloverTest = routeLoader$(async ({ redirect, env }) => {
  const client_id = env.get("VITE_APP_ID");
  const url = `${env.get(
    "VITE_CLOVER_URL"
  )}/oauth/authorize?client_id=${client_id}&redirect_uri=${env.get(
    "VITE_APPURL"
  )}/api/cloveroAuth`;
  throw redirect(301, url);
});

export default component$(() => {
  return (
    <div>
      <h1>Payment</h1>
    </div>
  );
});
