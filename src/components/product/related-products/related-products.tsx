import { component$, $ } from "@builder.io/qwik";
import { ProductCard } from "~/components/shared/product-card/product-card";
import {
  NextArrowIconNoStick,
  PerviousArrowIconNoStick,
} from "~/components/shared/icons/icons";

export interface RelatedProductsProps {
  relatedProducts?: any[];
}

export const RelatedProducts = component$((props: RelatedProductsProps) => {
  const { relatedProducts } = props;

  const handleNextSlideClick = $(() => {
    const carousel = document.querySelector<HTMLElement>(".carousel")!;
    const scrollAmount = carousel.offsetWidth / 2; // Scroll half the width of the carousel
    carousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  const handlePerviousSlideClick = $(() => {
    const carousel = document.querySelector<HTMLElement>(".carousel")!;
    const scrollAmount = -carousel.offsetWidth / 2; // Scroll half the width of the carousel
    carousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  return (
    <div class="flex flex-col justify-center items-center">
      <h2 class="text-black p-3 text-3xl font-bold">Related Products</h2>
      <div class="flex flex-row items-center justify-center w-full">
        <button
          class="btn btn-circle w-fit md:w-12 z-10 flex items-center justifty-center justify-self-start  bg-black absolute left-0"
          onClick$={handlePerviousSlideClick}
          aria-label="scroll prev"
        >
          <PerviousArrowIconNoStick color="white" />
        </button>
        <div class="flex flex-col gap-8 items-center w-[90vw] z-0">
          <div class="carousel carousel-center w-full p-4 space-x-4 bg-white rounded-box">
            {relatedProducts?.map((item: any, i: number) => (
              <div class="carousel-item" key={i}>
                <ProductCard product={item} i={i} cardSize="sm" />
              </div>
            ))}
          </div>
        </div>
        <button
          class="btn btn-circle w-fit md:w-12 z-10 flex items-center justifty-center justify-self-end  bg-black absolute right-0"
          onClick$={handleNextSlideClick}
          aria-label="scroll next"
        >
          <NextArrowIconNoStick color="white" />
        </button>
      </div>
    </div>
  );
});
