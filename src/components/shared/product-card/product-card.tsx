import { component$ } from "@builder.io/qwik";
import type { ProductModel } from "~/models/product.model";

interface ProductCardProps {
  product: ProductModel;
  i: number;
  cardSize?: string;
}

export const extractPrices = (priceString: string) => {
  const regex = /(\$\d+\.\d+)\s*(\$\d+\.\d+)?/;
  const matches = priceString.match(regex);
  if (matches) {
    const [price1, price2] = matches;
    return [price1, price2];
  } else {
    return [priceString];
  }
};

export const ProductCard = component$((props: ProductCardProps) => {
  const { product, i, cardSize } = props;

  return (
    <a
      class={`btn btn-ghost flex flex-row lg:flex-col ${
        cardSize === "sm" ? "lg:w-56 lg:h-56" : "lg:w-96 lg:h-96"
      } w-40 h-56 bg-[#FAFAFA] rounded-lg border-2 border-[#D4D4D8] border-solid justify-center
         items-center`}
      href={`/product/${encodeURIComponent(
        product.product_name
          ?.replace(/[^a-zA-Z ]/g, "")
          .replace(/ /g, "-")
          .toLowerCase() ?? ""
      )}`}
    >
      <img
        key={i}
        src={(product?.imgs ?? [])[0] ?? ""}
        onError$={(e: any) => {
          e.target.src = "/placeholder.webp";
        }}
        alt={product.product_name}
        class={`${
          cardSize === "sm" ? "lg:w-28 lg:h-28" : "lg:w-44 lg:h-44"
        } w-16 h-16 object-contain`}
      />
      <div class="p-0 m-0 flex flex-col items-left gap-3 w-full">
        <h2
          class={`whitespace-normal ${
            cardSize === "sm" ? "lg:text-xs" : "lg:text-lg"
          } text-sm text-black`}
        >
          {product.product_name}
        </h2>
        <p
          class={`${
            cardSize === "sm" ? "lg:text-xs" : "lg:text-lg"
          } text-sm text-black`}
        >
          {product?.sale_price ? (
            <>
              <span class="line-through">
                CA${" "}
                {parseFloat(product?.price?.replace("$", "") ?? "0").toFixed(2)}
              </span>{" "}
              <span class=" text-error">
                CA${" "}
                {parseFloat(
                  product?.sale_price?.replace("$", "") ?? "0"
                ).toFixed(2)}
              </span>
            </>
          ) : (
            <>
              {(product?.variations?.length ?? 0 > 0) &&
              product?.price?.includes("-") ? (
                <>
                  <span class="text-black">
                    CA${" "}
                    {parseFloat(
                      product?.price?.split("-")[0].replace("$", "") ?? "0"
                    ).toFixed(2)}{" "}
                    - CA${" "}
                    {parseFloat(
                      product?.price?.split("-")[1].replace("$", "") ?? "0"
                    ).toFixed(2)}
                  </span>
                </>
              ) : (
                <>
                  <span class="text-black">
                    CA${" "}
                    {parseFloat(
                      product?.price?.replace("$", "") ?? "0"
                    ).toFixed(2)}
                  </span>
                </>
              )}
            </>
          )}
        </p>
      </div>
    </a>
  );
});
