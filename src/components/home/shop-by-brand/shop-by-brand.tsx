import { component$, $ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";

export const ShopByBrand = component$(() => {
  const nav = useNavigate();

  const onShopBrandsClick = $(() => {
    localStorage.setItem("filter", "Brands");
    nav("/products");
  });

  return (
    <div class="flex flex-col justify-center items-center pt-7 lg:pt-20">
      <h1 class="font-bold text-4xl text-black">Shop By Brand</h1>
      <div class="flex flex-row flex-wrap justify-center gap-20 p-10 items-center">
        <img
          src="brands-images/Andis-Company.webp"
          alt="andis logo"
          class="lg:w-60 w-28 h-full"
        />
        <img
          src="brands-images/Babyliss.webp"
          alt="Babyliss logo"
          class="lg:w-60 w-28 h-full"
        />
        <img
          src="/brands-images/3VERSINCE-logo.webp"
          alt="3VERSINCE logo"
          class="lg:w-60 w-28 h-full"
        />
        <img
          src="brands-images/PHILTHYBLENDZ-logo.webp"
          alt="PHILTHYBLENDZ logo"
          class="lg:w-60 w-28 h-full"
        />
        <img
          src="brands-images/Schwarzkopf.webp"
          alt="Schwarzkopf logo"
          class="lg:w-60 w-28 h-full"
        />
        <img
          src="brands-images/matrix.webp"
          alt="andis logo"
          class="lg:w-60 w-28 h-full"
        />
        <img
          src="brands-images/John-Paul-Mitchell.webp"
          alt="John Paul Mitchell logo"
          class="lg:w-60 w-28 h-full"
        />
        <img
          src="brands-images/L'Oréal.webp"
          alt="L'Oréal logo"
          class="lg:w-60 w-28 h-full"
        />
      </div>
      <button
        class="btn btn-primary btn-lg text-white font-['Inter'] w-fit rounded-sm mt-8"
        aria-label="See More Products"
        onClick$={onShopBrandsClick}
      >
        Shop By Brands
      </button>
    </div>
  );
});
