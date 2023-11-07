import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { ProductCard } from "~/components/shared/product-card/product-card";
import type { ProductModel } from "~/models/product.model";

interface BestSellerProps {
  bestSellerProducts: ProductModel[];
  type: string;
}

export const FeatureProducts = component$((props: BestSellerProps) => {
  const { bestSellerProducts, type } = props;
  const isVisble = useSignal<boolean>(false);

  useVisibleTask$(
    ({ track }) => {
      track(() => isVisble.value);
      isVisble.value = true;
    },
    { strategy: "intersection-observer" }
  );
  return (
    <div
      class="flex flex-col justify-center items-center gap-7 pt-20"
      style="background-image: url(Dash-lines.webp)"
    >
      <h2 class="font-inter font-bold text-4xl text-black">{type}</h2>
      {isVisble.value && (
        <div class="m-6 flex flex-row flex-wrap gap-10 justify-center items-center w-full">
          {bestSellerProducts.map((item: ProductModel, i: number) => (
            <ProductCard product={item} i={i} key={i} />
          ))}
        </div>
      )}
    </div>
  );
});
