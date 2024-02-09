import { component$, $, useStylesScoped$, useOnWindow } from "@builder.io/qwik";
import {
  NextArrowIconNoStick,
  PerviousArrowIconNoStick,
} from "../../shared/icons/icons";
import styles from "./hero.css?inline";
import OfferOneImage from "~/media/offer1.jpg?jsx";
import OfferTwoImage from "~/media/offer2.jpg?jsx";
import OfferThreeImage from "~/media/offer3.jpg?jsx";
import OfferFourImage from "~/media/offer4.jpg?jsx";
import OfferFiveImage from "~/media/offer5.jpg?jsx";
import OfferSixImage from "~/media/offer6.jpg?jsx";
import OfferSevenImage from "~/media/Why Choose Us.jpg?jsx";

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

  useOnWindow(
    "load",
    $(() => {
      const timer = setInterval(() => {
        // check if the carousel is in the DOM and scroll till the end
        // then reset the scroll position to 0 but not instantly
        const carousel = document.querySelector<HTMLElement>(".carousel");
        if (carousel) {
          carousel.scrollBy({ left: carousel.offsetWidth, behavior: "smooth" });
          if (
            carousel.scrollLeft ===
            carousel.scrollWidth - carousel.offsetWidth
          ) {
            carousel.scrollLeft = 0;
          }
        }
      }, 5000);
      return () => clearInterval(timer);
    })
  );
  return (
    <div class="flex flex-col justify-center items-center">
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
                  <OfferSevenImage
                    alt="barber products"
                    class="rounded-box w-80 h-80 lg:w-96 lg:h-96"
                  />
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
              <a
                href="/products/filterBrands/Olaplex/"
                class="carousel-item w-fit"
              >
                <div class="flex flex-col gap-2">
                  <OfferOneImage
                    alt="barber products"
                    class="rounded-box w-80 h-80 lg:w-96 lg:h-96"
                  />
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
              <a
                href="/products/filterBrands/BABYLISSPRO/"
                class="carousel-item"
              >
                <div class="flex flex-col gap-2">
                  <OfferTwoImage
                    alt="hair care products"
                    class="rounded-box w-80 h-80 lg:w-96 lg:h-96"
                  />
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
              <a
                href="/products/filterBrands/Schwarzkopf-Professional/"
                class="carousel-item"
              >
                <div class="flex flex-col gap-2">
                  <OfferThreeImage
                    alt="hair color products"
                    class="rounded-box w-80 h-80 lg:w-96 lg:h-96"
                  />
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
              <a href="/products/filterBrands/Wella/" class="carousel-item">
                <div class="flex flex-col gap-2">
                  <OfferFourImage
                    alt="hair tools brushes"
                    class="rounded-box  w-80 h-80 lg:w-96 lg:h-96"
                  />
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
              <a href="/products/filterBrands/ANDIS/" class="carousel-item">
                <div class="flex flex-col gap-2">
                  <OfferFiveImage
                    alt="Men's grooming products"
                    class="rounded-box  w-80 h-80 lg:w-96 lg:h-96"
                  />
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
              <a
                href="/products/filterBrands/American-Crew/"
                class="carousel-item"
              >
                <div class="flex flex-col gap-2">
                  <OfferSixImage
                    alt="Textured Hair Products"
                    class="rounded-box  w-80 h-80 lg:w-96 lg:h-96"
                  />
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
