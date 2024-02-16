import { component$, useContext } from "@builder.io/qwik";
import { CurContext } from "~/context/cur.context";

export interface VariationsProps {
  value: any;
  folder: string;
  variation: any;
  index: number;
  variationQuantity: any;
  variationCheckerLoading?: boolean;
  finalVariationToAdd?: any;
  productId?: string;
  variation_type?: string;
}

export const Variations = component$((props: VariationsProps) => {
  const {
    value,
    folder,
    variation,
    index,
    productId,
    variationQuantity,
    finalVariationToAdd,
    variation_type,
  } = props;
  const currency: any = useContext(CurContext);

  return (
    <div class="flex flex-row w-full justify-center items-center">
      <>
        {variationQuantity !== 0 && (
          <>
            <label class="input-group md:w-96 w-full">
              <span
                class={`btn text-sm md:text-xl text-black bg-[#F4F4F5] ${
                  value[index] === 0 ? "btn-disabled" : ""
                }`}
                onClick$={() => {
                  value[index]--;
                  if (value[index] === 0) {
                    delete finalVariationToAdd.value[index];
                  } else {
                    variation.quantity = value[index];
                    variation.productId = productId;
                    finalVariationToAdd.value[index] = variation;
                  }
                }}
              >
                -
              </span>
              <input
                type="number"
                value={value[index]}
                onChange$={(e: any) => {
                  value[index] = e.target.value;
                }}
                min="0"
                max={variationQuantity.toString()}
                readOnly
                class="input input-bordered w-16 md:w-20 text-black text-xs lg:text-lg"
              />
              <span
                class={`btn text-sm md:text-xl text-black bg-[#F4F4F5] ${
                  variationQuantity === 0 ? "btn-disabled" : ""
                }`}
                onClick$={async () => {
                  if (value[index] === variationQuantity) return;
                  value[index]++;
                  variation.quantity = value[index];
                  variation.productId = productId;
                  finalVariationToAdd.value[index] = variation;
                }}
              >
                +
              </span>
            </label>
          </>
        )}

        {variationQuantity === 0 && (
          <p class="text-error w-full text-xs md:text-lg text-center">
            Out of Stock
          </p>
        )}

        <div class="flex flex-row gap-5 w-full items-center">
          {variation_type === "Color" && (
            <img
              src={folder}
              class="rounded-full"
              alt={variation.variation_name}
              width="60"
              height="60"
            />
          )}

          <p class="text-black w-full justify-self-end text-sm">
            {variation.variation_name}
          </p>
          <p class=" text-orange-900">
            {variation?.sale_price && variation?.sale_price !== "0" ? (
              <span class="line-through">
                {currency.cur === "1"
                  ? (variation?.price * 0.9)?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })
                  : variation?.price?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
              </span>
            ) : (
              <span>
                {currency.cur === "1"
                  ? (variation?.price * 0.9)?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })
                  : variation?.price?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
              </span>
            )}
          </p>
        </div>
      </>
    </div>
  );
});
