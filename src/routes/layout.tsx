import { useVisibleTask$, $, useTask$ } from "@builder.io/qwik";
import { useStore } from "@builder.io/qwik";
import { useContextProvider } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { routeLoader$, server$, useLocation } from "@builder.io/qwik-city";
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
import jwt from "jsonwebtoken";
import { UserContext } from "~/context/user.context";
import { getWishList } from "~/express/services/wishList.service";
import { WishListContext } from "~/context/wishList.context";
import ip2location from "ip-to-location";
import { CurContext } from "~/context/cur.context";
// import GmailFactory from "gmail-js";

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
        // format date to yyyy-mm-dd hh:mm:ss
        date: new Date().toISOString().slice(0, 19).replace("T", " "),
      },
    };
    console.log(data);
    let curr: any = cookie.get("cur")?.value;
    if (userAgent?.includes("bot")) {
      cookie.delete("token", { path: "/" });
      return JSON.stringify({
        user: null,
        cur: curr,
        isDummy: true,
      });
    }
    if (!curr) {
      if (country_name?.toLowerCase()?.includes("united")) {
        curr = "1";
        cookie.set("cur", 1, { path: "/" });
      } else if (country_name?.toLowerCase()?.includes("canada")) {
        curr = "2";
        cookie.set("cur", 2, { path: "/" });
      } else {
        curr = "1";
        cookie.set("cur", 1, { path: "/" });
      }
    }
    if (!token) {
      const requestDum: any = await addDummyCustomer("", data);
      if (requestDum.status === "success") {
        const token = jwt.sign(
          {
            user_id: requestDum?.result?._id?.toString() ?? "",
            isDummy: true,
          },
          env.get("VITE_JWTSECRET") ?? "",
          { expiresIn: "1h" }
        );
        console.log(requestDum?.result?._id?.toString() ?? "");
        cookie.set("token", token, {
          httpOnly: true,
          path: "/",
        });
        return JSON.stringify({
          user: requestDum?.result,
          cur: curr,
          isDummy: true,
        });
      }
    }
    try {
      const verify: any = jwt.verify(token, env.get("VITE_JWTSECRET") ?? "");

      let user: any;
      let isDummy = true;
      if (verify.isDummy) {
        user = await getDummyCustomer(verify?.user_id ?? "");
        isDummy = true;
      } else {
        user = await findUserByUserId(verify?.user_id ?? "");
        isDummy = false;
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
        return JSON.stringify({
          user: request?.result,
          cur: curr,
          isDummy: true,
        });
      }

      const checkRate = cookie.get("curRate")?.value ?? "";
      if (!checkRate) {
        cookie.set("curRate", 90, { path: "/" });
      }

      return JSON.stringify({
        user: user?.result,
        cur: curr,
        isDummy: isDummy,
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
        let isDummy = true;
        if (decode.isDummy) {
          user = await getDummyCustomer(decode.user_id);
          isDummy = true;
        } else {
          user = await findUserByUserId(decode.user_id);
          isDummy = false;
        }
        let curr: string = cookie.get("cur")?.value ?? "1";
        if (!curr) {
          if (country_name?.toLowerCase()?.includes("united")) {
            curr = "1";
            cookie.set("cur", 1, { path: "/" });
          } else if (country_name?.toLowerCase()?.includes("canada")) {
            curr = "2";
            cookie.set("cur", 2, { path: "/" });
          } else {
            curr = "1";
            cookie.set("cur", 1, { path: "/" });
          }
        }
        return JSON.stringify({
          user: user?.result,
          cur: curr,
          isDummy: isDummy,
        });
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
        return JSON.stringify({
          user: request?.result,
          cur: curr,
          isDummy: true,
        });
      }
    }
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

export default component$(() => {
  const user = useUserData().value;
  const userData = JSON.parse(user ?? "{}");
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
      ...userData?.user,
      isDummy: userData?.isDummy,
    },
    { deep: true }
  );
  const curContextObject = useStore<any>({
    cur: userData?.cur,
  });
  const loc = useLocation();
  const url = loc?.url?.pathname;

  useTask$(
    async ({ track }) => {
      track(() => userData?.user);
      const cart = await getCart(userData?.user?._id ?? "");
      cartContextObject.cart = JSON.parse(cart);
      if (cartContextObject?.cart?.products?.length > 0) {
        let totalPrice = 0;
        if (
          cartContextObject.cart.currency === "USD" &&
          curContextObject.cur === "2"
        ) {
          cartContextObject.cart.products.forEach((element: any) => {
            const price = element.price / 0.9;
            element.price = Math.round(price * 100) / 100;
            element.currency = "CAD";
          });
          cartContextObject.cart.products.forEach((element: any) => {
            totalPrice += element.price * element.quantity;
          });
        } else if (
          cartContextObject.cart.currency === "CAD" &&
          curContextObject.cur === "1"
        ) {
          cartContextObject.cart.products.forEach((element: any) => {
            const price = element.price * 0.9;
            element.price = Math.round(price * 100) / 100;
            element.currency = "USD";
          });
          cartContextObject.cart.products.forEach((element: any) => {
            element.price = Math.round(element.price * 100) / 100;
            totalPrice += element.price * element.quantity;
          });
        } else {
          cartContextObject.cart.products.forEach((element: any) => {
            // make sure the price is 2 decimal using math
            element.price = Math.round(element.price * 100) / 100;
            totalPrice += element.price * element.quantity;
          });
        }
        cartContextObject.cart.totalPrice = parseFloat(totalPrice.toFixed(2));
        cartContextObject.cart.totalQuantity =
          cartContextObject.cart.products.reduce(
            (total: any, item: any) => total + item.quantity,
            0
          );
        cartContextObject.cart.currency =
          curContextObject.cur === "1" ? "USD" : "CAD";
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

  useContextProvider(CartContext, cartContextObject);
  useContextProvider(UserContext, userContextObject);
  useContextProvider(WishListContext, wishListContextObject);
  useContextProvider(CurContext, curContextObject);

  const handleOnCartClick = $(() => {
    location.href = "/cart/";
  });

  const handleLogout = $(async () => {
    await clearUser();
    localStorage.removeItem("copon");
    location.reload();
  });

  useVisibleTask$(() => {
    const christmasAnimation = document.getElementById("christmasAnimation");
    if (christmasAnimation) {
      christmasAnimation.classList.remove("hidden");
      setTimeout(() => {
        christmasAnimation.classList.add("hidden");
      }, 3000);
    }
  });

  return (
    <div class="page flex flex-col gap-6 h-screen">
      <main>
        {url !== "/login/" &&
          url !== "/register/" &&
          !url.includes("admin") &&
          !url.includes("Verify") && (
            <>
              <Header countryProp={curContextObject.cur} />
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
