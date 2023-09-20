import { component$ } from "@builder.io/qwik";

export const ShopNow = component$(() => {
  return (
    <div class="bg-[url('/sales.webp')] h-96 md:h-[10%] w-full bg-contain bg-no-repeat bg-center flex justify-center">
      <button
        class="btn bg-black w-[30%] h-fit text-white font-[Inter] font-bold text-sm md:text-2xl normal-case self-end "
        aria-label="Shop now"
      >
        Shop Now
      </button>
    </div>
  );
});
