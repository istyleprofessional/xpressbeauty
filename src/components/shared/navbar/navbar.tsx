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
          <a class="lg:text-lg" href="/products-page" aria-label="Hair" onClick$={() => {
            const filter = localStorage.getItem('filter')
            if (filter !== 'Hair') {
              localStorage.setItem('filterCategories', '[]')
              localStorage.setItem('filterBrands', '[]')
            }
            localStorage.setItem('filter', 'Hair')
          }}>
            Hair
          </a>
        </li>
        <li>
          <a class="lg:text-lg" href="/products-page" aria-label="Tools" onClick$={() => {
            const filter = localStorage.getItem('filter')
            if (filter !== 'Tools') {
              localStorage.setItem('filterCategories', '[]')
              localStorage.setItem('filterBrands', '[]')
            }
            localStorage.setItem('filter', 'Tools')
          }}>
            Tools
          </a>
        </li>
        <li>
          <a class="lg:text-lg" href="/products-page" aria-label="Brands" onClick$={() => localStorage.setItem('filter', 'Brands')}>
            Brands
          </a>
        </li>
        <li>
          <a class="lg:text-lg" href="#" aria-label="Catalog">
            Catalog
          </a>
        </li>
      </ul>
    </div>
  );
});
