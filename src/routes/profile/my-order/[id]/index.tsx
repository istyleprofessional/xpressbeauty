import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { getDummyCustomer } from "~/express/services/dummy.user.service";
import { getOrderByOrderIdService } from "~/express/services/order.service";
import { getUserById } from "~/express/services/user.service";

export const useGetMyOrderDetails = routeLoader$(
  async ({ cookie, redirect, params, env }) => {
    const token = cookie.get("token")?.value;
    if (!token) {
      throw redirect(301, "/login");
    }
    try {
      const verified: any = jwt.verify(token, env.get("VITE_JWTSECRET") ?? "");
      if (!verified) {
        throw redirect(301, "/login");
      }
      const orderDetails = await getOrderByOrderIdService(params.id);
      const user_id = orderDetails?.request?.userId;
      let user: any;
      user = await getUserById(user_id ?? "");
      if (!user.result) {
        user = await getDummyCustomer(user_id ?? "");
      }
      const data = {
        ...orderDetails.request,
        userName: `${user.result?.firstName ?? ""} ${
          user.result?.lastName ?? ""
        }`,
      };
      return JSON.stringify({ status: "success", data: data });
    } catch (err) {
      throw redirect(301, "/login");
    }
  }
);

export default component$(() => {
  const myOrderDetails = useGetMyOrderDetails();
  const myOrderDetailsData = JSON.parse(myOrderDetails.value ?? "[]");
  const order = myOrderDetailsData.data._doc;
  const subTotal =
    parseFloat(order.totalPrice) > 150
      ? parseFloat(order.totalPrice) - parseFloat(order.totalPrice) * 0.13
      : parseFloat(order.totalPrice) - 15 - parseFloat(order.totalPrice) * 0.13;
  const hst = parseFloat(order.totalPrice) * 0.13;

  // subTotal.value = cartContext?.cart?.totalPrice ?? 0;
  // hst.value = (cartContext?.cart?.totalPrice ?? 0) * 0.13;
  // if (subTotal.value > 150) {
  //   shipping.value = 0;
  // } else {
  //   shipping.value = 15;
  // }
  // total.value =
  //   (cartContext?.cart?.totalPrice ?? 0) + hst.value + shipping.value;
  return (
    <div class="card shadow-lg">
      <div class="card-body justify-center items-center">
        <div class="flex flex-col gap-2 justify-center items-center">
          <h2 class="text-black text-xl font-semibold">Order Details</h2>
          <p class="text-gray-600">
            <span class="font-bold">Order No:</span> {order.order_number}
          </p>
          <p class="text-gray-600">
            <span class="font-bold">Order Date:</span>{" "}
            {new Date(order.createdAt).toLocaleString("en-US", {
              timeZone: "America/Toronto",
            })}
          </p>
          <div class="divider divider-vertical"></div>
          <div class="flex flex-col justify-center items-center gap-2">
            <span class="font-bold">Shipping Details:</span>{" "}
            <span>{myOrderDetailsData.data.userName}</span>
            <span>{order.shippingAddress.addressLine1}</span>
            <span>{order.shippingAddress.postalCode}</span>
            <span>{order.shippingAddress.city}</span>
            <span>{order.shippingAddress.country}</span>
          </div>
          <div class="divider divider-vertical"></div>
          <div class="flex flex-col justify-center items-center gap-2">
            <span class="font-bold">Payment Details:</span>{" "}
            <span class="text-sm">
              <span class="font-bold">SubTotal:</span>{" "}
              {subTotal.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </span>
            <span class="text-sm">
              <span class="font-bold">HST:</span>{" "}
              {hst.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </span>
            <span class="text-sm">
              <span class="font-bold">Shipping:</span>{" "}
              {parseFloat(order.totalPrice) > 150 ? "Free" : "CA$15.00"}
            </span>
            <span class="text-sm">
              <span class="font-bold">Total:</span>{" "}
              {order.totalPrice.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </span>
          </div>
          <div class="divider divider-vertical"></div>
          <div class="flex flex-col gap-2 justify-center items-center">
            <span class="font-bold">Products Details:</span>{" "}
            {order.products.map((product: any, index: number) => {
              return (
                <div
                  class="card shadow-md justify-center items-center"
                  key={index}
                >
                  <figure>
                    <img
                      src={product.product_img}
                      alt={product.product_name}
                      class="w-20 h-20"
                    />
                  </figure>
                  <div class="card-body">
                    <span class="text-sm">
                      <span class="font-bold">Product Name:</span>{" "}
                      {product.product_name}
                    </span>
                    <span class="text-sm">
                      <span class="font-bold">Product Variation:</span>{" "}
                      {product.variation_name ?? ""}
                    </span>
                    <span class="text-sm">
                      <span class="font-bold">Product Price:</span>{" "}
                      {product.price.toLocaleString("en-US", {
                        style: "currency",
                        currency: "CAD",
                      })}
                    </span>
                    <span class="text-sm">
                      <span class="font-bold">Product Quantity:</span>{" "}
                      {product.quantity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
