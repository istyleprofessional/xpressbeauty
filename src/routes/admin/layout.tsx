import { component$, Slot } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { NavBar } from "~/components/admin/nav-bar/nav-bar";
import { SideNav } from "~/components/admin/side-nav/side.nav";
import { verifyTokenAdmin } from "~/utils/token.utils";

export const useProfileLoader = routeLoader$(async ({ cookie, redirect }) => {
  const token = cookie.get("token")?.value;
  const validateToken = verifyTokenAdmin(token ?? "");
  if (!validateToken) {
    throw redirect(301, "/admin-login/");
  }
});

export default component$(() => {
  return (
    <main class="flex flex-col gap-3">
      <NavBar />
      <div class="flex flex-row gap-3 h-full">
        <SideNav />
        <Slot />
      </div>
    </main>
  );
});

export const head: DocumentHead = {
  title: `Admin dashboard for xpress beauty`,
};
