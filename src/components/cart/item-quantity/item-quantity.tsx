import { component$, $, useContext, useSignal } from "@builder.io/qwik";
import { CartContext } from "~/context/cart.context";
import { putRequest } from "~/utils/fetch.utils";

interface ItemQuantityProps {
  productQuantity: number;
  productId: string;
  isVariation?: boolean;
  variationIndex?: number;
}

export const ItemQuantity = component$((props: ItemQuantityProps) => {
  const { productQuantity, productId, isVariation, variationIndex } = props;
  const context: any = useContext(CartContext);
  const quantity = useSignal<number>(productQuantity);

  const handleOnQuantitydec = $(async () => {
    quantity.value = quantity.value - 1;
    const req = {
      isVariation: isVariation,
      variationIndex: variationIndex,
      productId: productId,
      quantity: -1,
    };
    await putRequest("/api/cart", JSON.stringify(req));
    location.reload();
  });

  const handleOnQuantityInc = $(async () => {
    quantity.value = quantity.value + 1;
    const req = {
      isVariation: isVariation,
      variationIndex: variationIndex,
      productId: productId,
      quantity: +1,
    };
    await putRequest("/api/cart", JSON.stringify(req));
    location.reload();
  });

  return (
    <label class="input-group w-44">
      <span
        class={`btn text-xl text-black bg-[#F4F4F5] ${
          quantity.value === 0 ? "btn-disabled" : ""
        }`}
        onClick$={handleOnQuantitydec}
      >
        -
      </span>
      <input
        type="number"
        value={quantity.value}
        readOnly
        min="0"
        max={
          !isVariation
            ? parseInt(context?.cart?.products[productId]?.quantityInStock)
            : 100
        }
        class="input input-bordered w-20 text-black"
      />
      <span
        class={`btn text-xl text-black bg-[#F4F4F5] ${
          quantity.value ===
          parseInt(context?.cart?.products[productId]?.quantityInStock)
            ? "btn-disabled"
            : ""
        }`}
        onClick$={handleOnQuantityInc}
      >
        +
      </span>
    </label>
  );
});
