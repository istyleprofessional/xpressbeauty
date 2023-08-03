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
  return paypal
    .Buttons({
      createOrder: async function () {
        // debugger
        isLoading.value = true;
        const createPayPalOrderBody = cartContext?.cart?.products?.map(
          (product: ProductModel) => {
            return {
              name: product.product_name,
              unit_amount: {
                currency_code: "CAD",
                value: product?.sale_price
                  ? product?.sale_price?.replace("$", "")
                  : product?.price
                  ? product?.price?.replace("$", "")
                  : product?.regular_price?.replace("$", ""),
              },
              quantity: product.cartQuantity,
              tax: {
                currency_code: "CAD",
                value: (
                  parseFloat(
                    product.sale_price
                      ? product.sale_price
                      : product.price
                      ? product.price
                      : product.regular_price ?? "0"
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
        isLoading.value = false;
        return res.json();
      },
      onApprove: async function (data: any) {
        console.log(data);
        // const res = await postRequest(
        //   "/api/paypal/capture-order/",
        //   JSON.stringify({ orderID: data.orderID })
        // );
        // if (res.status === 200) {
        //   cartContext.clearCart();
        // }
        // return res.json();
      },
      onError: function (err: any) {
        console.log(err);
      },
    })
    .render("#paypalButton");
};
