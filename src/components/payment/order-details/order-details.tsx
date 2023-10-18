import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { NextArrowIconNoStick } from "~/components/shared/icons/icons";

interface OrderDetailsProps {
  cart: any;
  total: any;
}

export const OrderDetails = component$((props: OrderDetailsProps) => {
  const { cart, total } = props;
  const subTotal = useSignal<number>(0);
  const hst = useSignal<number>(0);
  const shipping = useSignal<number>(0);

  useVisibleTask$(({ track }) => {
    track(() => cart?.totalPrice);
    subTotal.value = cart?.totalPrice ?? 0;
    hst.value = (cart?.totalPrice ?? 0) * 0.13;
    if (subTotal.value > 150) {
      shipping.value = 0;
    } else {
      shipping.value = 15;
    }
    total.value = (cart?.totalPrice ?? 0) + hst.value + shipping.value;
  });

  return (
    <>
      <h2 class="text-white text-xl font-semibold">Card Details</h2>
      <div class="flex flex-row gap-3 justify-center items-end"></div>
      <form id="payment-form">
        <div id="payment-element"></div>
        <div id="error-message"></div>
        <div class="flex flex-col gap-2 justify-center p-3">
          <div class="grid grid-cols-2 w-full">
            <p class="text-white text-xs font-light">Subtotal</p>
            <p class="justify-self-end text-white text-sm font-light">
              {subTotal.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </p>
          </div>
          <div class="grid grid-cols-2 w-full">
            <p class="text-white text-xs font-light">HST</p>
            <p class="justify-self-end text-white text-sm font-light">
              {hst.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </p>
          </div>
          <div class="grid grid-cols-2 w-full">
            <p class="text-white text-xs font-light">Shipping</p>
            <p class="justify-self-end text-white text-sm font-light">
              {shipping.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </p>
          </div>
          <div class="grid grid-cols-2 w-full">
            <p class="text-white text-xs font-light">Total (Tax incl.)</p>
            <p class="justify-self-end text-white text-sm font-light">
              {total.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </p>
          </div>
        </div>

        <button type="submit" class="btn text-black w-full">
          <div class="flex flex-row w-full items-center text-xs">
            <p class="text-sm">
              {total.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </p>
            <div class="flex flex-row gap-1 items-center w-full justify-center text-sm">
              Checkout <NextArrowIconNoStick color="black" />
            </div>
          </div>
        </button>
      </form>
      <div class="divider text-white"></div>
    </>
  );
});
