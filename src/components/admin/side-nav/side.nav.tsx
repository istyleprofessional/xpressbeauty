import { component$ } from "@builder.io/qwik";
import {
  CreditCardIcon,
  DashboardIcon,
  ProductBagIcon,
  SettingIcon,
  ShoppingCartIcon,
  TruckIcon,
} from "../icons/icons";

export const SideNav = component$((props: any) => {
  const { location } = props;

  return (
    <div class="flex flex-col gap-6 w-40 ml-9 mt-9">
      <a
        class={`flex flex-row gap-4 items-center ${
          location === "/admin/dashboard/" ? "text-[#2A4178]" : "text-[#A7B7DD]"
        }`}
        href="/admin/dashboard"
      >
        <span>
          <DashboardIcon
            color={`${
              location === "/admin/dashboard/" ? "#2A4178" : "#A7B7DD"
            }`}
          />
        </span>{" "}
        <span> Dashboard</span>
      </a>
      <a
        class={`flex flex-row gap-4 items-center ${
          location === "/admin/order/" ? "text-[#2A4178]" : "text-[#A7B7DD]"
        }`}
        href="/admin/order/"
      >
        <span>
          <ShoppingCartIcon
            color={`${location === "/admin/order/" ? "#2A4178" : "#A7B7DD"}`}
          />
        </span>{" "}
        <span> Order</span>
      </a>
      <a
        class={`flex flex-row gap-4 items-center ${
          location === "/admin/products/" ? "text-[#2A4178]" : "text-[#A7B7DD]"
        }`}
        href="/admin/products/"
      >
        <span>
          <ProductBagIcon
            color={`${location === "/admin/products/" ? "#2A4178" : "#A7B7DD"}`}
          />
        </span>{" "}
        <span> Products</span>
      </a>
      <a
        class={`flex flex-row gap-4 items-center ${
          location === "/admin/shipping/" ? "text-[#2A4178]" : "text-[#A7B7DD]"
        }`}
        href="/admin/shipping/"
      >
        <span>
          <TruckIcon
            color={`${location === "/admin/shipping/" ? "#2A4178" : "#A7B7DD"}`}
          />
        </span>
        <span> Shipping</span>
      </a>
      <a
        class={`flex flex-row gap-4 items-center ${
          location === "/admin/payments/" ? "text-[#2A4178]" : "text-[#A7B7DD]"
        }`}
        href="/admin/payments/"
      >
        <span>
          <CreditCardIcon
            color={`${location === "/admin/payments/" ? "#2A4178" : "#A7B7DD"}`}
          />
        </span>{" "}
        <span> Payments</span>
      </a>
      <a
        class={`flex flex-row gap-4 items-center ${
          location === "/admin/settings/" ? "text-[#2A4178]" : "text-[#A7B7DD]"
        }`}
        href="/admin/settings/"
      >
        <span>
          <SettingIcon
            color={`${location === "/admin/settings/" ? "#2A4178" : "#A7B7DD"}`}
          />
        </span>{" "}
        <span> Settings</span>
      </a>
    </div>
  );
});
