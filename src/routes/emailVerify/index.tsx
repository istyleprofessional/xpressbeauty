import { component$, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { checkUserEmailToken } from "~/express/services/user.service";

export default component$(() => {
  const loc = useLocation();
  const token = loc.url.searchParams.get("token");

  useTask$(async () => {
    await checkUserEmailToken(token ?? "");
  });
  useVisibleTask$(() => {
    location.href = "/";
  });
  return <></>;
});
