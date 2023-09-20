import { component$, useContext } from "@builder.io/qwik";
import { CartContext } from "~/context/cart.context";
import type { ProductModel } from "~/models/product.model";

interface ProductCardProps {
  product: ProductModel;
  i: number;
  cardSize?: string;
}

export const ProductCard = component$((props: ProductCardProps) => {
  const { product, i, cardSize } = props;
  const context: any = useContext(CartContext);

  return (
    <a
      class={`btn btn-ghost flex flex-row lg:flex-col ${
        cardSize === "sm" ? "lg:w-60 lg:h-60" : "lg:w-96 lg:h-96"
      } w-40 h-72 bg-[#FFFFFF] shadow-sm
       shadow-neutral-500 rounded-lg border-2 border-[#D4D4D8] border-solid justify-center items-center`}
      href={`/products/${encodeURIComponent(
        product.product_name
          ?.replace(/[^a-zA-Z ]/g, "")
          .replace(/ /g, "-")
          .toLowerCase() ?? ""
      )}`}
    >
      <img
        key={i}
        src={(product.imgs as string[])[0] ?? "/placeholder.webp"}
        onError$={(e: any) => {
          e.target.src = "/placeholder.webp";
        }}
        alt={product.product_name}
        class={`${
          cardSize === "sm" ? "lg:w-28 lg:h-28" : "lg:w-44 lg:h-44"
        } w-16 h-16 object-contain`}
        itemProp="image"
      />
      <div class="p-0 m-0 flex flex-col items-left gap-3 w-full">
        <h2
          class={`whitespace-normal ${
            cardSize === "sm" ? "lg:text-xs" : "lg:text-lg"
          } text-sm text-black`}
          itemProp="name"
        >
          {product.product_name}
        </h2>
        <div class="flex flex-col gap-2">
          <p
            class={`${
              cardSize === "sm" ? "lg:text-xs" : "lg:text-lg"
            } text-xs text-black font-semibold`}
          >
            {product.priceType === "single" &&
              product.sale_price.sale !== "" && (
                <>
                  <span class="text-xs text-gray-400 line-through">
                    {product?.price?.regular?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </span>
                  <span class="text-xs text-error ml-2">
                    {product?.sale_price?.sale?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </span>
                </>
              )}
            {product.priceType === "single" &&
              product.sale_price.sale === "" && (
                <span class="text-xs text-black">
                  {product?.price?.regular?.toLocaleString("en-US", {
                    style: "currency",
                    currency: "CAD",
                  })}
                </span>
              )}
            {product.priceType === "range" &&
              product.sale_price.min === "" &&
              product.sale_price.max === "" && (
                <span class="text-xs text-black">
                  {product?.price?.min?.toLocaleString("en-US", {
                    style: "currency",
                    currency: "CAD",
                  })}{" "}
                  -{" "}
                  {product?.price?.max?.toLocaleString("en-US", {
                    style: "currency",
                    currency: "CAD",
                  })}
                </span>
              )}
            {product.priceType === "range" &&
              product.sale_price.min !== "" &&
              product.sale_price.max !== "" && (
                <div class="flex flex-col gap-2">
                  <span class="text-xs text-gray-400 line-through">
                    {product?.sale_price?.min?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}{" "}
                    -{" "}
                    {product?.sale_price?.max?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </span>
                  <span class="text-xs text-error">
                    {product?.sale_price?.min?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}{" "}
                    -{" "}
                    {product?.sale_price?.max?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </span>
                </div>
              )}
          </p>
          {context.isVerified && (
            <span class="text-xs text-error">+20% off</span>
          )}
        </div>
      </div>
    </a>
  );
});
