import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { verifyTokenAdmin } from "~/utils/token.utils";

export const useProfileLoader = routeLoader$(async ({ cookie, redirect }) => {
  const token = cookie.get("token")?.value;
  const validateToken = verifyTokenAdmin(token ?? "");
  if (!validateToken) {
    throw redirect(302, "/admin");
  }
});

export default component$(() => {
  return (
    <main style={{ minHeight: "100vh" }}>
      <section class="mb-20">
        <Slot />
      </section>
    </main>
  );
});
