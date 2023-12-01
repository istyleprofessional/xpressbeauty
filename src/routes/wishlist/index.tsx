import { component$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { PerviousArrowIconNoStick } from "~/components/shared/icons/icons";
import { ProductList } from "~/components/wishlist/product-list";

export default component$(() => {
  const isLoading = useSignal<boolean>(false);

  return (
    <>
      {isLoading.value && (
        <div class="w-full backdrop-blur-lg drop-shadow-lg fixed z-20 m-auto inset-x-0 inset-y-0 ">
          <progress class="progress progress-white w-56 fixed z-20 m-auto inset-x-0 inset-y-0  bg-black"></progress>
        </div>
      )}
      <div class="flex flex-col gap-20 md:p-10">
        <div class="flex flex-col md:flex-row gap-10 justify-center items-center">
          <div class="flex flex-col gap-4 justify-center items-start w-full">
            <a
              class="text-black font-bold text-base lg:text-3xl flex flex-row gap-1 items-center cursor-pointer"
              href="/products/"
            >
              <PerviousArrowIconNoStick color="black" width="10%" /> Continue
              Shopping
            </a>
            <ProductList />
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Xpress Beauty | My Wishlist",
  links: [
    {
      rel: "canonical",
      href: "https://xpressbeauty.ca/wishlist/",
    },
  ],
  meta: [
    {
      name: "description",
      content:
        "Discover the epitome of luxury beauty at XpressBeauty – your premier destination for exquisite haircare, trimmers, and precision tools. Elevate your grooming routine with our curated selection of premium products with the cheapest price, meticulously crafted to meet the needs of the modern connoisseur. Explore the art of refinement with XpressBeauty today.",
    },
  ],
};
