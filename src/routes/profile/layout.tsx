import { Slot, component$ } from "@builder.io/qwik";
import { SideNavDashboard } from "~/components/profile/side-nav-dashboard/side-nav-dashboard";

export default component$(() => {
  return (
    <div class="flex flex-col gap-2 justify-center items-center md:p-5">
      <SideNavDashboard />
      <Slot />
    </div>
  );
});
