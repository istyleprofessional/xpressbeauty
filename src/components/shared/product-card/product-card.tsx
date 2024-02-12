import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { ProductModel } from "~/models/product.model";
import { Image } from "@unpic/qwik";

interface ProductCardProps {
  product: ProductModel;
  i: number;
  cardSize?: string;
  userObj?: any;
  currencyObject?: any;
}

export const ProductCard = component$((props: ProductCardProps) => {
  const { product, i, cardSize, currencyObject } = props;
  const finalRegularPrice = useSignal<string>("");
  const verifiedPrice = useSignal<string>("");
  const verifiedSalePrice = useSignal<string>("");

  useVisibleTask$(
    ({ track }) => {
      track(() => currencyObject);
      if (currencyObject === "1") {
        if (product.priceType === "range") {
          product.price.min = parseFloat(product?.price?.min?.toString()) * 0.9;

          product.price.max = parseFloat(product.price?.max?.toString()) * 0.9;
        } else {
          product.price.regular =
            parseFloat(product.price?.regular?.toString()) * 0.9;
          product.sale_price.sale = isNaN(
            parseFloat(product?.sale_price?.sale?.toString()) * 0.9
          )
            ? ""
            : parseFloat(product?.sale_price?.sale?.toString()) * 0.9;
        }
      }
    },
    { strategy: "intersection-observer" }
  );

  useVisibleTask$(() => {
    if (product.priceType === "range") {
      if (product.price.min !== "" && product.price.max !== "") {
        finalRegularPrice.value = `${parseFloat(
          product.price?.min
        ).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        })} - ${parseFloat(product.price.max).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        })}`;
        verifiedPrice.value = `${(
          parseFloat(product.price.min) -
          parseFloat(product.price.min) * 0.2
        ).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        })} - ${(
          parseFloat(product.price.max) -
          parseFloat(product.price.max) * 0.2
        ).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        })}`;
      }
    } else {
      finalRegularPrice.value = parseFloat(
        product.price?.regular
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: currencyObject === "1" ? "USD" : "CAD",
      });
      verifiedPrice.value = (
        parseFloat(product.price?.regular) -
        parseFloat(product.price?.regular) * 0.2
      ).toLocaleString("en-US", {
        style: "currency",
        currency: currencyObject === "1" ? "USD" : "CAD",
      });
      verifiedSalePrice.value = (
        parseFloat(product.sale_price?.sale) -
        parseFloat(product.sale_price?.sale) * 0.2
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: currencyObject === "1" ? "USD" : "CAD",
      });
    }
  });

  return (
    <a
      class={`btn btn-ghost grid grid-rows-4 justify-items-center items-center ${cardSize === "sm" ? "lg:w-72 lg:h-72" : "lg:w-96 lg:h-96"
        } w-40 h-72 bg-[#FFFFFF] shadow-sm
       shadow-neutral-500 rounded-lg border-2 border-[#D4D4D8] border-solid justify-center items-center normal-case`}
      href={`/products/${encodeURIComponent(
        product.product_name
          ?.replace(/[^a-zA-Z0-9 ]/g, "") // Exclude numbers from removal
          .replace(/ /g, "-")
          .toLowerCase() ?? ""
      )}-pid-${product._id}/`}
    >
      <Image
        layout="constrained"
        key={i}
        src={((product.imgs ?? [])[0]).includes("http") ? (product.imgs ?? [])[0] : (product.imgs ?? [])[0].replace(".", "")}
        onError$={(e: any) => {
          e.target.src = "/placeholder.webp";
        }}
        alt={product.product_name}
        class={`${cardSize === "sm" ? "lg:w-32 lg:h-32" : " lg:w-44 lg:h-44"
          } w-32 h-32 object-contain row-span-2 bg-white rounded-lg`}
        itemProp="image"
      />
      <h2
        class={`overflow-hidden truncate ${cardSize === "sm" ? "lg:text-base" : "lg:text-lg"
          } text-sm text-black whitespace-normal font-semibold pt-5 text-center`}
        itemProp="name"
      >
        {product.product_name}
      </h2>
      <div class="flex flex-col gap-2">
        <p
          class={`text-sm text-gray-500 font-semibold ${cardSize === "sm" ? "lg:text-base" : "lg:text-lg"
            }`}
        >
          {product.priceType === "single" && (
            <span class=" text-gray-600">{finalRegularPrice.value}</span>
          )}
          {product.priceType === "range" && (
            <span class=" text-gray-600">{finalRegularPrice.value}</span>
          )}
        </p>
      </div>
    </a>
  );
});
