import type { QRL } from "@builder.io/qwik";
import {
  component$,
  useOnDocument,
  useSignal,
  useVisibleTask$,
  $,
} from "@builder.io/qwik";
import { Pagination } from "~/components/shared/pagination/pagination";
import { ProductCard } from "~/components/shared/product-card/product-card";

export interface ProductSectionProps {
  products: any;
  currentPage: any;
  handleSorting: QRL<(e: any) => void>;
  currencyObject?: any;
  inStock: any;
}

export const ProductsSection = component$((props: ProductSectionProps) => {
  const { products, currentPage, handleSorting, currencyObject, inStock } =
    props;
  const total = useSignal<number>(0);

  useVisibleTask$(({ track }) => {
    track(() => products.value.total);
    total.value = products.value.total;
  });

  useOnDocument(
    "DOMContentLoaded",
    $(() => {
      // add products schema
      const jsonProducts = document.createElement("script");
      jsonProducts.type = "application/ld+json";
      const object = {
        "@context": "https://schema.org/",
        "@type": "ItemList",
        itemListElement: products.value.result.map(
          (product: any, index: number) => {
            return {
              "@type": "ListItem",
              position: index + 1,
              url: `https://xpressbeauty.ca/products/${product.perfix}`,
            };
          }
        ),
      };
      jsonProducts.text = JSON.stringify(object);
      document.head.appendChild(jsonProducts);
    })
  );

  return (
    <div class="flex flex-col gap-7 w-full">
      <div class="h-24 w-[100%] lg:flex lg:flex-row items-center hidden md:hidden">
        <div class=" flex-row gap-1 justify-center items-center hidden lg:flex">
          <input
            type="checkbox"
            id="checkbox"
            name="checkbox"
            class="checkbox checkbox-success"
            checked={inStock.value}
            onChange$={(_: any, elem: HTMLInputElement) => {
              if (elem.checked) {
                inStock.value = true;
                const url = new URL(window.location.href);
                url.searchParams.set("inStock", "true");
                location.href = url.pathname + url.search;
              } else {
                inStock.value = false;
                const url = new URL(window.location.href);
                url.searchParams.set("inStock", "false");
                location.href = url.pathname + url.search;
              }
            }}
          />
          <label for="checkbox" class="font-bold">
            In Stock
          </label>
        </div>
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
        {/** In stock checkbox */}
      </div>
      <div class="flex flex-row flex-wrap justify-center gap-4">
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
