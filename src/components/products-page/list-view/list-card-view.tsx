import { component$ } from "@builder.io/qwik";
import type { ProductModel } from "~/models/product.model";

interface ListViewCardProps {
  product: ProductModel;
  i: number;
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

export const ListCardView = component$((props: ListViewCardProps) => {
  const { product, i } = props;

  return (
    <a
      class={`btn btn-ghost grid grid-cols-4 gap-2 w-full h-40 bg-[#FAFAFA] rounded-lg border-2 border-[#D4D4D8] border-solid justify-center
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
        src={product?.imgs?.[0] ?? ""}
        onError$={(e: any) => {
          e.target.src = "/placeholder.webp";
        }}
        alt={product.product_name}
        class={`flex mr-auto w-24 h-24 object-contain `}
      />
      <h2 class={`whitespace-normal text-sm text-black place-self-center p-10`}>
        {product.product_name}
      </h2>
      <p class="text-black font-normal text-xs w-52 overflow-hidden text-ellipsis h-36">
        {product?.description
          ?.replace(/<img .*?>/g, "<text>")
          .replace(/<[^>]*>?/gm, "")
          .replace(/[^a-zA-Z ]/g, "")}
      </p>

      <p class={`${"lg:text-lg"} text-sm text-black`}>
        {product?.sale_price ? (
          <>
            <span class="line-through">
              CA${" "}
              {parseFloat(product?.price?.replace("$", "") ?? "0").toFixed(2)}
            </span>{" "}
            <span class=" text-error">
              CA${" "}
              {parseFloat(product?.sale_price?.replace("$", "") ?? "0").toFixed(
                2
              )}
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
                  {parseFloat(product?.price?.replace("$", "") ?? "0").toFixed(
                    2
                  )}
                </span>
              </>
            )}
          </>
        )}
      </p>
    </a>
  );
});
