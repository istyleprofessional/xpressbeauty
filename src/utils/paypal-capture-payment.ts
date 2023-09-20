import type { ProductModel } from "~/models/product.model";
import { postRequest } from "./fetch.utils";
import { generateAccessToken } from "./paypalToken";

export async function capturePayment(orderId: string, baseURL: string) {
  const accessToken = await generateAccessToken(baseURL);
  const url = `${baseURL}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data;
}

export const setupPaypal = async (
  paypal: any,
  isLoading: any,
  cartContext: any,
  total: any
) => {
  if (cartContext?.cart?.products?.length === 0) return;
  return paypal
    .Buttons({
      createOrder: async function () {
        isLoading.value = true;
        const createPayPalOrderBody = cartContext?.cart?.products?.map(
          (product: ProductModel) => {
            return {
              name: product.product_name,
              unit_amount: {
                currency_code: "CAD",
                value: product?.sale_price
                  ? product?.sale_price?.replace("$", "")
                  : product?.price?.replace("$", ""),
              },
              quantity: product.quantity,
              tax: {
                currency_code: "CAD",
                value: (
                  parseFloat(
                    product.sale_price
                      ? product.sale_price.replace("$", "")
                      : product?.price?.replace("$", "") ?? "0"
                  ) * 0.13
                )
                  .toFixed(2)
                  .toString(),
              },
            };
          }
        );
        const res = await postRequest(
          "/api/paypal/create-order/",
          JSON.stringify({ items: createPayPalOrderBody, amount: total.value })
        );
        const json = await res.json();
        isLoading.value = false;
        return json.id;
      },
      onApprove: async function (data: any) {
        const res = await postRequest(
          "/api/paypal/capture-paypal-order/",
          JSON.stringify({ orderID: data.orderID, cartContext: cartContext })
        );
        location.href = "/order-confirmation";
        const json = await res.json();
        return json;
      },
      // onError: function (err: any) {
      //   console.log(err);
      // },
    })
    .render("#paypalButton");
};
