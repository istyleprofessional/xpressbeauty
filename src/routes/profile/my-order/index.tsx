import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { getMyOrdersService } from "~/express/services/order.service";

export const useGetMyOrders = routeLoader$(async ({ cookie, redirect }) => {
  const token = cookie.get("token")?.value;
  if (!token) {
    throw redirect(301, "/login");
  }
  try {
    const verified: any = jwt.verify(token, process.env.JWTSECRET ?? "");
    if (!verified) {
      throw redirect(301, "/login");
    }
    const user_id = verified.user_id;
    const getMyOrders = await getMyOrdersService(user_id);
    return JSON.stringify(getMyOrders);
  } catch (err) {
    throw redirect(301, "/login");
  }
});

export default component$(() => {
  const myOrders = useGetMyOrders();
  const myOrdersData = JSON.parse(myOrders.value ?? "[]");

  return (
    <>
      <div class="card shadow-lg">
        <div class="card-body">
          <div class="flex flex-col gap-2">
            {myOrdersData.request.length === 0 && (
              <>
                {myOrdersData.request.map((order: any, index: number) => {
                  const order_date = new Date(order.createdAt);
                  return (
                    <div class="flex flex-col gap-4" key={index}>
                      <a
                        href={`/profile/my-order/${order._id.toString()}`}
                        class="flex flex-row justify-center items-center gap-4 btn btn-ghost"
                      >
                        <div class="flex flex-col gap-3">
                          <p class="text-gray-600">
                            <span class="font-bold">Order No:</span>{" "}
                            {order.order_number}
                          </p>
                          <p class="text-gray-600">
                            <span class="font-bold">Order Date:</span>{" "}
                            {order_date.toLocaleString("en-US", {
                              timeZone: "America/Toronto",
                            })}
                          </p>
                        </div>
                        <div class="divider divider-horizontal"></div>
                        <p class="text-gray-600">
                          <span class="font-bold">Order Status:</span>{" "}
                          {order.orderStatus}
                        </p>
                        <div class="divider divider-horizontal"></div>

                        <p class="text-gray-600">
                          <span class="font-bold">Payment Status:</span>{" "}
                          {order.paymentStatus}
                        </p>
                        <div class="divider divider-horizontal"></div>
                        <p class="text-gray-600">
                          <span class="font-bold">Total:</span>{" "}
                          {order.totalPrice.toLocaleString("en-US", {
                            style: "currency",
                            currency: "CAD",
                          })}
                        </p>
                      </a>
                      <div class="divider divider-vertical"></div>
                    </div>
                  );
                })}
              </>
            )}
            {myOrdersData.request.length === 0 && (
              <>
                <div class="flex flex-col gap-4">
                  <p class="text-gray-600">No Orders Found</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
});
