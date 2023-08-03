import { useSignal, useVisibleTask$, $, useTask$ } from "@builder.io/qwik";
import { useStore } from "@builder.io/qwik";
import { useContextProvider } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { Footer } from "~/components/shared/footer/footer";
import { Header } from "~/components/shared/header/header";
import { NavBar } from "~/components/shared/navbar/navbar";
import { ToolBar } from "~/components/shared/toolbar/toolbar";
import { CartContext } from "~/context/cart.context";
import { connect } from "~/express/db.connection";
import { getCartByBrowserId } from "~/express/services/cart.service";
import {
  addDummyCustomer,
  getDummyCustomer,
} from "~/express/services/dummy.user.service";
import { findUserByBrowserId } from "~/express/services/user.service";
import type { UserModel } from "~/models/user.model";
import { uuid } from "~/utils/uuid";

export const useUserData = routeLoader$(
  async ({ cookie }) => {
    await connect();
    let browserId = cookie.get("browserId")?.value;
    let verified = cookie.get("verified")?.value;
    if (!browserId) {
      browserId = uuid();
      verified = "false";
      cookie.set("browserId", browserId, { httpOnly: true, path: "/" });
      cookie.set("verified", verified, { httpOnly: true, path: "/" });
      await addDummyCustomer(browserId, null);
    }
    const cart: any = await getCartByBrowserId(browserId ?? "");
    if (verified && verified === "true") {
      const request: any = await findUserByBrowserId(browserId ?? "");
      return JSON.stringify({
        request: request,
        cart: cart,
        browserId: browserId ?? "",
        cartNo: cart?.totalQuantity ?? "0",
        verified: true,
      });
    } else {
      const request: any = await getDummyCustomer(browserId ?? "");
      return JSON.stringify({
        request: request,
        cart: cart,
        browserId: browserId ?? "",
        cartNo: cart?.totalQuantity ?? "0",
        verified: false,
      });
    }
  },
  { id: uuid() }
);

export default component$(() => {
  const user = useUserData().value;
  const userData = JSON.parse(user ?? "{}");
  const nav = useNavigate();
  const contextObject = useStore<any>({
    browserId: userData?.browserId,
    cart: userData?.cart,
    isVerified: userData?.verified,
  });
  const userValue = useSignal<UserModel | null>();
  const loc = useLocation();
  const url = loc?.url?.pathname;

  useTask$(() => {
    if (contextObject?.cart?.products?.length > 0) {
      let totalQuantity = 0;
      let totalPrice = 0;
      contextObject.cart.products.forEach((product: any) => {
        if (product?.cartVariations?.length > 0) {
          product.cartVariations.forEach((variation: any) => {
            totalQuantity += variation.quantity;
            if (contextObject.isVerified) {
              totalPrice +=
                variation.quantity *
                (parseFloat(variation.price?.toString().replace("$", "")) -
                  parseFloat(variation.price?.toString().replace("$", "")) *
                    0.2);
            } else {
              totalPrice +=
                variation.quantity *
                parseFloat(variation.price?.toString().replace("$", ""));
            }
          });
        } else {
          totalQuantity += product.cartQuantity;
          if (product.sale_price) {
            if (contextObject.isVerified) {
              totalPrice +=
                product.cartQuantity *
                (parseFloat(product.sale_price?.replace("$", "")) -
                  parseFloat(product.sale_price?.replace("$", "")) * 0.2);
            } else {
              totalPrice +=
                product.cartQuantity *
                parseFloat(product.sale_price?.replace("$", ""));
            }
          } else {
            if (contextObject.isVerified) {
              totalPrice +=
                product.cartQuantity *
                (parseFloat(product.price?.replace("$", "")) -
                  parseFloat(product.price?.replace("$", "")) * 0.2);
            } else {
              totalPrice +=
                product.cartQuantity *
                parseFloat(product.price?.replace("$", ""));
            }
          }
        }
      });
      contextObject.cart.totalQuantity = totalQuantity;
      contextObject.cart.totalPrice = parseFloat(totalPrice.toFixed(2));
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => userData);
    if (typeof userData !== "undefined") {
      userValue.value = userData?.request;
    }
  });

  useContextProvider(CartContext, contextObject);

  const handleOnCartClick = $(() => {
    nav("/cart");
  });

  return (
    <div class="page flex flex-col gap-6 h-screen">
      <main>
        {url !== "/login/" &&
          url !== "/register/" &&
          !url.includes("admin") && (
            <>
              <Header />
              <ToolBar
                user={userData?.request}
                handleOnCartClick={handleOnCartClick}
              />
              <NavBar />
            </>
          )}
        <Slot />
        {url !== "/login/" &&
          url !== "/register/" &&
          !url.includes("admin") && <Footer />}
      </main>
      <div class="section dark">
        <div class="container"></div>
      </div>
    </div>
  );
});
