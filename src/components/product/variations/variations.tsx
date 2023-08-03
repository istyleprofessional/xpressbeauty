import { component$ } from "@builder.io/qwik";

export interface VariationsProps {
  variationType: string;
  value: any;
  folder: string;
  variation: any;
  index: number;
  variationQuantity: any;
  variationCheckerLoading?: boolean;
  finalVariationToAdd?: any;
  productId?: string;
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
    variationType,
  } = props;

  return (
    <div class="flex flex-row w-full justify-center">
      <label class="input-group w-96">
        <span
          class={`btn text-xl text-black bg-[#F4F4F5] ${
            variationQuantity[index] === 0 ? "btn-disabled" : ""
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
          max={variationQuantity}
          readOnly
          class="input input-bordered w-20 text-black"
        />
        <span
          class={`btn text-xl text-black bg-[#F4F4F5] ${
            variationQuantity[index] === 0 ? "btn-disabled" : ""
          }`}
          onClick$={async () => {
            value[index]++;
            variation.quantity = value[index];
            variation.productId = productId;
            finalVariationToAdd.value[index] = variation;
          }}
        >
          +
        </span>
      </label>

      <div class="flex flex-row gap-5 w-full items-center">
        {variationType === "Color" && (
          <img
            src={folder}
            class="rounded-full"
            alt={variation.variation_name}
          />
        )}
        <h1 class="text-black w-full justify-self-end">
          {variation.variation_name}
        </h1>
      </div>
    </div>
  );
});
