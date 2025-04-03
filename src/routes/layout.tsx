import { $, useTask$ } from "@builder.io/qwik";
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
import {
  getCartByUserId,
  updateCartCurrencyService,
} from "~/express/services/cart.service";
import {
  addDummyCustomer,
  getDummyCustomer,
} from "~/express/services/dummy.user.service";
import { findUserByUserId } from "~/express/services/user.service";
import jwt from "jsonwebtoken";
import { UserContext } from "~/context/user.context";
import { getWishList } from "~/express/services/wishList.service";
import { WishListContext } from "~/context/wishList.context";
import { CurContext } from "~/context/cur.context";
import { getUniqueMainCategories } from "~/express/services/category.service";
import { User } from "~/express/schemas/users.schema";
import dummyUsers from "~/express/schemas/dummy.user.schema";
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
      const checkPrevUser = await User.findOne({
        "generalInfo.ip": userIP,
      });
      if (checkPrevUser) {
        country_name = checkPrevUser.generalInfo.address.country;
        city = checkPrevUser.generalInfo.address.city;
      } else {
        const checkDumUser = await dummyUsers.findOne({
          "generalInfo.ip": userIP,
        });
        if (checkDumUser) {
          country_name = checkDumUser.generalInfo.address.country;
          city = checkDumUser.generalInfo.address.city;
        } else {
          // call free api to get location
          const req = await fetch(`http://ip-api.com/json/${userIP}`, {
            method: "GET",
          });
          const ipObject = await req.json();
          country_name = ipObject?.country;
          city = ipObject?.city;
        }
      }
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
    // console.log(data);
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

export const useGetMainCategories = routeLoader$(async () => {
  await connect();
  const categories = await getUniqueMainCategories();
  if (categories.result) {
    categories.result.length = 4;
  }
  return JSON.stringify(
    categories.result?.filter((x: any) => x !== null) ?? []
  );
});

export const updateCartCurrency = server$(async function (
  userId: string,
  cur: string
) {
  const cart = await updateCartCurrencyService(userId, cur);
  return JSON.stringify(cart);
});

export default component$(() => {
  const user = useUserData().value;
  const userData = JSON.parse(user ?? "{}");
  const categories = useGetMainCategories().value;
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
        let shipping = 15;
        if (
          curContextObject.cur === "2" &&
          cartContextObject.cart.currency === "USD"
        ) {
          cartContextObject.cart.currency = "CAD";
          await updateCartCurrency(userContextObject?._id, "CAD");
          cartContextObject.cart.products.forEach((element: any) => {
            const price = element.price / 0.9;
            element.price = Math.round(price * 100) / 100;
            element.currency = "CAD";
          });
          cartContextObject.cart.products.forEach((element: any) => {
            totalPrice += element.price * element.quantity;
            // if (totalPrice > 50) {
            //   shipping = 0;
            // } else {
            shipping = 15;
            // }
          });
        } else if (
          curContextObject.cur === "1" &&
          cartContextObject.cart.currency === "CAD"
        ) {
          cartContextObject.cart.currency = "USD";
          await updateCartCurrency(userContextObject?._id, "USD");
          cartContextObject.cart.products.forEach((element: any) => {
            const price = element.price * 0.9;
            element.price = Math.round(price * 100) / 100;
            element.currency = "USD";
          });
          cartContextObject.cart.products.forEach((element: any) => {
            element.price = Math.round(element.price * 100) / 100;
            totalPrice += element.price * element.quantity;
            // if (totalPrice > 50) {
            //   shipping = 0;
            // } else {
            shipping = 15;
            // }
          });
        } else {
          await updateCartCurrency(
            userContextObject?._id,
            curContextObject.cur === "1" ? "USD" : "CAD"
          );
          cartContextObject.cart.products.forEach((element: any) => {
            // make sure the price is 2 decimal using math
            element.price = Math.round(element.price * 100) / 100;
            totalPrice += element.price * element.quantity;
            // if (totalPrice > 50) {
            //   shipping = 0;
            // } else {
            shipping = 15;
            // }
          });
        }

        cartContextObject.cart.totalPrice = parseFloat(totalPrice.toFixed(2));
        cartContextObject.cart.shipping = parseFloat(shipping.toFixed(2));
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

  return (
    <div class="page flex flex-col gap-6 h-screen">
      {/* {loc.url.pathname.includes("admin") && ( */}
      <>
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
                  categories={JSON.parse(categories)}
                />
                <NavBar categories={JSON.parse(categories)} />
              </>
            )}

          <Slot />
          {/* Create Whatsapp button on the left bottom of the screen always */}

          {url !== "/login/" &&
            url !== "/register/" &&
            !url.includes("admin") &&
            !url.includes("Verify") && <Footer />}
        </main>
        <div class="section dark">
          <div class="container"></div>
        </div>
      </>
      {/* )} */}
    </div>
  );
});
