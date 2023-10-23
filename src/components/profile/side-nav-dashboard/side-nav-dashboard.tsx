import { component$ } from "@builder.io/qwik";
import {
  EditProfileIcon,
  OrderProfileIcon,
} from "~/components/shared/icons/icons";

export const SideNavDashboard = component$(() => {
  return (
    <>
      <div class="card justify-center items-center bg-white">
        <div class="card-body ">
          <ul class="menu p-0 overflow-y-auto w-full max-h-96 gap-6 menu-horizontal">
            <li>
              <a
                href="/profile/"
                class="menu-title text-black font-normal text-xl btn btn-ghost normal-case"
              >
                <EditProfileIcon />
                <span>My Profile</span>
              </a>
            </li>
            <li>
              <a
                href="/profile/my-order"
                class="menu-title text-black font-normal text-xl btn btn-ghost normal-case"
              >
                <OrderProfileIcon />
                <span>My Orders</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
});
