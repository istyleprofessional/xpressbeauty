import { useSignal, useVisibleTask$, $, useTask$ } from "@builder.io/qwik";
import { useStore } from "@builder.io/qwik";
import { useContextProvider } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import {
  routeLoader$,
  server$,
  useLocation,
  // useNavigate,
} from "@builder.io/qwik-city";
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
    if (url.pathname.includes("admin")) {
      return;
    }
    let country_name: string = "";
    let city: string = "";
    let userIP: string = "";
    try {
      userIP =
        request.headers.get("do-connecting-ip") ??
        request.headers.get("X-Real-IP") ??
        "";
      const ipObject = await ip2location.fetch(userIP);
      country_name = ipObject?.country_name;
      city = ipObject?.city;
    } catch (error) {
      console.log(error);
    }

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
    if (!token) {
      const requestDum: any = await addDummyCustomer("", data);
      if (requestDum.status === "success") {
        if (country_name?.toLowerCase()?.includes("united states")) {
          cookie.set("cur", 1, { path: "/" });
        } else if (country_name?.toLowerCase()?.includes("canada")) {
          cookie.set("cur", 2, { path: "/" });
        } else {
          cookie.set("cur", 1, { path: "/" });
        }
        const token = jwt.sign(
          {
            user_id: requestDum?.result?._id?.toString() ?? "",
            isDummy: true,
          },
          env.get("VITE_JWTSECRET") ?? "",
          { expiresIn: "1h" }
        );
        cookie.set("token", token, {
          httpOnly: true,
          path: "/",
        });
        return JSON.stringify({
          user: requestDum?.result,
        });
      }
    }
    try {
      const verify: any = jwt.verify(token, env.get("VITE_JWTSECRET") ?? "");
      let user: any;
      if (verify.isDummy) {
        user = await getDummyCustomer(verify?.user_id ?? "");
      } else {
        user = await findUserByUserId(verify?.user_id ?? "");
      }

      if (!user?.result) {
        cookie.delete("token", { path: "/" });
        const request: any = await addDummyCustomer("", data);
        if (country_name?.toLowerCase()?.includes("united states")) {
          cookie.set("cur", 1, { path: "/" });
        } else if (country_name?.toLowerCase()?.includes("canada")) {
          cookie.set("cur", 2, { path: "/" });
        } else {
          cookie.set("cur", 1, { path: "/" });
        }
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
        return JSON.stringify({
          user: request?.result,
        });
      }
      const checkCur = cookie.get("cur")?.value ?? "";
      if (!checkCur) {
        if (
          user?.result?.generalInfo?.address?.country?.toLowerCase?.includes(
            "united"
          )
        ) {
          cookie.set("cur", 1, { path: "/" });
        } else if (
          user?.result?.generalInfo?.address?.country?.toLowerCase?.includes(
            "canada"
          )
        ) {
          cookie.set("cur", 2, { path: "/" });
        } else {
          cookie.set("cur", 1, { path: "/" });
        }
      }
      const checkRate = cookie.get("curRate")?.value ?? "";
      if (!checkRate) {
        cookie.set("curRate", 90, { path: "/" });
      }

      return JSON.stringify({
        user: user?.result,
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
        return JSON.stringify({
          user: user?.result,
        });
      }
    }
    return JSON.stringify({
      user: null,
    });
  }
);

export const getCart = server$(async function (userId: string) {
  const cart = await getCartByUserId(userId);
  return JSON.stringify(cart);
});

export const getWishListServer = server$(async function (userId: string) {
  const wishList = await getWishList(userId);
  return JSON.stringify(wishList);
});

export const clearUser = server$(async function () {
  this.cookie.set("token", "", { path: "/" });
  return true;
});

export const useCurrLoader = routeLoader$(({ cookie }) => {
  const country = cookie.get("cur")?.value ?? "";
  return country;
});

export default component$(() => {
  const user = useUserData().value;
  const userData = JSON.parse(user ?? "{}");
  // const nav = useNavigate();
  const cartContextObject = useStore<any>({
    userId: userData._id,
    cart: {},
    isVerified: false,
  });
  const wishListContextObject = useStore<any>({
    wishList: {},
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
  const currency = useCurrLoader().value;
  useTask$(
    async ({ track }) => {
      track(() => userData?.user);
      const cart = await getCart(userData?.user?._id ?? "");
      cartContextObject.cart = JSON.parse(cart);
      if (cartContextObject?.cart?.products?.length > 0) {
        let totalPrice = 0;
        if (cartContextObject.cart.currency === "USD" && currency === "2") {
          cartContextObject.cart.products.forEach((element: any) => {
            element.price = element.price / 0.9;
            element.currency = "CAD";
          });
          cartContextObject.cart.products.forEach((element: any) => {
            totalPrice += element.price * element.quantity;
          });
        } else if (
          cartContextObject.cart.currency === "CAD" &&
          currency === "1"
        ) {
          cartContextObject.cart.products.forEach((element: any) => {
            element.price = element.price * 0.9;
            element.currency = "USD";
          });
          cartContextObject.cart.products.forEach((element: any) => {
            totalPrice += element.price * element.quantity;
          });
        } else {
          cartContextObject.cart.products.forEach((element: any) => {
            totalPrice += element.price * element.quantity;
          });
        }
        cartContextObject.cart.totalPrice = parseFloat(totalPrice.toFixed(2));
        cartContextObject.cart.totalQuantity =
          cartContextObject.cart.products.reduce(
            (total: any, item: any) => total + item.quantity,
            0
          );
        console.log(cartContextObject.cart.totalQuantity);
        cartContextObject.cart.currency = currency === "1" ? "USD" : "CAD";
      }
    },
    { eagerness: "idle" }
  );

  useTask$(
    async ({ track }) => {
      track(() => userData?.user);
      const wishList = await getWishListServer(userData?.user?._id ?? "");
      wishListContextObject.wishList = JSON.parse(wishList);
    },
    { eagerness: "idle" }
  );

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
    location.href = "/cart/";
  });

  const handleLogout = $(async () => {
    await clearUser();
    location.reload();
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
                handleLogout={handleLogout}
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
