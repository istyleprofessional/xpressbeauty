import { component$ } from "@builder.io/qwik";

export interface NavBarProps {
  categories: any;
}

export const NavBar = component$((props: NavBarProps) => {
  const { categories } = props;

  return (
    <div class="bg-black hidden md:flex justify-center items-center h-12">
      <ul class="menu menu-horizontal rounded-box text-white flex flex-row justify-between items-center w-[80%]">
        <li>
          <a class="lg:text-lg" href="/" aria-label="home">
            Home
          </a>
        </li>
        {categories.map((category: any, i: number) => (
          <li key={i}>
            <a
              class="lg:text-lg"
              href={`/products/filter/${category._id}/`}
              aria-label={category._id}
            >
              {category._id}
            </a>
          </li>
        ))}
        <li>
          <a class="lg:text-lg" href="/brands" aria-label="Brands">
            Brands
          </a>
        </li>
      </ul>
    </div>
  );
});
