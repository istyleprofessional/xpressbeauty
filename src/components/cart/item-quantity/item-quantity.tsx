import { component$, $, useContext, useSignal } from "@builder.io/qwik";
import { CartContext } from "~/context/cart.context";
import type { ProductModel } from "~/models/product.model";
import { putRequest } from "~/utils/fetch.utils";

interface ItemQuantityProps {
  product: ProductModel;
}

export const ItemQuantity = component$((props: ItemQuantityProps) => {
  const { product } = props;
  const context: any = useContext(CartContext);
  const quantity = useSignal<number>(product.quantity ?? 0);

  const handleOnQuantitydec = $(async () => {
    quantity.value = quantity.value - 1;
    context.cart.totalQuantity = context.cart.totalQuantity - 1;
    product.quantity = quantity.value;
    const data = {
      product: product,
      totalQuantity: context.cart.totalQuantity,
    };
    const request = await putRequest("/api/cart", JSON.stringify(data));
    const response = await request.json();
    context.cart.products = response.products;
    context.cart.totalQuantity = response.totalQuantity;
    const totalPrice = response?.products?.reduce(
      (acc: number, curr: any) => acc + curr.price * curr.quantity,
      0
    );
    context.cart.totalPrice = totalPrice;
  });

  const handleOnQuantityInc = $(async () => {
    quantity.value = quantity.value + 1;
    context.cart.totalQuantity = context.cart.totalQuantity + 1;
    product.quantity = quantity.value;
    const data = {
      product: product,
      totalQuantity: context.cart.totalQuantity,
    };
    const request = await putRequest("/api/cart", JSON.stringify(data));
    const response = await request.json();
    context.cart.products = response.products;
    context.cart.totalQuantity = response.totalQuantity;
    const totalPrice = response?.products?.reduce(
      (acc: number, curr: any) => acc + curr.price * curr.quantity,
      0
    );
    context.cart.totalPrice = totalPrice;
  });

  return (
    <label class="input-group input-group-xs md:input-group-sm w-fit">
      <span
        class={`btn btn-sm md:btn-sm text-sm md:text-xl text-black bg-[#F4F4F5] ${
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
        max={20}
        class="input input-sm input-bordered w-14 text-black"
      />
      <span
        class={`btn btn-sm text-sm md:btn-sm text-black bg-[#F4F4F5]`}
        onClick$={handleOnQuantityInc}
      >
        +
      </span>
    </label>
  );
});
