import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { ProductModel } from "~/models/product.model";
import { Image } from "@unpic/qwik";
import { UserContext } from "~/context/user.context";

interface ProductCardProps {
  product: ProductModel;
  i: number;
  cardSize?: string;
  currencyObject?: any;
}

export const ProductCard = component$((props: ProductCardProps) => {
  const { product, i, cardSize, currencyObject } = props;
  const finalRegularPrice = useSignal<string>("");
  const verifiedPrice = useSignal<string>("");
  const verifiedSalePrice = useSignal<string>("");
  const userObj: any = useContext(UserContext);
  const user = userObj?.user ?? {};

  useVisibleTask$(
    ({ track }) => {
      track(() => currencyObject?.country);
      if (currencyObject?.country === "1") {
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

  useVisibleTask$(({ track }) => {
    track(() => product);
    if (product.priceType === "range") {
      if (product.price.min !== "" && product.price.max !== "") {
        finalRegularPrice.value = `${parseFloat(
          product.price?.min
        ).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject?.country === "1" ? "USD" : "CAD",
        })} - ${parseFloat(product.price.max).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject?.country === "1" ? "USD" : "CAD",
        })}`;
        verifiedPrice.value = `${(
          parseFloat(product.price.min) -
          parseFloat(product.price.min) * 0.2
        ).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject?.country === "1" ? "USD" : "CAD",
        })} - ${(
          parseFloat(product.price.max) -
          parseFloat(product.price.max) * 0.2
        ).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject?.country === "1" ? "USD" : "CAD",
        })}`;
      }
    } else {
      finalRegularPrice.value = parseFloat(
        product.price?.regular
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: currencyObject?.country === "1" ? "USD" : "CAD",
      });
      verifiedPrice.value = (
        parseFloat(product.price?.regular) -
        parseFloat(product.price?.regular) * 0.2
      ).toLocaleString("en-US", {
        style: "currency",
        currency: currencyObject?.country === "1" ? "USD" : "CAD",
      });
      verifiedSalePrice.value = (
        parseFloat(product.sale_price?.sale) -
        parseFloat(product.sale_price?.sale) * 0.2
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: currencyObject?.country === "1" ? "USD" : "CAD",
      });
    }
  });

  return (
    <a
      class={`btn btn-ghost flex flex-row lg:flex-col ${
        cardSize === "sm" ? "lg:w-96 lg:h-96" : "lg:w-96 lg:h-96"
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
        src={(product.imgs ?? [])[0]}
        onError$={(e: any) => {
          e.target.src = "/placeholder.webp";
        }}
        alt={product.product_name}
        class={`${
          cardSize === "sm" ? "lg:w-52 lg:h-52" : "lg:w-52 lg:h-52"
        } w-24 h-24 object-contain`}
        itemProp="image"
      />
      <div class="p-0 m-0 flex flex-col items-left gap-3 w-full">
        <h2
          class={`overflow-hidden truncate ${
            cardSize === "sm" ? "lg:text-lg" : "lg:text-lg"
          } text-sm text-black`}
          itemProp="name"
        >
          {product.product_name}
        </h2>
        <div class="flex flex-col gap-2">
          <p
            class={`${
              cardSize === "sm" ? "lg:text-lg" : "lg:text-lg"
            } text-xs text-black font-semibold`}
          >
            {product.priceType === "single" &&
              product.sale_price.sale !== "" && (
                <>
                  <span class="text-lg text-neutral-800">
                    {!(user.isEmailVerified && user.isPhoneVerified)
                      ? finalRegularPrice.value
                      : verifiedSalePrice.value}
                  </span>
                </>
              )}
            {product.priceType === "single" &&
              product.sale_price.sale === "" && (
                <span class="text-lg text-neutral-800">
                  {!(user.isEmailVerified && user.isPhoneVerified)
                    ? finalRegularPrice.value
                    : verifiedPrice.value}
                </span>
              )}
            {product.priceType === "range" && (
              <span class="text-lg text-neutral-800">
                {!(user.isEmailVerified && user.isPhoneVerified)
                  ? finalRegularPrice.value
                  : verifiedPrice.value}
              </span>
            )}
          </p>
          {!(user.isEmailVerified && user.isPhoneVerified) && (
            <>
              <label class=" bg-warning w-full text-center rounded-md">
                <span class="text-xs md:text-sm text-gray-500 text-center font-bold text-black p-1 normal-case">
                  Saver Club
                </span>
              </label>

              <div class="flex flex-row gap-2 justify-center">
                <div class="flex flex-col gap-1">
                  <h2 class="flex flex-row gap-2">
                    {product.priceType === "single" &&
                      product?.sale_price?.sale !== "" && (
                        <>
                          <span class="text-error" itemProp="price">
                            {verifiedSalePrice.value}
                          </span>
                        </>
                      )}
                    {product?.priceType === "single" &&
                      product?.sale_price?.sale === "" && (
                        <span
                          class="text-error text-sm lg:text-lg"
                          itemProp="price"
                        >
                          {verifiedPrice.value}
                        </span>
                      )}
                    {product?.priceType === "range" && (
                      <div class="flex flex-col gap-2">
                        <span
                          class="text-error text-sm lg:text-lg"
                          itemProp="price"
                        >
                          {verifiedPrice.value}
                        </span>
                      </div>
                    )}
                  </h2>
                </div>
              </div>
            </>
          )}
          {user.isEmailVerified && user.isPhoneVerified && (
            <p class="text-xs text-gray-500 text-center font-bold text-info p-1 normal-case">
              You are a Saver Club Member
            </p>
          )}
        </div>
      </div>
    </a>
  );
});
