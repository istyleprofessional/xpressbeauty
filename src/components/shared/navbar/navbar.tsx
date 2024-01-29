import { component$ } from "@builder.io/qwik";

export const NavBar = component$(() => {
  return (
    <div class="bg-black hidden lg:flex justify-center items-center h-12">
      <ul class="menu menu-horizontal rounded-box text-white gap-20">
        <li>
          <a class="lg:text-lg" href="/" aria-label="home">
            Home
          </a>
        </li>
        <li>
          <a class="lg:text-lg" href="/products/filter/Hair/" aria-label="Hair">
            Hair
          </a>
        </li>
        <li>
          <a
            class="lg:text-lg"
            href="/products/filter/Tools/"
            aria-label="Tools"
          >
            Tools
          </a>
        </li>
        <li>
          <a
            class="lg:text-lg"
            href="/products/filterCategories/Skin-Care/"
            aria-label="Brands"
          >
            Skin Care
          </a>
        </li>
        <li>
          <a class="lg:text-lg" href="/brands" aria-label="Brands">
            Brands
          </a>
        </li>
      </ul>
    </div>
  );
});
