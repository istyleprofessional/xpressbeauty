import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { loadScript } from "@paypal/paypal-js";
import { NextArrowIconNoStick } from "~/components/shared/icons/icons";
import { CartContext } from "~/context/cart.context";
import { setupPaypal } from "~/utils/paypal-capture-payment";

interface CartDetailsProps {
  isLoading: any;
}

export const CartDetails = component$((props: CartDetailsProps) => {
  const { isLoading } = props;
  const cartContext: any = useContext(CartContext);
  const subTotal = useSignal<number>(0);
  const hst = useSignal<number>(0);
  const total = useSignal<number>(0);

  useVisibleTask$(({ track }) => {
    track(() => cartContext?.cart?.totalPrice);
    subTotal.value = cartContext?.cart?.totalPrice ?? 0;
    hst.value = (cartContext?.cart?.totalPrice ?? 0) * 0.13;
    total.value = (cartContext?.cart?.totalPrice ?? 0) + hst.value;
  });

  useVisibleTask$(async () => {
    const paypalMode = process.env.PAYPAL_MODE ?? "sandbox";
    let paypalClientId: string;
    if (paypalMode === "sandbox") {
      paypalClientId = process.env.PAYPAL_SANDBOX_CLIENT_ID ?? "";
    } else {
      paypalClientId = process.env.PAYPAL_LIVE_CLIENT_ID ?? "";
    }
    const paypal = await loadScript({
      "client-id": paypalClientId,
      currency: "CAD",
    });
    await setupPaypal(paypal, isLoading, cartContext, total);
  });

  return (
    <>
      <h2 class="text-white text-xl font-semibold">Order Details</h2>
      <p class="text-white text-xs font-light">
        Complete your order and earn 85 Points for a discount on a future
        purchase
      </p>
      <div class="flex flex-row gap-3 justify-center items-end">
        <div class="form-control w-[50%]">
          <label class="label">
            <span class="label-text">Coupon Code</span>
          </label>
          <input
            type="text"
            placeholder="8888888"
            class="input input-bordered w-full max-w-xs text-sm h-8 text-black"
          />
        </div>
        <button class="btn bg-[#D4D4D8] max-w-xs btn-sm text-black w-[40%] text-xs">
          Apply Code
        </button>
      </div>
      <div class="divider text-white"></div>
      <div class="flex flex-col gap-5 justify-center">
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
          <p class="text-white text-xs font-light">Total (Tax incl.)</p>
          <p class="justify-self-end text-white text-sm font-light">
            {total.value?.toLocaleString("en-US", {
              style: "currency",
              currency: "CAD",
            })}
          </p>
        </div>
      </div>
      <a class="btn text-black" href="/checkout">
        <div class="flex flex-row w-full items-center">
          <p class="text-sm">
            {total.value?.toLocaleString("en-US", {
              style: "currency",
              currency: "CAD",
            })}
          </p>
          <div class="flex flex-row gap-1 items-center w-full justify-end">
            Checkout <NextArrowIconNoStick color="black" width="10%" />
          </div>
        </div>
      </a>
      <div class="divider">OR</div>
      <div id="paypalButton"></div>
    </>
  );
});
