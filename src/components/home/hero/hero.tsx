import {
  component$,
  useStylesScoped$,
  $,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  NextArrowIconNoStick,
  PerviousArrowIconNoStick,
} from "../../shared/icons/icons";
import styles from "./hero.css?inline";
import { Image } from "@unpic/qwik";

export const Hero = component$(() => {
  useStylesScoped$(styles);

  const handleNextSlideClick = $(() => {
    const carousel = document.querySelector<HTMLElement>(".carousels")!;
    const scrollAmount = carousel.offsetWidth / 2; // Scroll half the width of the carousel
    carousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  const handlePerviousSlideClick = $(() => {
    const carousel = document.querySelector<HTMLElement>(".carousels")!;
    const scrollAmount = -carousel.offsetWidth / 2; // Scroll half the width of the carousel
    carousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  useVisibleTask$(({ cleanup }) => {
    const carousel = document.querySelector<HTMLElement>(".carousels")!;
    carousel.scrollLeft = 0;
    const interval = setInterval(() => {
      if (
        Math.round(carousel.scrollLeft) ===
        carousel.scrollWidth - carousel.clientWidth
      ) {
        carousel.scrollLeft = 0;
      } else {
        const scrollAmount = carousel.offsetWidth / 2; // Scroll half the width of the carousel
        carousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 5000);
    cleanup(() => clearInterval(interval));
  });

  return (
    <div class="flex flex-row justify-center items-center">
      <button
        class=" btn btn-circle w-fit z-10 absolute left-0"
        onClick$={handlePerviousSlideClick}
        aria-label="scroll prev"
      >
        <PerviousArrowIconNoStick color="white" />
      </button>
      <div class="carousels flex felx-row gap-5 overflow-x-hidden">
        <a href="/products/filter/Tools" class="carousel-item w-fit">
          <div class="flex flex-col gap-2">
            <Image
              layout="constrained"
              src="/hero-images/Barbering-Products.webp"
              alt="barber products"
              class="rounded-box w-96 h-96"
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
              class="rounded-box w-96 h-96"
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
              class="rounded-box w-96 h-96"
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
              class="rounded-box w-96 h-96"
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
              class="rounded-box w-full h-full"
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
              class="rounded-box w-full h-full"
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
      <button
        class=" btn btn-circle w-fit z-10 absolute right-0"
        onClick$={handleNextSlideClick}
        aria-label="scroll next"
      >
        <NextArrowIconNoStick color="white" />
      </button>
    </div>
  );
});
