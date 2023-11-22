import { useSignal, useVisibleTask$, $, useTask$ } from "@builder.io/qwik";
import { useStore } from "@builder.io/qwik";
import { useContextProvider } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { routeLoader$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { Footer } from "~/components/shared/footer/footer";
import { Header } from "~/components/shared/header/header";
import { NavBar } from "~/components/shared/navbar/navbar";
import { ToolBar } from "~/components/shared/toolbar/toolbar";
import { CartContext } from "~/context/cart.context";
import { connect } from "~/express/db.connection";
import { getCartByUserId } from "~/express/services/cart.service";
import {
  addDummyCustomer,
  getDummyCustomer,
} from "~/express/services/dummy.user.service";
import { findUserByUserId } from "~/express/services/user.service";
import type { UserModel } from "~/models/user.model";
import jwt from "jsonwebtoken";
import { UserContext } from "~/context/user.context";
import { getWishList } from "~/express/services/wishList.service";
import { WishListContext } from "~/context/wishList.context";
import ip2location from "ip-to-location";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export const useUserData = routeLoader$(
  async ({ cookie, env, request, url }) => {
    await connect();
    const userIP =
      request.headers.get("do-connecting-ip") ||
      request.headers.get("X-Real-IP");
    const { country_name, city } = await ip2location.fetch(userIP);
    const referrer = request.headers.get("referer");
    const visitPage = url.href;
    const token = cookie.get("token")?.value ?? "";
    const userAgent = request.headers.get("user-agent");
    const data = {
      generalInfo: {
        address: {
          country: country_name ?? "",
          city: city ?? "",
        },
        referrer: referrer ?? "",
        ip: userIP ?? "",
        visitPage: visitPage ?? "",
        userAgent: userAgent ?? "",
      },
    };
    console.log(data);
    if (!token) {
      const request: any = await addDummyCustomer("", data);
      if (request.status === "success") {
        const token = jwt.sign(
          {
            user_id: request?.result?._id?.toString() ?? "",
            isDummy: true,
          },
          env.get("VITE_JWTSECRET") ?? "",
          { expiresIn: "1h" }
        );
        cookie.set("token", token, {
          httpOnly: true,
          path: "/",
        });
        const cart: any = await getCartByUserId(
          request?.result?._id?.toString() ?? ""
        );
        const cartContextObject = {
          userId: request?.result?._id?.toString() ?? "",
          cart: cart,
          quantity: cart?.totalQuantity ?? "0",
          verified: false,
        };
        const wishList = await getWishList(
          request?.result?._id?.toString() ?? ""
        );

        return JSON.stringify({
          cart: cartContextObject,
          user: null,
          wishList: wishList,
        });
      } else {
        const cartContextObject = {
          userId: "",
          cart: {},
          quantity: "0",
          verified: false,
        };
        return JSON.stringify({
          cart: cartContextObject,
          user: null,
          wishList: [],
        });
      }
    }
    try {
      let verify: any = jwt.verify(token, env.get("VITE_JWTSECRET") ?? "");
      if (verify?.role === "a") {
        // check if url contains admin or not
        if (url.href.includes("admin")) {
          return;
        } else {
          const request: any = await addDummyCustomer("", data);
          const newTokentoken = jwt.sign(
            {
              user_id: request?.result?._id?.toString() ?? "",
              isDummy: true,
            },
            env.get("VITE_JWTSECRET") ?? "",
            { expiresIn: "1h" }
          );
          cookie.set("token", newTokentoken, {
            httpOnly: true,
            path: "/",
          });
          verify = jwt.verify(newTokentoken, env.get("VITE_JWTSECRET") ?? "");
        }
      }
      let user: any;
      if (verify.isDummy) {
        user = await getDummyCustomer(verify?.user_id ?? "");
      } else {
        user = await findUserByUserId(verify?.user_id ?? "");
      }

      if (!user?.result) {
        cookie.delete("token", { path: "/" });
        const request: any = await addDummyCustomer("", data);
        const newTokentoken = jwt.sign(
          {
            user_id: request?.result?._id?.toString() ?? "",
            isDummy: true,
          },
          env.get("VITE_JWTSECRET") ?? "",
          { expiresIn: "1h" }
        );
        cookie.set("token", newTokentoken, {
          httpOnly: true,
          path: "/",
        });
        const cart: any = await getCartByUserId(
          request?.result?._id?.toString() ?? ""
        );
        const cartContextObject = {
          userId: request?.result?._id?.toString() ?? "",
          cart: cart,
          quantity: cart?.totalQuantity ?? "0",
          verified: false,
        };
        const wishList = await getWishList(
          request?.result?._id?.toString() ?? ""
        );
        return JSON.stringify({
          cart: cartContextObject,
          user: null,
          wishList: wishList,
        });
      }
      const cart: any = await getCartByUserId(user?.result?._id ?? "");
      const cartContextObject = {
        userId: user?.result?._id ?? "",
        cart: cart,
        quantity: cart?.totalQuantity ?? "0",
        verified:
          user?.result?.isEmailVerified && user?.result?.isPhoneVerified
            ? true
            : false,
      };
      const wishList = await getWishList(user?.result?._id ?? "");

      return JSON.stringify({
        cart: cartContextObject,
        user: verify.isDummy ? null : user?.result,
        wishList: wishList,
      });
    } catch (error: any) {
      if (error.message === "jwt expired") {
        const decode: any = jwt.decode(token);
        const newToken = jwt.sign(
          {
            user_id: decode.user_id,
            isDummy: decode.isDummy,
          },

          env.get("VITE_JWTSECRET") ?? "",
          { expiresIn: "1h" }
        );
        cookie.set("token", newToken, {
          httpOnly: true,
          path: "/",
        });
        let user: any;
        if (decode.isDummy) {
          user = await getDummyCustomer(decode.user_id);
        } else {
          user = await findUserByUserId(decode.user_id);
        }
        const cart: any = await getCartByUserId(user?.result?._id ?? "");
        const cartContextObject = {
          userId: user?.result?._id ?? "",
          cart: cart,
          quantity: cart?.totalQuantity ?? "0",
          verified:
            user?.result?.isEmailVerified && user?.result?.isPhoneVerified
              ? true
              : false,
        };
        const wishList = await getWishList(user?.result?._id ?? "");
        return JSON.stringify({
          cart: cartContextObject,
          user: decode.isDummy ? null : user?.result,
          wishList: wishList,
        });
      }
    }
    const cartContextObject = {
      userId: "",
      cart: {},
      quantity: "0",
      verified: false,
    };
    return JSON.stringify({
      cart: cartContextObject,
      user: null,
      wishList: [],
    });
  }
);

export default component$(() => {
  const user = useUserData().value;
  const userData = JSON.parse(user ?? "{}");
  const nav = useNavigate();
  const cartContextObject = useStore<any>({
    userId: userData?.cart?.userId,
    cart: userData?.cart?.cart,
    isVerified: userData?.cart?.verified,
  });
  const wishListContextObject = useStore<any>({
    wishList: userData?.wishList,
  });
  const userContextObject = useStore<any>(
    {
      user: userData?.user,
    },
    { deep: true }
  );
  const userValue = useSignal<UserModel | null>();
  const loc = useLocation();
  const url = loc?.url?.pathname;

  useTask$(() => {
    if (cartContextObject?.cart?.products?.length > 0) {
      let totalPrice = 0;
      cartContextObject.cart.products.forEach((element: any) => {
        totalPrice += element.price * element.quantity;
      });
      cartContextObject.cart.totalPrice = parseFloat(totalPrice.toFixed(2));
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => userData);
    if (typeof userData !== "undefined") {
      userValue.value = userData?.request;
    }
  });

  useContextProvider(CartContext, cartContextObject);
  useContextProvider(UserContext, userContextObject);
  useContextProvider(WishListContext, wishListContextObject);

  const handleOnCartClick = $(() => {
    nav("/cart");
  });

  return (
    <div class="page flex flex-col gap-6 h-screen">
      <main>
        {url !== "/login/" &&
          url !== "/register/" &&
          !url.includes("admin") &&
          !url.includes("Verify") && (
            <>
              <Header />
              <ToolBar
                user={userData?.cart}
                handleOnCartClick={handleOnCartClick}
              />
              <NavBar />
            </>
          )}
        <Slot />
        {url !== "/login/" &&
          url !== "/register/" &&
          !url.includes("admin") &&
          !url.includes("Verify") && <Footer />}
      </main>
      <div class="section dark">
        <div class="container"></div>
      </div>
    </div>
  );
});
