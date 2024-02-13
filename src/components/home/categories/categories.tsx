import { component$ } from "@builder.io/qwik";
import ClippersTrimmersImage from "~/media/1.png?jsx";
import ShampooImage from "~/media/2.png?jsx";

export const Categories = component$(() => {
  return (
    <div class="flex flex-col gap-3 md:gap-6 lg:gap-10 justify-center items-center w-full">
      <h3 class="text-2xl md:text-3xl lg:text-4xl font-bold text-center">
        Shop by Category
      </h3>
      <div class="bg-base-100 w-full h-full rounded-lg p-4 flex flex-col md:flex-row lg:flex-row gap-3 md:gap-6 lg:gap-10 justify-center items-center">
        <div class="flex flex-col md:flex-row lg:flex-row flex-wrap gap-3 md:gap-6 lg:gap-10 justify-center items-center max-w-7xl">
          <a
            href="/products/filterCategories/Trimmers+Clippers/"
            class="w-96 h-96 rounded-lg btn bg-slate-100"
          >
            <ClippersTrimmersImage
              class=" w-96 h-96 rounded-lg object-contain p-2"
              alt="Clippers & Trimmers"
            />
          </a>
          <a
            href="/products/filterCategories/Shampoo/"
            class="w-96 h-96 rounded-lg btn bg-slate-100"
          >
            <ShampooImage
              class=" w-96 h-96 rounded-lg object-contain p-2"
              alt="Clippers & Trimmers"
            />
          </a>
        </div>
      </div>
    </div>
  );
});
