import { component$ } from "@builder.io/qwik";

export const ShopNow = component$(() => {
  return (
    <div>
      <img src="sales.webp" alt="shop now" class="w-full h-full p-10" />
      <button
        class="btn bg-black w-[30%] h-16 text-white font-[Inter] font-bold text-2xl normal-case relative left-[35%] bottom-48"
        aria-label="Shop now"
      >
        Shop Now
      </button>
    </div>
  );
});
