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
import { Image } from "@unpic/qwik";

export const ProductList = component$((props: any) => {
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
      <div class="flex flex-row flex-wrap justify-start gap-3 items-center w-full p-5">
        {context?.cart && (
          <>
            {context?.cart?.products?.map((product: any) => (
              <div class="card w-96 bg-base-100 shadow-xl" key={uuid()}>
                <figure>
                  <Image
                    layout="fill"
                    src={
                      product?.product_img?.includes("http")
                        ? product?.product_img
                        : product?.product_img?.replace(".", "")
                    }
                    onError$={(e: any) => {
                      e.target.src = "/placeholder.webp";
                    }}
                    alt={product?.product_name}
                    class=" object-contain self-center w-32 h-32"
                  />
                </figure>
                <div class="card-body">
                  <h2 class="card-title">
                    {" "}
                    {product.product_name?.includes("CR")
                      ? product.product_name?.replace(/CR.*/, "")
                      : product.product_name}
                  </h2>
                  <p class="text-black text-xs md:text-sm">
                    {product?.variation_name ?? ""}
                  </p>
                  <ItemQuantity
                    product={product}
                    country={props.currencyObject.cur}
                  />
                  <div class="flex flex-col gap-1">
                    <p class="text-black md:text-sm text-xs">
                      {parseFloat(product.price)?.toLocaleString("en-US", {
                        style: "currency",
                        currency:
                          props.currencyObject?.cur === "1" ? "USD" : "CAD",
                      })}
                    </p>
                  </div>
                  <div class="card-actions justify-end">
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
            ))}
          </>
        )}
      </div>
    </>
  );
});
