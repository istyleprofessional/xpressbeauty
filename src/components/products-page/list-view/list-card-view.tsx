import { component$, useContext } from "@builder.io/qwik";
import { CartContext } from "~/context/cart.context";
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
  const context: any = useContext(CartContext);

  return (
    <a
      class={`btn btn-ghost grid grid-cols-4 gap-2 w-full h-40 bg-[#FAFAFA] rounded-lg border-2 border-[#D4D4D8] border-solid justify-center
         items-center`}
      href={`/products/${encodeURIComponent(
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
        {product.priceType === "single" && product?.sale_price?.sale !== "" && (
          <>
            <span class="text-xs text-gray-400 line-through">
              {product.price.regular.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </span>
            <span class="text-sm text-error ml-2">
              {product.sale_price?.sale?.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </span>
          </>
        )}
        {product.priceType === "single" && product.sale_price?.sale === "" && (
          <span class="text-sm text-black">
            {product.price.regular.toLocaleString("en-US", {
              style: "currency",
              currency: "CAD",
            })}
          </span>
        )}
        {product.priceType === "range" &&
          product.sale_price.min === "" &&
          product.sale_price.max === "" && (
            <span class="text-sm text-black">
              {product.price.min.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}{" "}
              -{" "}
              {product.price.max.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </span>
          )}
        {product.priceType === "range" &&
          product.sale_price.min !== "" &&
          product.sale_price.max !== "" && (
            <div class="flex flex-col gap-2">
              <span class="text-sm text-gray-400 line-through">
                {product.sale_price.min.toLocaleString("en-US", {
                  style: "currency",
                  currency: "CAD",
                })}{" "}
                -{" "}
                {product.sale_price.max.toLocaleString("en-US", {
                  style: "currency",
                  currency: "CAD",
                })}
              </span>
              <span class="text-sm text-error">
                {product.sale_price.min.toLocaleString("en-US", {
                  style: "currency",
                  currency: "CAD",
                })}{" "}
                -{" "}
                {product.sale_price.max.toLocaleString("en-US", {
                  style: "currency",
                  currency: "CAD",
                })}
              </span>
            </div>
          )}{" "}
        {context.isVerified && <span class="text-sm text-error">+20% off</span>}
      </p>
    </a>
  );
});
