import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import {
  EditProfileIcon,
  OrderProfileIcon,
} from "~/components/shared/icons/icons";

export const SideNavDashboard = component$(() => {
  const loc = useLocation();

  return (
    <div role="tablist" class="tabs tabs-boxed">
      <a
        href="/profile/"
        role="tab"
        class={`tab [--tab-bg:yellow] [--tab-border-color:orange] text-primary ${
          !loc.url.toString().includes("my-order") ? "tab-active " : ""
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
        class={`tab [--tab-bg:black] ${
          loc.url.toString().includes("my-order") ? "tab-active " : ""
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
