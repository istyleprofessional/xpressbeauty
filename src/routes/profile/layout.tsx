import {
  Slot,
  component$,
  useContext,
  useVisibleTask$,
} from "@builder.io/qwik";
import { SideNavDashboard } from "~/components/profile/side-nav-dashboard/side-nav-dashboard";
import { useNavigate } from "@builder.io/qwik-city";
import { UserContext } from "~/context/user.context";

export default component$(() => {
  const userData: any = useContext(UserContext);
  const nav = useNavigate();

  useVisibleTask$(() => {
    if (!userData?.user?.email) {
      nav("/login");
      return;
    }
  });

  return (
    <div class="flex flex-col gap-2">
      <SideNavDashboard />
      <Slot />
    </div>
  );
});
