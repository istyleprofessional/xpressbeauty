import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import {
  EditProfileIcon,
  OrderProfileIcon,
} from "~/components/shared/icons/icons";

export const SideNavDashboard = component$(() => {
  const loc = useLocation();

  return (
    <div role="tablist" class="tabs tabs-md">
      <a
        href="/profile/"
        role="tab"
        class={`tab  text-black ${
          !loc.url.toString().includes("my-order")
            ? "bg-black text-white "
            : "bg-white text-black "
        }`}
      >
        <EditProfileIcon
          color={!loc.url.toString().includes("my-order") ? "white" : "none"}
        />
        <span>My Profile</span>
      </a>
      <a
        href="/profile/my-order"
        role="tab"
        class={`tab ${
          loc.url.toString().includes("my-order")
            ? "bg-black text-white "
            : "bg-white text-black "
        }`}
      >
        <OrderProfileIcon
          color={loc.url.toString().includes("my-order") ? "white" : "none"}
        />
        <span>My Orders</span>
      </a>
    </div>
  );
});
