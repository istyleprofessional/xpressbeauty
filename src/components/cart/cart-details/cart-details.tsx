import {
  component$,
  useContext,
  useSignal,
  $,
  useVisibleTask$,
} from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { NextArrowIconNoStick } from "~/components/shared/icons/icons";
import { CartContext } from "~/context/cart.context";
import { UserContext } from "~/context/user.context";
import { User } from "~/express/schemas/users.schema";

export const checkCoponServer = server$(async function (
  copon: string,
  user_id: string
) {
  if (copon === "xpressbeauty10" || copon === "xpressbeauty30") {
    // find user id and check if he used this copon before in cobone array
    const checkIfUserUsed = await User.findOne({
      _id: user_id,
      cobone: { $elemMatch: { code: copon } },
    });
    if (checkIfUserUsed) {
      const filterCopon = checkIfUserUsed.cobone.filter(
        (copons: any) => copons.code === copon
      );
      if (filterCopon[0].status) {
        return false;
      } else {
        return true;
      }
    }
    await User.updateOne(
      { _id: user_id },
      { $push: { cobone: { code: copon, status: false } } }
    );
    return true;
  } else {
    return false;
  }
});

export const add30PercentDiscount = server$(async function () {
  const users = await User.find();
  for (const user of users) {
    await User.updateOne(
      { _id: user._id },
      { $push: { cobone: { code: "xpressbeauty30", status: false } } }
    );
  }
  return true;
});

export const CartDetails = component$((props: any) => {
  const cartContext: any = useContext(CartContext);
  const userContext: any = useContext(UserContext);
  const subTotal = useSignal<number>(0.0);
  const total = useSignal<number>(0.0);
  const shipping = useSignal<number>(15.0);
  const coponSignal = useSignal<string>("");
  const symbol = useSignal<string>("CAD");
  const applyCoponMessage = useSignal<string>("");

  useVisibleTask$(async ({ track }) => {
    track(() => cartContext?.cart?.totalPrice);
    track(() => props?.currencyObject.cur);

    subTotal.value = cartContext?.cart?.totalPrice;

    const checkCopon = localStorage.getItem("copon");
    if (checkCopon === "true") {
      subTotal.value = subTotal.value - subTotal.value * 0.1;
      applyCoponMessage.value = "Copon Applied";
    }
    total.value = subTotal.value;
    if (props?.currencyObject?.cur === "1") {
      symbol.value = "USD";
    } else {
      symbol.value = "CAD";
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => cartContext?.cart?.shipping);
    shipping.value = cartContext?.cart?.shipping;
    console.log("shipping", shipping.value);
  });
  const handleAddCopon = $(async () => {
    const checkCopon = await checkCoponServer(
      coponSignal.value,
      userContext?._id
    );
    if (checkCopon && coponSignal.value !== "xpressbeauty30") {
      subTotal.value = cartContext?.cart?.totalPrice;
      subTotal.value = subTotal.value - subTotal.value * 0.1;
      shipping.value = cartContext.cart.shipping;
      total.value = subTotal.value + shipping.value;
      if (props?.currencyObject?.cur === "1") {
        symbol.value = "USD";
      } else {
        symbol.value = "CAD";
      }
      applyCoponMessage.value = "Copon Applied";
      localStorage.setItem("copon", "true");
    } else if (coponSignal.value === "xpressbeauty30") {
      const add30DollarsDiscount = await add30PercentDiscount();
      console.log("add30DollarsDiscount", add30DollarsDiscount);
      applyCoponMessage.value = "Copon Applied";
      total.value = total.value - 30;
      localStorage.setItem("copon", "true");
    } else {
      applyCoponMessage.value = "Copon is not valid or already used";
      localStorage.setItem("copon", "false");
    }
  });

  return (
    <>
      <h2 class="text-white text-xl font-semibold">Order Details</h2>
      {userContext?.isDummy === false && (
        <div class="flex flex-col gap-3 justify-center items-center py-8">
          <input
            type="text"
            class="input"
            placeholder="Enter Promo Code"
            onChange$={(e: any) => {
              coponSignal.value = e.target.value;
            }}
          />
          <button
            class="btn btn-sm bg-neutral-800 text-white font-['Inter'] w-fit rounded-sm"
            onClick$={handleAddCopon}
          >
            Apply
          </button>
          {applyCoponMessage.value && (
            <p
              class={`text-xs ${
                applyCoponMessage?.value?.includes("Applied")
                  ? "text-success"
                  : "text-error"
              }`}
            >
              {applyCoponMessage.value}
            </p>
          )}
        </div>
      )}
      <div class="flex flex-col gap-5 justify-center">
        <div class="grid grid-cols-2 w-full">
          <p class="text-white text-sm font-light">Subtotal</p>
          <p class="justify-self-end text-white text-base font-light">
            {subTotal.value
              ? subTotal.value.toLocaleString("en-US", {
                  style: "currency",
                  currency: symbol.value,
                })
              : (0.0).toLocaleString("en-US", {
                  style: "currency",
                  currency: symbol.value,
                })}
          </p>
        </div>
        <div class="grid grid-cols-2 w-full">
          <p class="text-white text-sm font-light">TAX</p>
          <p class="justify-self-end text-white text-xs font-light w-full">
            Continue To Calculate Tax...
          </p>
        </div>
        <div class="grid grid-cols-2 w-full">
          <p class="text-white text-sm font-light">Shipping</p>
          <p class="justify-self-end text-white text-base font-light">
            {cartContext?.cart?.shipping
              ? cartContext?.cart?.shipping?.toLocaleString("en-US", {
                  style: "currency",
                  currency: symbol.value,
                })
              : (0.0).toLocaleString("en-US", {
                  style: "currency",
                  currency: symbol.value,
                })}
          </p>
        </div>
      </div>
      {!userContext?.isDummy ? (
        <button
          class={`btn text-black  normal-case ${
            cartContext?.cart?.products &&
            cartContext?.cart?.products.length === 0
              ? "disabled"
              : ""
          }`}
          onClick$={props.checkIfProductQuantityExist}
          // href="/payment"
        >
          Checkout <NextArrowIconNoStick color="black" width="10%" />
        </button>
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
          <div class="divider divider-neutral"></div>
          <div
            class=" bg-red-900 text-white px-4 py-3 rounded relative"
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

          <button
            class={`btn text-black  normal-case ${
              cartContext?.cart?.products &&
              cartContext?.cart?.products.length === 0
                ? "disabled"
                : ""
            }`}
            onClick$={props.checkIfProductQuantityExist}
          >
            Guest Checkout <NextArrowIconNoStick color="black" width="10%" />
          </button>
        </>
      )}
    </>
  );
});
