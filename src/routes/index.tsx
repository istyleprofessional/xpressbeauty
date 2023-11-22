import {
  component$,
  // useContext,
  useSignal,
  // useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { FeatureProducts } from "~/components/home/tools-products/tools-products";
import { Hero } from "~/components/home/hero/hero";
// import { ShopByBrand } from "~/components/home/shop-by-brand/shop-by-brand";
import { WhyChooseUs } from "~/components/home/why-choose-us/why-choose-us";
import { connect } from "~/express/db.connection";
import { get_new_arrivals_products } from "~/express/services/product.service";
import type { ProductModel } from "~/models/product.model";
// import BannerImage from "~/media/banner.jpg?jsx";
// import { UserContext } from "~/context/user.context";

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
  const status = import.meta.env.VITE_STATUS;
  const newArrivalProducts: ProductModel[] = JSON.parse(
    useHairProducts().value
  );
  const bestSellerProducts: ProductModel[] = JSON.parse(
    useToolsProducts().value
  );

  const bestSellerProducts2: ProductModel[] = JSON.parse(
    useBestSellerProducts().value
  );
  const isCard = useSignal(false);
  // const nav = useNavigate();
  // const user = useContext(UserContext);

  // useVisibleTask$(
  //   async ({ cleanup }) => {
  //     const checkUserCard = await checkIfDisplayCard(user.value?._id ?? "");
  //     if (checkUserCard) {
  //       const time = setTimeout(() => {
  //         isCard.value = true;
  //       }, 1500);
  //       cleanup(() => {
  //         clearTimeout(time);
  //       });
  //     } else {
  //       isCard.value = false;
  //     }
  //   },
  //   { strategy: "document-idle" }
  // );

  return (
    <>
      {isCard.value && (
        <></>
        // <div class="w-full h-full fixed top-0 left-0 backdrop-blur-md z-50 ">
        //   <div class="card shadow-2xl fixed top-1/2 left-1/2 bg-contain bg-no-repeat bg-white -translate-y-1/2 -translate-x-1/2 z-50">
        //     <BannerImage class="object-contain w-full h-full" />
        //     {/** create two button at the end of the image one to register and one no thanx */}
        //     <div class="flex flex-row gap-4 absolute bottom-0 w-full justify-center items-center">
        //       <button
        //         class="bg-white text-black font-bold text-base py-2 px-4 rounded m-2"
        //         onClick$={() => {
        //           nav("/register");
        //         }}
        //       >
        //         Register
        //       </button>
        //       <button
        //         class=" text-white font-bold text-base py-2 px-4 rounded m-2"
        //         onClick$={() => {
        //           isCard.value = false;
        //         }}
        //       >
        //         No Thanks
        //       </button>
        //     </div>
        //   </div>
        // </div>
      )}
      {status === "1" && (
        <div class="flex flex-col gap-10">
          <Hero />
          {/* <ShopByBrand /> */}
          <FeatureProducts
            bestSellerProducts={bestSellerProducts2}
            type="Top Selling Products"
          />
          <div class="flex justify-center items-center">
            <a
              class="btn btn-primary text-white font-['Inter'] w-fit rounded-sm mt-8"
              aria-label="See More Products"
              href="/products/"
            >
              See More Products
            </a>
          </div>
          <FeatureProducts
            bestSellerProducts={newArrivalProducts}
            type="Hair Products"
          />
          <div class="flex justify-center items-center">
            <a
              class="btn btn-primary text-white font-['Inter'] w-fit rounded-sm mt-8"
              aria-label="See More Products"
              href="/products/"
            >
              See More Products
            </a>
          </div>
          <FeatureProducts
            bestSellerProducts={bestSellerProducts}
            type="Clippers & Trimmers"
          />
          <div class="flex justify-center items-center">
            <a
              class="btn btn-primary text-white font-['Inter'] w-fit  rounded-sm mt-8"
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
      )}
    </>
  );
});

export const head: DocumentHead = {
  title: "Xpress Beauty | Home",
  meta: [
    {
      name: "description",
      content:
        "Discover the epitome of luxury beauty at XpressBeauty – your premier destination for exquisite haircare, trimmers, and precision tools. Elevate your grooming routine with our curated selection of premium products with the cheapest price, meticulously crafted to meet the needs of the modern connoisseur. Explore the art of refinement with XpressBeauty today.",
    },
  ],
};
