import { component$ } from "@builder.io/qwik";
import { ProductCard } from "~/components/shared/product-card/product-card";
import type { ProductModel } from "~/models/product.model";

interface BestSellerProps {
  bestSellerProducts: ProductModel[];
  type: string;
  userObj?: any;
  currencyObject?: any;
}

export const FeatureProducts = component$((props: BestSellerProps) => {
  const { bestSellerProducts, type, userObj, currencyObject } = props;

  return (
    <div
      class="flex flex-col justify-center items-center gap-7 pt-5 lg:pt-20"
      style="background-image: url(Dash-lines.webp)"
    >
      <h2 class="font-inter font-bold text-4xl text-black">{type}</h2>
      <div class="m-6 flex flex-row flex-wrap gap-3 md:gap-6 lg:gap-10 justify-center items-center w-full">
        {bestSellerProducts.map((item: ProductModel, i: number) => (
          <ProductCard
            product={item}
            i={i}
            key={i}
            userObj={userObj}
            currencyObject={currencyObject.cur}
          />
        ))}
      </div>
    </div>
  );
});
