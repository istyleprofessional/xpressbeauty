import { component$ } from "@builder.io/qwik";
import Cat1 from "~/media/cat-1.jpg?jsx";
import Cat2 from "~/media/cat-2.jpg?jsx";
import Cat3 from "~/media/cat-3.jpg?jsx";
import Cat4 from "~/media/cat-5.jpg?jsx";
import Cat5 from "~/media/cat-6.jpg?jsx";
import Cat6 from "~/media/cat-4.jpg?jsx";

export const Categories = component$(() => {
  return (
    <div class="flex flex-col gap-3 md:gap-6 lg:gap-10 justify-center items-center w-full">
      <h3 class="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-black">
        Shop by Category
      </h3>
      <div class="bg-base-100 w-full h-full rounded-lg p-4 flex flex-col md:flex-row lg:flex-row gap-3 md:gap-6 lg:gap-10 justify-center items-center">
        <div class="flex flex-col md:grid md:grid-cols-2 gap-1 justify-center items-center max-w-96">
          <a
            href="/products/filterCategories/Conditioner+Shampoo+Masks/"
            class="w-full h-fit lg:h-96 rounded-lg btn btn-ghost"
          >
            <Cat1
              class="w-full h-fit lg:h-96 rounded-lg object-contain p-2"
              alt="Litter Bottles"
            />
          </a>
          <a
            href="/products/filter/Skin/"
            class="w-full h-fit lg:h-96 rounded-lg btn btn-ghost"
          >
            <Cat2
              class="w-full h-fit lg:h-96 rounded-lg object-contain p-2"
              alt="Skin Care"
            />
          </a>
          <a
            href="/products/filter/Hair Colour/"
            class="w-full h-fit lg:h-96 rounded-lg btn btn-ghost"
          >
            <Cat3
              class="w-full h-fit lg:h-96 rounded-lg object-contain p-2"
              alt="Hair Colour"
            />
          </a>
          <a
            href="/products/filterCategories/Men's-Hair-Care+Gel-&-Glaze/"
            class="w-full h-fit lg:h-96 rounded-lg btn btn-ghost"
          >
            <Cat4
              class="w-full h-fit lg:h-96 rounded-lg object-contain p-2"
              alt="Men Grooming Products"
            />
          </a>
          <a
            href="/products/filter/Tools"
            class="w-full h-fit lg:h-96 rounded-lg btn btn-ghost"
          >
            <Cat5
              class="w-full h-fit lg:h-96 rounded-lg object-contain p-2"
              alt="Clippers & Trimmers"
            />
          </a>
          <a
            href="/products/filterCategories/Textured-Hair/"
            class="w-full h-fit lg:h-96 rounded-lg btn btn-ghost"
          >
            <Cat6
              class="w-full h-fit lg:h-96 rounded-lg object-contain p-2"
              alt="Textured Hair Products"
            />
          </a>
        </div>
      </div>
    </div>
  );
});
