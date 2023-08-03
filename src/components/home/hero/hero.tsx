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

  useVisibleTask$(({ cleanup }) => {
    const carousel = document.querySelector<HTMLElement>(".carousel")!;
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
    <>
      <button
        class="btn absolute right-2 lg:bottom-[45%] bottom-1/3 btn-circle w-12 z-10 flex items-center justifty-center"
        onClick$={handleNextSlideClick}
        aria-label="scroll next"
      >
        <NextArrowIconNoStick />
      </button>
      <button
        class="btn absolute left-2 lg:bottom-[45%] bottom-1/3 btn-circle w-12 z-10 flex items-center justifty-center"
        onClick$={handlePerviousSlideClick}
        aria-label="scroll prev"
      >
        <PerviousArrowIconNoStick />
      </button>
      <div class="carousel carousel-center w-full p-4 space-x-4 bg-white rounded-box">
        <div class="carousel-item">
          <div class="flex flex-col gap-2">
            <img
              src="/hero-images/Barbering-Products.webp"
              alt="barber products"
              class="rounded-box w-full h-full"
            />
            <h2 class="font-bold text-lg pl-3 text-black">
              Barbering Products
            </h2>
            <p class="font-normal text-xs pl-3 text-black">
              Shop now for premium barbering products.
            </p>
            <a
              aria-label="barbering link"
              class="pl-3 flex flex-row items-center font-bold text-black"
              href="#"
            >
              <span>SHOP NOW </span>{" "}
              <span>
                <NextArrowIconNoStick color="black" width="8%" />
              </span>
            </a>
          </div>
        </div>
        <div class="carousel-item">
          <div class="flex flex-col gap-2">
            <img
              src="/hero-images/Hair-Care-Products.webp"
              alt="hair care products"
              class="rounded-box w-full h-full"
            />
            <h2 class="font-bold text-lg pl-3 text-black">
              Hair Care Products
            </h2>
            <p class="font-normal text-xs pl-3 text-black">
              Discover the Ultimate Hair Care Experience.
            </p>
            <a
              aria-label="barbering link"
              class="pl-3 flex flex-row items-center font-bold text-black"
              href="#"
            >
              <span>SHOP NOW </span>{" "}
              <span>
                <NextArrowIconNoStick color="black" width="8%" />
              </span>
            </a>
          </div>
        </div>
        <div class="carousel-item">
          <div class="flex flex-col gap-2">
            <img
              src="/hero-images/Hair-Color-Products.webp"
              alt="hair color products"
              class="rounded-box w-full h-full"
            />
            <h2 class="font-bold text-lg pl-3 text-black">
              Hair Color Products
            </h2>
            <p class="font-normal text-xs pl-3 text-black">
              Transform your look with our hair colors.
            </p>
            <a
              aria-label="barbering link"
              class="pl-3 flex flex-row items-center font-bold text-black"
              href="#"
            >
              <span>SHOP NOW </span>{" "}
              <span>
                <NextArrowIconNoStick color="black" width="8%" />
              </span>
            </a>
          </div>
        </div>
        <div class="carousel-item">
          <div class="flex flex-col gap-2">
            <img
              src="/hero-images/Hair-tools-Brushes.webp"
              alt="hair tools brushes"
              class="rounded-box w-full h-full"
            />
            <h2 class="font-bold text-lg pl-3 text-black">
              Hair tools & Brushes Products
            </h2>
            <p class="font-normal text-xs pl-3 text-black">
              Unlock your hair's potential with hair tools.
            </p>
            <a
              aria-label="barbering link"
              class="pl-3 flex flex-row items-center font-bold text-black"
              href="#"
            >
              <span>SHOP NOW </span>{" "}
              <span>
                <NextArrowIconNoStick color="black" width="8%" />
              </span>
            </a>
          </div>
        </div>
        <div class="carousel-item">
          <div class="flex flex-col gap-2">
            <img
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
            <a
              aria-label="barbering link"
              class="pl-3 flex flex-row items-center font-bold text-black"
              href="#"
            >
              <span>SHOP NOW </span>{" "}
              <span>
                <NextArrowIconNoStick color="black" width="8%" />
              </span>
            </a>
          </div>
        </div>
        <div class="carousel-item">
          <div class="flex flex-col gap-2">
            <img
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
            <a
              aria-label="barbering link"
              class="pl-3 flex flex-row items-center font-bold text-black"
              href="#"
            >
              <span>SHOP NOW </span>{" "}
              <span>
                <NextArrowIconNoStick color="black" width="8%" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
});
