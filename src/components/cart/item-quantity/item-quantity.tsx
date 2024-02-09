import { component$, $, useContext, useSignal } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { CartContext } from "~/context/cart.context";
import { getTotalQuantityService } from "~/express/services/product.service";
import type { ProductModel } from "~/models/product.model";
import { putRequest } from "~/utils/fetch.utils";

interface ItemQuantityProps {
  product: ProductModel;
  country?: string;
}

export const getTotalQuantity = server$(async (id: string, desiredQuantity) => {
  const isVariant = id.includes(".");
  const getTotalOnHand = await getTotalQuantityService(id, isVariant);
  if (getTotalOnHand.status === "failed") return false;
  if (desiredQuantity > getTotalOnHand.result) {
    return false;
  } else {
    return true;
  }
});

export const ItemQuantity = component$((props: ItemQuantityProps) => {
  const { product, country } = props;
  const context: any = useContext(CartContext);
  const quantity = useSignal<number>(product.quantity ?? 0);

  const handleOnQuantitydec = $(async () => {
    const checkTotalQuantity = await getTotalQuantity(
      product.id ?? "",
      quantity.value - 1
    );
    if (!checkTotalQuantity) return;
    quantity.value = quantity.value - 1;
    context.cart.totalQuantity = context.cart.totalQuantity - 1;
    product.quantity = quantity.value;
    if (product.currency === "CAD" && country === "1") {
      product.price = product.price * 0.9;
    } else if (product.currency === "USD" && country === "2") {
      product.price = product.price * 1.1;
    }
    product.currency = country === "2" ? "CAD" : "USD";
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
    let shipping = 15;
    if (totalPrice > 80 && totalPrice < 100) {
      shipping = shipping - shipping * 0.3;
    }

    if (totalPrice > 100 && totalPrice < 150) {
      shipping = shipping - shipping * 0.5;
    }

    if (totalPrice > 150 && totalPrice < 200) {
      shipping = shipping - shipping * 0.7;
    }

    if (totalPrice > 200) {
      shipping = 0;
    }
    context.cart.shipping = shipping;
    context.cart.totalPrice = totalPrice;
  });

  const handleOnQuantityInc = $(async () => {
    const checkTotalQuantity = await getTotalQuantity(
      product.id ?? "",
      quantity.value + 1
    );
    if (!checkTotalQuantity) return;
    quantity.value = quantity.value + 1;
    context.cart.totalQuantity = context.cart.totalQuantity + 1;
    product.quantity = quantity.value;
    if (product.currency === "CAD" && country === "1") {
      product.price = product.price * 0.9;
    } else if (product.currency === "USD" && country === "2") {
      product.price = product.price / 0.9;
    }
    product.currency = country === "2" ? "CAD" : "USD";
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
    let shipping = 15;
    if (totalPrice > 80 && totalPrice < 100) {
      shipping = shipping - shipping * 0.3;
    }

    if (totalPrice > 100 && totalPrice < 150) {
      shipping = shipping - shipping * 0.5;
    }

    if (totalPrice > 150 && totalPrice < 200) {
      shipping = shipping - shipping * 0.7;
    }

    if (totalPrice > 200) {
      shipping = 0;
    }
    console.log("shipping", shipping);
    context.cart.shipping = shipping;
    context.cart.totalPrice = totalPrice;
  });

  return (
    <div class="flex flex-row items-center justify-center w-full">
      <label class="input-group input-group-xs md:input-group-lg w-44 flex flex-row gap-2">
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
          max={product.quantity_on_hand}
          class="input input-sm input-bordered w-full text-black"
        />
        <span
          class={`btn btn-sm text-sm md:btn-sm text-black bg-[#F4F4F5]`}
          onClick$={handleOnQuantityInc}
        >
          +
        </span>
      </label>
    </div>
  );
});
