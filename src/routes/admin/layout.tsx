import { component$, Slot } from "@builder.io/qwik";
import { DocumentHead, routeLoader$, useLocation } from "@builder.io/qwik-city";
import { SideNav } from "~/components/admin/side-nav/side.nav";
import { verifyTokenAdmin } from "~/utils/token.utils";

export const useProfileLoader = routeLoader$(
  async ({ cookie, redirect, url }) => {
    if (url.pathname !== "/admin/") {
      try {
        const token = cookie.get("token")?.value;
        const validateToken = verifyTokenAdmin(token ?? "");
        if (!validateToken) {
          throw redirect(302, "/admin");
        }
      } catch {
        throw redirect(302, "/admin");
      }
    }
  }
);

export default component$(() => {
  const loc = useLocation();
  return (
    <main style={{ minHeight: "100vh" }}>
      <div class="flex flex-row gap-10">
        {loc.url.pathname !== "/admin/" && (
          <SideNav location={loc.url.pathname} />
        )}
        <Slot />
      </div>
    </main>
  );
});

export const head: DocumentHead = {
  title: `Admin dashboard for xpress beauty`,
};
