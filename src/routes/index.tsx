import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { BestSeller } from "~/components/home/best-seller/best-seller";
import { Hero } from "~/components/home/hero/hero";
import { NewArrival } from "~/components/home/new-arrival/new-arrival";
import { NewsLetters } from "~/components/home/news-letters/news-letters";
import { ShopByBrand } from "~/components/home/shop-by-brand/shop-by-brand";
import { ShopNow } from "~/components/home/shop-now/shop-now";
import { WhyChooseUs } from "~/components/home/why-choose-us/why-choose-us";
import { connect } from "~/express/db.connection";
import { get_new_arrivals_products } from "~/express/services/product.service";
import type { ProductModel } from "~/models/product.model";

export const useNewArrivalProducts = routeLoader$(async () => {
  await connect();
  const newArrivalsProducts =
    (await get_new_arrivals_products()) as ProductModel[];
  return JSON.stringify(newArrivalsProducts as ProductModel[]);
});

export default component$(() => {
  const status = process.env.STATUS;
  const newArrivalProducts: ProductModel[] = JSON.parse(
    useNewArrivalProducts().value
  );

  return (
    <>
      {status === "1" && (
        <>
          <Hero />
          <ShopByBrand />
          <ShopNow />
          <NewArrival newArrivalProducts={newArrivalProducts} />
          <div class="flex justify-center items-center">
            <button
              class="btn btn-primary text-white font-['Inter'] w-40 rounded-sm mt-8"
              aria-label="See More Products"
            >
              See More
            </button>
          </div>
          <BestSeller bestSellerProducts={newArrivalProducts} />
          <div class="flex justify-center items-center">
            <button
              class="btn btn-primary text-white font-['Inter'] w-40 rounded-sm mt-8"
              aria-label="See More Products"
            >
              See More
            </button>
          </div>
          <div class="pt-20 flex flex-col gap-20 items-center justify-center">
            <WhyChooseUs />
          </div>
          <div class="pt-20">
            <NewsLetters />
          </div>
        </>
      )}
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
