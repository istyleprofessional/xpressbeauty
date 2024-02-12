import type { PropFunction } from "@builder.io/qwik";
import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Pagination } from "~/components/shared/pagination/pagination";
import { ProductCard } from "~/components/shared/product-card/product-card";
import { ListCardView } from "../list-view/list-card-view";

export interface ProductSectionProps {
  products: any;
  currentPage: any;
  handleSorting: PropFunction<(e: any) => void>;
  currencyObject?: any;
}

export const ProductsSection = component$((props: ProductSectionProps) => {
  const { products, currentPage, handleSorting, currencyObject } = props;
  const total = useSignal<number>(0);
  const viewToggle = useSignal<string>("grid");

  useVisibleTask$(
    () => {
      viewToggle.value = localStorage.getItem("view") || "grid";
    },
    { strategy: "document-idle" }
  );

  useVisibleTask$(({ track }) => {
    track(() => products.value.total);
    total.value = products.value.total;
  });

  return (
    <div class="flex flex-col gap-7 w-full">
      <div class="h-24 w-[100%] lg:flex lg:flex-row items-center hidden md:hidden">
        <select
          class="select w-52 max-w-xs bg-transparent text-[#52525B] ml-auto select-bordered mr-8 hidden md:block"
          onChange$={handleSorting}
        >
          <option disabled selected>
            Sort By
          </option>
          <option>ASC</option>
          <option>DEC</option>
        </select>
      </div>
      {viewToggle.value === "grid" ? (
        <div class="flex flex-row flex-wrap justify-center gap-1 md:gap-2 lg:gap-4">
          {products.value?.result?.map((product: any, index: number) => (
            <div key={index}>
              <ProductCard
                currencyObject={currencyObject}
                product={product}
                i={index}
                cardSize="sm"
              />
            </div>
          ))}
        </div>
      ) : (
        <div class="md:flex md:flex-col gap-5 hidden">
          {products.value?.result?.map((product: any, index: number) => (
            <div key={index}>
              <ListCardView product={product} i={index} />
            </div>
          ))}
        </div>
      )}
      {products.value?.result?.length === 0 ? (
        <div class="flex flex-col items-center justify-center">
          <h1 class="text-2xl font-bold text-black">No Products Found</h1>
          <p class="text-lg text-[#52525B]">
            Try adjusting your search or filter to find what you are looking
            for.
          </p>
        </div>
      ) : (
        <div class="flex flex-col items-center justify-center p-2">
          <Pagination
            page={currentPage}
            totalProductsNo={total.value}
            perPage={20}
          />
        </div>
      )}
    </div>
  );
});
