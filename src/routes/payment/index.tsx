import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { PerviousArrowIconNoStick } from "~/components/shared/icons/icons";
import { Steps } from "~/components/shared/steps/steps";
import { ProductList } from "~/components/cart/product-list/product-list";
import { OrderDetails } from "~/components/payment/order-details/order-details";
import { routeLoader$ } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { getCartByUserId } from "~/express/services/cart.service";

export const usePaymentRoute = routeLoader$(async ({ cookie }) => {
  const token = cookie.get("token")?.value;
  if (!token) {
    return JSON.stringify({ status: "failed" });
  }
  try {
    const verified: any = jwt.verify(token, process.env.JWTSECRET ?? "");
    if (!verified) {
      return JSON.stringify({ status: "failed" });
    }
    const getCart: any = await getCartByUserId(verified.user_id);
    if (!getCart) {
      return JSON.stringify({ status: "failed" });
    }
    if (getCart.products.length === 0) {
      return JSON.stringify({ status: "failed" });
    }
    return JSON.stringify({ status: "success" });
  } catch (e: any) {
    if (e.message === "jwt expired") {
      const decoded: any = jwt.decode(token);
      const newToken = jwt.sign(
        { user_id: decoded.user_id, isDummy: decoded.isDummy },
        process.env.JWTSECRET ?? "",
        { expiresIn: "1h" }
      );
      cookie.set("token", newToken, { httpOnly: true, path: "/" });
      const getCart: any = await getCartByUserId(decoded.user_id);
      if (!getCart) {
        return JSON.stringify({ status: "failed" });
      }
      if (getCart.products.length === 0) {
        return JSON.stringify({ status: "failed" });
      }
      return JSON.stringify({ status: "success" });
    } else {
      return JSON.stringify({ status: "failed" });
    }
  }
});

export default component$(() => {
  const isLoading = useSignal<boolean>(false);
  const paymentRoute = JSON.parse(usePaymentRoute().value);

  useVisibleTask$(
    () => {
      if (paymentRoute.status === "failed") {
        window.location.href = "/cart";
      }
    },
    { strategy: "document-idle" }
  );

  return (
    <>
      {isLoading.value && (
        <div class="w-full backdrop-blur-lg drop-shadow-lg fixed z-20 m-auto inset-x-0 inset-y-0 ">
          <progress class="progress progress-white w-56 fixed z-20 m-auto inset-x-0 inset-y-0  bg-black"></progress>
        </div>
      )}
      <div class="flex flex-col gap-20 md:p-10">
        <div class="flex flex-col gap-3 justify-center items-center">
          <Steps pageType="payment" />
        </div>
        <div class="flex flex-col md:flex-row gap-10 justify-center items-center">
          <div class="flex flex-col gap-4 justify-center items-start w-full">
            <a class="text-black font-bold text-3xl flex flex-row gap-1 items-center cursor-pointer">
              <PerviousArrowIconNoStick color="black" width="10%" /> Continue
              Shopping
            </a>
            <ProductList />
          </div>
          <div class="bg-black h-full w-96 rounded-lg flex flex-col gap-3 p-5">
            <OrderDetails isLoading={isLoading} />
          </div>
        </div>
      </div>
    </>
  );
});
