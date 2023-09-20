import { component$ } from "@builder.io/qwik";

export const SideNavDashboard = component$(() => {
  return (
    <>
      <div class="card shadow-lg justify-center items-center">
        <div class="card-body ">
          <ul class="menu p-0 overflow-y-auto w-full max-h-96 gap-6 menu-horizontal">
            <li>
              <a
                href="/profile/"
                class="menu-title text-black font-bold text-xl btn btn-ghost"
              >
                <span>My Profile</span>
              </a>
            </li>
            <li>
              <a
                href="/profile/my-order"
                class="menu-title text-black font-bold text-xl btn btn-ghost"
              >
                <span>My Orders</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
});
