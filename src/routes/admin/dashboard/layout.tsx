import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useProfileLoader = routeLoader$(async ({ cookie, redirect }) => {
  const token = cookie.get("token")?.value;
  if (!token) {
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
