import {
  component$,
  useContext,
  useSignal,
  useTask$,
  $,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { TrashIcon } from "~/components/shared/icons/icons";
import { CartContext } from "~/context/cart.context";
import { ItemQuantity } from "../item-quantity/item-quantity";
import { deleteRequest } from "~/utils/fetch.utils";
import { uuid } from "~/utils/uuid";

export const ProductList = component$(() => {
  const currentQuantityValue = useStore<any>({});
  const context: any = useContext(CartContext);
  const totalQuantity = useSignal<number>(0);

  const handleDeleteItemClick = $(async (product: any) => {
    const request = await deleteRequest(`/api/cart/`, JSON.stringify(product));
    const response = await request.json();
    context.cart.products = response.products;
    context.cart.totalQuantity = response.totalQuantity;
    const totalPrice = response?.products?.reduce(
      (acc: number, curr: any) => acc + curr.price * curr.quantity,
      0
    );
    context.cart.totalPrice = totalPrice;
  });

  useVisibleTask$(({ track }) => {
    track(() => context?.cart?.products);
    totalQuantity.value = context?.cart?.totalQuantity;
  });

  useTask$(() => {
    if (context?.cart?.products) {
      Object.keys(context?.cart?.products).map((key: any) => {
        currentQuantityValue[key] = context?.cart?.products[key]?.quantity;
      });
    }
  });

  return (
    <>
      <div class="pl-6 flex flex-col gap-4">
        <p class="text-black font-semibold text-sm md:text-base">
          Shopping cart
        </p>
        <p class="text-black text-xs md:text-base">
          {context?.cart && context?.cart?.totalQuantity > 0
            ? `You have ${context?.cart?.totalQuantity} item in your cart`
            : "You have 0 item in your cart"}
        </p>
      </div>
      {context?.cart && (
        <>
          {context?.cart?.products?.map((product: any) => (
            <div
              class="flex justify-center items-center w-full lg:justify-start"
              key={uuid()}
            >
              <div
                class="flex flex-row gap-1 md:gap-5 justify-center lg:justify-start items-center w-fit h-fit lg:w-[60%] bg-white border-2
                                border-solid border-[#E0E0E0] rounded-lg"
                key={uuid()}
              >
                <a
                  href={`/products/${encodeURIComponent(
                    product.product_name
                      ?.replace(/[^a-zA-Z ]/g, "")
                      .replace(/ /g, "-")
                      .toLowerCase() ?? ""
                  )}`}
                >
                  <img
                    src={product?.product_img}
                    alt={product?.product_name}
                    class="w-12 h-12 md:w-32 md:h-32 object-contain lg:p-5"
                  />
                </a>
                <div class="flex flex-col">
                  <h2 class="text-black text-xs md:text-sm w-20 overflow-ellipsis whitespace-nowrap overflow-hidden">
                    {product?.product_name}
                  </h2>
                  <p class="text-black text-xs">
                    {product?.variation_name ?? ""}
                  </p>
                </div>

                <ItemQuantity product={product} />
                <p class="text-black md:text-sm text-xs">
                  CA$ {parseFloat(product?.price.replace("$", "")).toFixed(2)}
                </p>
                {context.isVerified && (
                  <p class="text-xs md:text-sm font-bold text-[red]">
                    +20% off
                  </p>
                )}

                <button
                  class="btn text-[#CC0000] m-2 ml-auto"
                  onClick$={() => {
                    handleDeleteItemClick(product);
                  }}
                >
                  <TrashIcon classes="md:w-5 md:h-5 w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
});
