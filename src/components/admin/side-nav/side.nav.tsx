import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import {
  BrandsAdminIcon,
  CategoriesAdminIcon,
  DashboardAdminIcon,
  OrdersAdminIcon,
  ProductsAdminIcon,
  UsersAdminIcon,
} from "~/components/shared/icons/icons";

export const SideNav = component$(() => {
  const loc = useLocation();

  return (
    <div class="flex flex-col gap-6 w-60 h-full bg-base-100 p-5">
      <a
        class="flex flex-row gap-2 cursor-pointer bg-base-100 normal-case"
        aria-label="Dashboard"
        href="/admin/"
      >
        <DashboardAdminIcon
          color={loc.url.pathname === "/admin/" ? "#7C3AED" : "#6B7280"}
        />
        <p
          class={`text-lg ${
            loc.url.pathname === "/admin/" ? "text-[#7C3AED]" : "text-[#6B7280]"
          }`}
        >
          Dashboard
        </p>
      </a>
      <a
        class="flex flex-row gap-2 cursor-pointer bg-base-100 normal-case"
        aria-label="Orders"
        href="/admin/orders"
      >
        <OrdersAdminIcon
          color={loc.url.pathname.includes("orders") ? "#7C3AED" : "#6B7280"}
        />
        <p
          class={`text-lg ${
            loc.url.pathname.includes("orders")
              ? "text-[#7C3AED]"
              : "text-[#6B7280]"
          }`}
        >
          Orders
        </p>
      </a>
      <a
        class="flex flex-row gap-2 cursor-pointer bg-base-100 normal-case"
        aria-label="Products"
        href="/admin/products"
      >
        <ProductsAdminIcon
          color={loc.url.pathname.includes("products") ? "#7C3AED" : "#6B7280"}
        />
        <p
          class={`text-lg ${
            loc.url.pathname.includes("products")
              ? "text-[#7C3AED]"
              : "text-[#6B7280]"
          }`}
        >
          Products
        </p>
      </a>
      <a
        class="flex flex-row gap-1 cursor-pointer bg-base-100 normal-case"
        aria-label="Categories"
        href="/admin/categories"
      >
        <CategoriesAdminIcon
          color={
            loc.url.pathname.includes("categories") ? "#7C3AED" : "#6B7280"
          }
        />
        <p
          class={`text-lg ${
            loc.url.pathname.includes("categories")
              ? "text-[#7C3AED]"
              : "text-[#6B7280]"
          }`}
        >
          Categories
        </p>
      </a>
      <a
        class="flex flex-row gap-1 cursor-pointer bg-base-100 normal-case"
        aria-label="Brands"
        href="/admin/brands"
      >
        <BrandsAdminIcon
          color={loc.url.pathname.includes("brands") ? "#7C3AED" : "#6B7280"}
        />
        <p
          class={`text-lg ${
            loc.url.pathname.includes("brands")
              ? "text-[#7C3AED]"
              : "text-[#6B7280]"
          }`}
        >
          Brands
        </p>
      </a>
      <a
        class="flex flex-row gap-1 cursor-pointer bg-base-100 normal-case"
        aria-label="Users"
        href="/admin/users"
      >
        <UsersAdminIcon
          color={loc.url.pathname.includes("users") ? "#7C3AED" : "#6B7280"}
        />
        <p
          class={`text-lg ${
            loc.url.pathname.includes("users")
              ? "text-[#7C3AED]"
              : "text-[#6B7280]"
          }`}
        >
          Users
        </p>
      </a>
    </div>
  );
});
