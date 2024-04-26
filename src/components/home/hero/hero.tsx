import { component$, $, useStylesScoped$, useOnWindow } from "@builder.io/qwik";
import {
  NextArrowIconNoStick,
  PerviousArrowIconNoStick,
} from "../../shared/icons/icons";
import styles from "./hero.css?inline";
import { Image } from "@unpic/qwik";

export const Hero = component$(() => {
  const photosArray = [
    { imgUrl: "/hero-images/1.jpg", link: "/products/filterBrands/Matrix/" },
    {
      imgUrl: "/hero-images/2.jpg",
      link: "/products/filterBrands/BABYLISSPRO/",
    },
    {
      imgUrl: "/hero-images/3.jpg",
      link: "/products/filterBrands/PAUL-MITCHELL/",
    },
    { imgUrl: "/hero-images/4.jpg", link: "/products/filterBrands/Rusk/" },
    {
      imgUrl: "/hero-images/5.jpg",
      link: "/products/filterBrands/American-Crew/",
    },
    { imgUrl: "/hero-images/6.jpg", link: "/products/filterBrands/Olaplex/" },
    {
      imgUrl: "/hero-images/7.jpg",
      link: "/products/filterBrands/Wella+WELLA/",
    },
    {
      imgUrl: "/hero-images/8.jpg",
      link: "/products/filterBrands/SCHWARZKOPF/",
    },
    { imgUrl: "/hero-images/9.jpg", link: "/products/filterBrands/ANDIS/" },
    {
      imgUrl: "/hero-images/10.jpg",
      link: "/products/filterBrands/Deva-Curl/",
    },
    { imgUrl: "/hero-images/11.jpg", link: "/products/filterBrands/Biolage/" },
    {
      imgUrl: "/hero-images/12.jpg",
      link: "/products/filterBrands/DESIGN.ME/",
    },
    { imgUrl: "/hero-images/13.jpg", link: "/products/filterBrands/amika/" },
    { imgUrl: "/hero-images/14.jpg", link: "/products/filterBrands/OLIGO/" },
    {
      imgUrl: "/hero-images/15.jpg",
      link: "/products/filterBrands/MOROCCANOIL/",
    },
    { imgUrl: "/hero-images/16.jpg", link: "/products/filterBrands/WAHL/" },
    { imgUrl: "/hero-images/17.jpg", link: "/products/filterBrands/KMS/" },
    { imgUrl: "/hero-images/18.jpg", link: "/products/filterBrands/JRL/" },
    { imgUrl: "/hero-images/19.jpg", link: "/products/filterBrands/Joico/" },
    { imgUrl: "/hero-images/32.jpg", link: "/products/search/pet/" },
  ];
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
              {photosArray
                // shuffle the array to show different images on each load
                .sort(() => Math.random() - 0.5)
                .map((photo: any, index: number) => (
                  <a key={index} href={photo.link} class="carousel-item w-fit">
                    <div class="flex flex-col gap-2">
                      <Image
                        src={photo.imgUrl}
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
                ))}
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
