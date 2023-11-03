import { component$, $, useStylesScoped$ } from "@builder.io/qwik";
import {
  NextArrowIconNoStick,
  PerviousArrowIconNoStick,
} from "../../shared/icons/icons";
import styles from "./hero.css?inline";
import { Image } from "@unpic/qwik";

export const Hero = component$(() => {
  useStylesScoped$(styles);
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
        <div class="flex flex-col gap-8 items-center w-full z-0">
          <div class="carousel carousel-center w-full p-4 space-x-4 bg-white rounded-box">
            <div class="carousel-item gap-4">
              <a href="/products/filter/Tools" class="carousel-item w-fit">
                <div class="flex flex-col gap-2">
                  <Image
                    layout="constrained"
                    src="/hero-images/Barbering-Products.webp"
                    alt="barber products"
                    class="rounded-box w-80 h-80 lg:w-96 lg:h-96"
                  />
                  <h2 class="font-bold text-lg pl-3 text-black">
                    Barbering Products
                  </h2>
                  <p class="font-normal text-xs pl-3 text-black">
                    Shop now for premium barbering products.
                  </p>
                  <p
                    aria-label="barbering link"
                    class="pl-3 flex flex-row items-center font-bold text-black underline"
                  >
                    <span>SHOP NOW </span>{" "}
                    <span>
                      <NextArrowIconNoStick color="black" width="8%" />
                    </span>
                  </p>
                </div>
              </a>
              <a href="/products/filter/Hair" class="carousel-item">
                <div class="flex flex-col gap-2">
                  <Image
                    layout="constrained"
                    src="/hero-images/Hair-Care-Products.webp"
                    alt="hair care products"
                    class="rounded-box w-80 h-80 lg:w-96 lg:h-96"
                  />
                  <h2 class="font-bold text-lg pl-3 text-black">
                    Hair Care Products
                  </h2>
                  <p class="font-normal text-xs pl-3 text-black">
                    Discover the Ultimate Hair Care Experience.
                  </p>
                  <p
                    aria-label="barbering link"
                    class="pl-3 flex flex-row items-center font-bold text-black underline"
                  >
                    <span>SHOP NOW </span>{" "}
                    <span>
                      <NextArrowIconNoStick color="black" width="8%" />
                    </span>
                  </p>
                </div>
              </a>
              <a href="/products/filter/Hair" class="carousel-item">
                <div class="flex flex-col gap-2">
                  <Image
                    layout="constrained"
                    src="/hero-images/Hair-Color-Products.webp"
                    alt="hair color products"
                    class="rounded-box w-80 h-80 lg:w-96 lg:h-96"
                  />
                  <h2 class="font-bold text-lg pl-3 text-black">
                    Hair Color Products
                  </h2>
                  <p class="font-normal text-xs pl-3 text-black">
                    Transform your look with our hair colors.
                  </p>
                  <p
                    aria-label="barbering link"
                    class="pl-3 flex flex-row items-center font-bold text-black underline"
                  >
                    <span>SHOP NOW </span>{" "}
                    <span>
                      <NextArrowIconNoStick color="black" width="8%" />
                    </span>
                  </p>
                </div>
              </a>
              <a href="/products/filter/Tools" class="carousel-item">
                <div class="flex flex-col gap-2">
                  <Image
                    layout="constrained"
                    src="/hero-images/Hair-tools-Brushes.webp"
                    alt="hair tools brushes"
                    class="rounded-box  w-80 h-80 lg:w-96 lg:h-96"
                  />
                  <h2 class="font-bold text-lg pl-3 text-black">
                    Hair tools & Brushes Products
                  </h2>
                  <p class="font-normal text-xs pl-3 text-black">
                    Unlock your hair's potential with hair tools.
                  </p>
                  <p
                    aria-label="barbering link"
                    class="pl-3 flex flex-row items-center font-bold text-black underline"
                  >
                    <span>SHOP NOW </span>{" "}
                    <span>
                      <NextArrowIconNoStick color="black" width="8%" />
                    </span>
                  </p>
                </div>
              </a>
              <a href="/products/filter/Hair" class="carousel-item">
                <div class="flex flex-col gap-2">
                  <Image
                    layout="constrained"
                    src="/hero-images/Men's-Grooming-Products.webp"
                    alt="Men's grooming products"
                    class="rounded-box  w-80 h-80 lg:w-96 lg:h-96"
                  />
                  <h2 class="font-bold text-lg pl-3 text-black">
                    Men's Grooming Products
                  </h2>
                  <p class="font-normal text-xs pl-3 text-black">
                    Refine your grooming routine with us.
                  </p>
                  <p
                    aria-label="barbering link"
                    class="pl-3 flex flex-row items-center font-bold text-black underline"
                  >
                    <span>SHOP NOW </span>{" "}
                    <span>
                      <NextArrowIconNoStick color="black" width="8%" />
                    </span>
                  </p>
                </div>
              </a>
              <a href="/products/filter/Hair" class="carousel-item">
                <div class="flex flex-col gap-2">
                  <Image
                    layout="constrained"
                    src="/hero-images/Textured-Hair-Products.webp"
                    alt="Textured Hair Products"
                    class="rounded-box  w-80 h-80 lg:w-96 lg:h-96"
                  />
                  <h2 class="font-bold text-lg pl-3 text-black">
                    Textured Hair Products
                  </h2>
                  <p class="font-normal text-xs pl-3 text-black">
                    Pick Textured Hair Products to nourish and style your hair.
                  </p>
                  <p
                    aria-label="barbering link"
                    class="pl-3 flex flex-row items-center font-bold text-black underline"
                  >
                    <span>SHOP NOW </span>{" "}
                    <span>
                      <NextArrowIconNoStick color="black" width="8%" />
                    </span>
                  </p>
                </div>
              </a>
            </div>
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
