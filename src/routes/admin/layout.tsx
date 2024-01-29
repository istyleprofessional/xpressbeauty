import { component$, Slot } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { NavBar } from "~/components/admin/nav-bar/nav-bar";
import { SideNav } from "~/components/admin/side-nav/side.nav";
import jwt from "jsonwebtoken";

export const useProfileLoader = routeLoader$(
  async ({ cookie, redirect, env }) => {
    const token = cookie.get("admin-token")?.value;
    try {
      const validateToken = jwt.verify(
        token ?? "",
        env.get("VITE_JWTSECRET") ?? ""
      );
      if (!validateToken) {
        throw redirect(301, "/admin-login/");
      }
    } catch (error) {
      throw redirect(301, "/admin-login/");
    }
  }
);

export default component$(() => {
  return (
    <main class="flex flex-col gap-3">
      <NavBar />
      <div class="grid grid-cols-7 gap-3 h-full w-full">
        <div>
          <SideNav />
        </div>
        <div class="col-start-2 col-end-8">
          <Slot />
        </div>
      </div>
    </main>
  );
});

export const head: DocumentHead = {
  title: `Admin dashboard for xpress beauty`,
};
