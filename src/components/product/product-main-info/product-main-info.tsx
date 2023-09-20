import { component$ } from "@builder.io/qwik";
import { Rating } from "~/components/shared/rating/rating";

interface ProductMainInfoProps {
  product_name: string;
  price: any;
  isVariant: boolean;
  sale_price?: any;
  isVerified?: boolean;
  priceType?: string;
  ratings?: any;
}

export const ProductMainInfo = component$((props: ProductMainInfoProps) => {
  const { product_name, price, sale_price, isVerified, priceType, ratings } =
    props;

  return (
    <div class="flex flex-col gap-10">
      <h1 class="text-xl md:text-4xl font-bold text-black" itemProp="name">
        {product_name}
      </h1>
      <Rating ratings={ratings?.result?.ratings ?? []} />
      <h2 class="flex flex-row gap-2 text-xl lg:text-3xl">
        {priceType === "single" && sale_price.sale !== "" && (
          <>
            <span class="text-gray-400 line-through" itemProp="price">
              {price.regular.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </span>
            <span class="text-error ml-2" itemProp="price">
              {parseFloat(sale_price.sale.toString()).toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </span>
          </>
        )}
        {priceType === "single" && sale_price.sale === "" && (
          <span class="text-black" itemProp="price">
            {price.regular.toLocaleString("en-US", {
              style: "currency",
              currency: "CAD",
            })}
          </span>
        )}
        {priceType === "range" &&
          sale_price.min === "" &&
          sale_price.max === "" && (
            <span class="text-black" itemProp="price">
              {price.min.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}{" "}
              -{" "}
              {price.max.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </span>
          )}
        {priceType === "range" &&
          sale_price.min !== "" &&
          sale_price.max !== "" && (
            <div class="flex flex-col gap-2">
              <span class="text-gray-400 line-through" itemProp="price">
                {sale_price.min.toLocaleString("en-US", {
                  style: "currency",
                  currency: "CAD",
                })}{" "}
                -{" "}
                {sale_price.max.toLocaleString("en-US", {
                  style: "currency",
                  currency: "CAD",
                })}
              </span>
              <span class="text-error" itemProp="price">
                {sale_price.min.toLocaleString("en-US", {
                  style: "currency",
                  currency: "CAD",
                })}{" "}
                -{" "}
                {sale_price.max.toLocaleString("en-US", {
                  style: "currency",
                  currency: "CAD",
                })}
              </span>
            </div>
          )}
      </h2>
      {isVerified && <p class="text-sm text-error font-bold">+20% off</p>}
    </div>
  );
});
