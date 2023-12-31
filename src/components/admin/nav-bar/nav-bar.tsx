import { component$ } from "@builder.io/qwik";

export const NavBar = component$(() => {
  return (
    <div class="navbar bg-base-100 grid grid-cols-3">
      <div class="flex-1">
        <a class="btn btn-ghost normal-case text-xl">
          <img src="/logoX2.jpg" class="w-full h-full object-contain" />
        </a>
      </div>
      <div class="form-control">
        <input
          type="text"
          placeholder="Search"
          class="input input-bordered w-full"
        />
      </div>
      <div class="flex justify-end">
        <button class="btn btn-square btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
});
