import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import { Rating } from "~/components/shared/rating/rating";

interface ProductMainInfoProps {
  product_name: string;
  price: any;
  isVariant: boolean;
  sale_price?: any;
  isVerified?: boolean;
  priceType?: string;
  ratings?: any;
  companyName?: any;
  currencyObject?: any;
  categories?: any;
}

export const ProductMainInfo = component$((props: ProductMainInfoProps) => {
  const {
    currencyObject,
    product_name,
    price,
    sale_price,
    priceType,
    ratings,
    companyName,
  } = props;
  const finalRegularPrice = useSignal<string>("");
  const salePrice = useSignal<string>("");

  useTask$(() => {
    if (priceType === "range") {
      if (price.min !== "" && price.max !== "") {
        finalRegularPrice.value = `${parseFloat(price.min).toLocaleString(
          "en-US",
          {
            style: "currency",
            currency: currencyObject === "1" ? "USD" : "CAD",
          }
        )} - ${parseFloat(price.max).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        })}`;
      }
    } else {
      finalRegularPrice.value = parseFloat(price?.regular)?.toLocaleString(
        "en-US",
        {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        }
      );
      salePrice.value = parseFloat(sale_price?.sale)?.toLocaleString("en-US", {
        style: "currency",
        currency: currencyObject === "1" ? "USD" : "CAD",
      });
    }
  });
  // console.log("product", sale_price);
  return (
    <div class="flex flex-col gap-10">
      <div class="flex flex-col gap-3">
        <h1 class="text-xl md:text-4xl font-bold text-black" itemProp="name">
          {product_name}
        </h1>
        {companyName.name && companyName.name !== "" && (
          <div
            itemProp="brand"
            itemScope
            itemType="http://schema.org/Brand"
            id={`brand-${companyName.name.replace(/ /g, "-")}`}
          >
            <h2 class="text-black text-lg md:text-2xl" itemProp="name">
              {companyName.name}
            </h2>
          </div>
        )}
      </div>
      {ratings?.result?.ratings?.length > 0 && (
        <Rating ratings={ratings?.result?.ratings ?? []} />
      )}

      <div class="flex flex-col gap-3 ">
        <h2 class="flex flex-row gap-2 text-xl lg:text-3xl text-black">
          {priceType === "single" && sale_price?.sale !== "" && (
            <>
              <span class="text-black line-through" itemProp="price">
                {finalRegularPrice.value}
              </span>
              <span class=" text-red-600" itemProp="price">
                {salePrice.value}
              </span>
            </>
          )}
          {priceType === "single" && sale_price?.sale === "" && (
            <span class="text-black" itemProp="price">
              {finalRegularPrice.value}
            </span>
          )}
          {priceType === "range" && (
            <span class="text-black" itemProp="price">
              {finalRegularPrice.value}
            </span>
          )}
        </h2>

        <div id="afterpay-clearpay-message"> </div>
      </div>
    </div>
  );
});
