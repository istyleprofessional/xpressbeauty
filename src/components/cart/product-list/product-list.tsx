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
      <div class="flex flex-row flex-wrap justify-start gap-3 items-center w-full">
        {context?.cart && (
          <>
            {context?.cart?.products?.map((product: any) => (
              <div
                class="flex flex-row justify-center items-center w-full h-fit lg:w-96 lg:h-96 bg-white border-2
                                border-solid border-[#E0E0E0] rounded-lg"
                key={uuid()}
              >
                <div class="flex flex-col gap-2 w-full p-5 ">
                  <a
                    href={`/products/${encodeURIComponent(
                      product.product_name
                        ?.replace(/[^a-zA-Z0-9 ]/g, "") // Exclude numbers from removal
                        .replace(/ /g, "-")
                        .toLowerCase() ?? ""
                    )}`}
                    class="w-full h-44"
                  >
                    <img
                      src={product?.product_img}
                      alt={product?.product_name}
                      class=" object-contain self-center w-full h-full"
                    />
                  </a>
                  <div class="flex flex-row gap-3 w-full justify-center items-center">
                    <div class="flex flex-col gap-3 w-full justify-center items-center">
                      <h2 class="text-black text-sm md:text-md">
                        {product?.product_name}
                      </h2>
                      <p class="text-black text-xs md:text-sm">
                        {product?.variation_name ?? ""}
                      </p>
                      <ItemQuantity product={product} />
                      <div class="flex flex-row w-full justify-center items-center">
                        <div class="flex flex-col gap-1">
                          <p class="text-black md:text-sm text-xs">
                            CA${" "}
                            {parseFloat(
                              product?.price.replace("$", "")
                            ).toFixed(2)}
                          </p>
                          {context.isVerified && (
                            <p class="text-xs md:text-sm font-bold text-[red]">
                              +20% off
                            </p>
                          )}
                        </div>
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
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
});
