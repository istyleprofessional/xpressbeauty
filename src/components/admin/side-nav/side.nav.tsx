import { Slot, component$ } from "@builder.io/qwik";
import {
  CreditCardIcon,
  DashboardIcon,
  ProductBagIcon,
  SettingIcon,
  ShoppingCartIcon,
  TruckIcon,
} from "../../shared/icons/icons";

export const SideNav = component$((props: any) => {
  const { location } = props;

  return (
    <>
      <div class="drawer pt-8">
        <input id="my-drawer" type="checkbox" class="drawer-toggle btn" />
        <div class="drawer-content">
          <div class="flex flex-row gap-3">
            <div class="flex flex-col gap-3">
              <label for="my-drawer" class="btn btn-primary text-xs drawer-button btn-lg btn-circle">Menu</label>
              {location === "/admin/products/" &&
                <label for="my-drawer" class="btn btn-primary text-xs drawer-button btn-lg btn-circle">Filter</label>
              }
            </div>
            <Slot />
          </div>
        </div>
        <div class="drawer-side">
          <label for="my-drawer" class="drawer-overlay"></label>
          <ul class="menu p-4 w-80 bg-base-100 text-base-content">
            <li>  <a
              class={`flex flex-row gap-4 items-center ${location === "/admin/dashboard/" ? "text-[#2A4178]" : "text-[#A7B7DD]"
                }`}
              href="/admin/dashboard"
              aria-label="Dashboard"
            >
              <span>
                <DashboardIcon
                  color={`${location === "/admin/dashboard/" ? "#2A4178" : "#A7B7DD"
                    }`}
                />
              </span>{" "}
              <span> Dashboard</span>
            </a></li>
            <li> <a
              class={`flex flex-row gap-4 items-center ${location === "/admin/order/" ? "text-[#2A4178]" : "text-[#A7B7DD]"
                }`}
              href="/admin/order/"
              aria-label="Orders"
            >
              <span>
                <ShoppingCartIcon
                  color={`${location === "/admin/order/" ? "#2A4178" : "#A7B7DD"}`}
                />
              </span>{" "}
              <span> Order</span>
            </a>
            </li>
            <li>
              <a
                class={`flex flex-row gap-4 items-center ${location === "/admin/products/" ? "text-[#2A4178]" : "text-[#A7B7DD]"
                  }`}
                href="/admin/products/"
                aria-label="Products"
              >
                <span>
                  <ProductBagIcon
                    color={`${location === "/admin/products/" ? "#2A4178" : "#A7B7DD"}`}
                  />
                </span>{" "}
                <span> Products</span>
              </a>
            </li>
            <li>
              <a
                class={`flex flex-row gap-4 items-center ${location === "/admin/shipping/" ? "text-[#2A4178]" : "text-[#A7B7DD]"
                  }`}
                href="/admin/shipping/"
                aria-label="Shippings"
              >
                <span>
                  <TruckIcon
                    color={`${location === "/admin/shipping/" ? "#2A4178" : "#A7B7DD"}`}
                  />
                </span>
                <span> Shipping</span>
              </a>
            </li>
            <li>
              <a
                class={`flex flex-row gap-4 items-center ${location === "/admin/payments/" ? "text-[#2A4178]" : "text-[#A7B7DD]"
                  }`}
                href="/admin/payments/"
                aria-label="Payments"
              >
                <span>
                  <CreditCardIcon
                    color={`${location === "/admin/payments/" ? "#2A4178" : "#A7B7DD"}`}
                  />
                </span>{" "}
                <span> Payments</span>
              </a>
            </li>
            <li>
              <a
                class={`flex flex-row gap-4 items-center ${location === "/admin/settings/" ? "text-[#2A4178]" : "text-[#A7B7DD]"
                  }`}
                href="/admin/settings/"
                aria-label="Settings"
              >
                <span>
                  <SettingIcon
                    color={`${location === "/admin/settings/" ? "#2A4178" : "#A7B7DD"}`}
                  />
                </span>{" "}
                <span> Settings</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
});
