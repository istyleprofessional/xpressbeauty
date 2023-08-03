import { component$ } from "@builder.io/qwik";
import { Rating } from "~/components/shared/rating/rating";

interface ProductMainInfoProps {
  product_name: string;
  price: string;
  isVariant: boolean;
  sale_price?: string;
}

export const ProductMainInfo = component$((props: ProductMainInfoProps) => {
  const { product_name, price, sale_price, isVariant } = props;

  return (
    <div class="flex flex-col gap-10">
      <h1 class="text-4xl font-bold text-black">{product_name}</h1>
      <Rating />
      <h2 class="flex flex-row gap-2 text-3xl">
        {sale_price ? (
          <>
            <span class="text-error">CA$ {sale_price}</span> -{" "}
            <span class="text-black">
              CA$ <del>{price}</del>
            </span>
          </>
        ) : (
          <>
            {price.includes("-") && isVariant ? (
              <span class="text-black">
                CA$ {price.replace("$", "").split("-")[0]} - CA${" "}
                {price.replace("$", "").split("-")[1]}
              </span>
            ) : (
              <span class="text-black">CA$ {price.replace("$", "")}</span>
            )}
          </>
        )}
      </h2>
    </div>
  );
});
