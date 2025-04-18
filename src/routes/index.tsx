import { component$, useContext, useOnDocument, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { FeatureProducts } from "~/components/home/tools-products/tools-products";
import { WhyChooseUs } from "~/components/home/why-choose-us/why-choose-us";
import { connect } from "~/express/db.connection";
import { get_new_arrivals_products } from "~/express/services/product.service";
import type { ProductModel } from "~/models/product.model";
import { UserContext } from "~/context/user.context";
import { CurContext } from "~/context/cur.context";
import { Categories } from "~/components/home/categories/categories";
import { Hero } from "~/components/home/hero/hero";

// import HeroImage2 from "~/media/hero-2.jpg?jsx";

export const useHairProducts = routeLoader$(async () => {
  await connect();
  const newArrivalsProducts = (await get_new_arrivals_products(
    "Hair"
  )) as ProductModel[];
  return JSON.stringify(newArrivalsProducts as ProductModel[]);
});

export const useToolsProducts = routeLoader$(async () => {
  await connect();
  const newArrivalsProducts = (await get_new_arrivals_products(
    "Tools"
  )) as ProductModel[];
  return JSON.stringify(newArrivalsProducts as ProductModel[]);
});

export const useBestSellerProducts = routeLoader$(async () => {
  await connect();
  const newArrivalsProducts =
    (await get_new_arrivals_products()) as ProductModel[];
  return JSON.stringify(newArrivalsProducts as ProductModel[]);
});

export const checkIfDisplayCard = server$(async function () {
  const isBannarDisplay = this.cookie.get("bannar")?.value ?? "";
  if (!isBannarDisplay || isBannarDisplay === "false") {
    this.cookie.set("bannar", "true", {
      httpOnly: true,
      path: "/",
    });
    return true;
  } else {
    return false;
  }
});

export default component$(() => {
  // const status = import.meta.env.VITE_STATUS;
  const newArrivalProducts: ProductModel[] = JSON.parse(
    useHairProducts().value
  );
  const bestSellerProducts: ProductModel[] = JSON.parse(
    useToolsProducts().value
  );
  const bestSellerProducts2: ProductModel[] = JSON.parse(
    useBestSellerProducts().value
  );
  const userObj: any = useContext(UserContext);
  const currencyObject: any = useContext(CurContext);

  useOnDocument(
    "DOMContentLoaded",
    $(() => {
      const products = [
        ...newArrivalProducts,
        ...bestSellerProducts,
        ...bestSellerProducts2,
      ];
      // add products schema
      const jsonProducts = document.createElement("script");
      jsonProducts.type = "application/ld+json";
      const object = {
        "@context": "https://schema.org/",
        "@type": "ItemList",
        itemListElement: products.map((product, index) => {
          return {
            "@type": "ListItem",
            position: index + 1,
            url: `https://xpressbeauty.ca/products/${product.perfix}`,
          };
        }),
      };
      jsonProducts.text = JSON.stringify(object);
      document.head.appendChild(jsonProducts);
    })
  );

  return (
    <>
      <div class="flex flex-col gap-3 md:gap-6 lg:gap-10">
        {/* <HeroImage2 id="slide1" class="w-full h-full object-cover p-2" /> */}
        <Hero />

        <Categories />

        <FeatureProducts
          bestSellerProducts={bestSellerProducts2}
          type="Top Selling Products"
          userObj={userObj}
          currencyObject={currencyObject}
        />
        <div class="flex justify-center items-center">
          <a
            class="btn bg-black text-white font-['Inter'] w-fit rounded-sm mt-8"
            aria-label="See More Products"
            href="/products/"
          >
            See More Products
          </a>
        </div>
        <FeatureProducts
          bestSellerProducts={newArrivalProducts}
          type="Hair Products"
          userObj={userObj}
          currencyObject={currencyObject}
        />
        <div class="flex justify-center items-center">
          <a
            class="btn bg-black text-white font-['Inter'] w-fit rounded-sm mt-8"
            aria-label="See More Products"
            href="/products/"
          >
            See More Products
          </a>
        </div>
        <FeatureProducts
          bestSellerProducts={bestSellerProducts}
          type="Clippers & Trimmers"
          userObj={userObj}
          currencyObject={currencyObject}
        />

        <div class="flex justify-center items-center">
          <a
            class="btn bg-black text-white font-['Inter'] w-fit  rounded-sm mt-8"
            aria-label="See More Products"
            href="/products/"
          >
            See More Products
          </a>
        </div>
        <div class="p-20 flex flex-col gap-20 items-center justify-center">
          <WhyChooseUs />
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Xpress Beauty | Home",
  links: [
    {
      rel: "canonical",
      href: "https://xpressbeauty.ca/",
    },
  ],
  meta: [
    {
      name: "description",
      content:
        "Discover the epitome of luxury beauty at XpressBeauty – your premier destination for exquisite haircare, trimmers, and precision tools. Elevate your grooming routine with our curated selection of premium products with the cheapest price, meticulously crafted to meet the needs of the modern connoisseur. Explore the art of refinement with XpressBeauty today.",
    },
  ],
};
