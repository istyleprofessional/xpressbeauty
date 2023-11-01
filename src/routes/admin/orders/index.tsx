import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { getOrdersService } from "~/express/services/order.service";

export const useOrderTableData = routeLoader$(
  async ({ cookie, redirect, url }) => {
    const page = url.searchParams.get("page") ?? "1";
    const token = cookie.get("token")?.value;
    if (!token) {
      throw redirect(301, "/admin");
    }
    try {
      const verified: any = jwt.verify(
        token,
        import.meta.env.VITE_JWTSECRET ?? ""
      );
      if (!verified) {
        throw redirect(301, "/admin");
      }
      if (verified.role !== "a") {
        throw redirect(301, "/admin");
      }
      const orders = await getOrdersService(parseInt(page));
      if (orders.status === "success") {
        return { status: orders.status, res: JSON.stringify(orders) };
      } else {
        return { status: orders.status };
      }
    } catch (err) {
      throw redirect(301, "/admin");
    }
  }
);

export default component$(() => {
  const orders = useOrderTableData();
  let ordersData: any;
  if (orders.value?.res) {
    ordersData = JSON.parse(orders.value?.res ?? "[]");
  }
  return (
    <div class="flex flex-col w-full">
      <table class="table-auto w-full">
        <thead>
          <tr>
            <th class="px-4 py-2">Order No</th>
            <th class="px-4 py-2">Customer Address</th>
            <th class="px-4 py-2">Total</th>
            <th class="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {ordersData?.request?.map((order: any, index: number) => {
            return (
              <tr key={index}>
                <td class="border px-4 py-2 text-center">
                  {order.order_number}
                </td>
                <td class="border px-4 py-2 text-center">
                  <span>{order?.shippingAddress?.addressLine1 ?? ""}</span>
                  {", "}
                  <span>{order?.shippingAddress?.city ?? ""}</span>
                  {", "}
                  <span>{order?.shippingAddress?.country ?? ""}</span>
                </td>
                <td class="border px-4 py-2 text-center">
                  {order?.totalPrice?.toLocaleString("en-US", {
                    style: "currency",
                    currency: "CAD",
                  })}
                </td>
                <td class="border px-4 py-2 text-center">
                  {order?.orderStatus ?? ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
