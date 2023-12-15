import {
  component$,
  useContext,
  useSignal,
  useTask$,
  // useVisibleTask$,
} from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { NextArrowIconNoStick } from "~/components/shared/icons/icons";
import { CartContext } from "~/context/cart.context";
import { UserContext } from "~/context/user.context";
import productSchema from "~/express/schemas/product.schema";

export const checkCatServer = server$(async function (products: any) {
  for (const prod of products) {
    if (prod.id.includes(".")) continue;
    const req = await productSchema.find({ _id: prod.id });
    if (req.length !== 0) {
      const cat = req[0].categories;
      if (
        cat[0].name.includes("Trimmers") ||
        cat[0].name.includes("Clippers")
      ) {
        return true;
      }
    }
  }
});

export const CartDetails = component$((props: any) => {
  const cartContext: any = useContext(CartContext);
  const userContext: any = useContext(UserContext);
  const subTotal = useSignal<number>(0);
  const total = useSignal<number>(0);
  const shipping = useSignal<number>(0);

  const symbol = useSignal<string>("CAD");

  useTask$(async ({ track }) => {
    track(() => cartContext?.cart?.totalPrice);
    track(() => props?.currencyObject.cur);

    subTotal.value = cartContext?.cart?.totalPrice;
    const checker = await checkCatServer(cartContext?.cart?.products);
    if (checker) {
      shipping.value = 0.0;
    } else if (subTotal.value > 200) {
      shipping.value = 0.0;
    } else {
      shipping.value = 15;
    }
    total.value = subTotal.value + shipping.value;
    if (props?.currencyObject?.cur === "1") {
      symbol.value = "USD";
    } else {
      symbol.value = "CAD";
    }
  });

  return (
    <>
      <h2 class="text-white text-xl font-semibold">Order Details</h2>
      <div class="flex flex-col gap-5 justify-center">
        <div class="grid grid-cols-2 w-full">
          <p class="text-white text-xs font-light">Subtotal</p>
          <p class="justify-self-end text-white text-sm font-light">
            {subTotal?.value &&
              subTotal?.value?.toLocaleString("en-US", {
                style: "currency",
                currency: symbol.value,
              })}
          </p>
        </div>
        <div class="grid grid-cols-2 w-full">
          <p class="text-white text-xs font-light">HST</p>
          <p class="justify-self-end text-white text-xs font-light w-full">
            Continue To Calculate Tax...
          </p>
        </div>
        <div class="grid grid-cols-2 w-full">
          <p class="text-white text-xs font-light">Shipping</p>
          <p class="justify-self-end text-white text-sm font-light">
            {shipping.value &&
              shipping.value.toLocaleString("en-US", {
                style: "currency",
                currency: symbol.value,
              })}
          </p>
        </div>
        <div class="grid grid-cols-2 w-full">
          <p class="text-white text-xs font-light">Total (Tax incl.)</p>
          <p class="justify-self-end text-white text-sm font-light">
            {total.value &&
              total.value?.toLocaleString("en-US", {
                style: "currency",
                currency: symbol.value,
              })}
          </p>
        </div>
      </div>
      {userContext?.user?.email ? (
        <a
          class={`btn text-black  normal-case ${
            cartContext?.cart?.products &&
            cartContext?.cart?.products.length === 0
              ? "disabled"
              : ""
          }`}
          href="/checkout"
        >
          Checkout <NextArrowIconNoStick color="black" width="10%" />
        </a>
      ) : (
        <>
          <a
            class={`btn bg-emerald-600 text-white hover:bg-emerald-900  normal-case ${
              cartContext?.cart?.products &&
              cartContext?.cart?.products.length === 0
                ? "disabled"
                : ""
            }`}
            href="/login"
          >
            Login or Register
          </a>
          <div class="divider text-white"></div>
          <div
            class="bg-red-100 border border-red-400 text-white px-4 py-3 rounded relative"
            role="alert"
          >
            <p class="text-sm">
              Please note: If you proceed with guest checkout, you will receive
              order notifications by email only. Tracking information will not
              be available for guest orders. If you would like to track your
              order and enjoy other benefits, we recommend logging in or
              creating an account.
            </p>
          </div>

          <a
            class={`btn text-black  normal-case ${
              cartContext?.cart?.products &&
              cartContext?.cart?.products.length === 0
                ? "disabled"
                : ""
            }`}
            href="/checkout"
          >
            Guest Checkout <NextArrowIconNoStick color="black" width="10%" />
          </a>
        </>
      )}
    </>
  );
});
