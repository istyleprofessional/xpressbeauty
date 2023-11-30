import { component$ } from "@builder.io/qwik";
import { routeLoader$, useNavigate } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { getMyOrdersService } from "~/express/services/order.service";

export const useGetMyOrders = routeLoader$(
  async ({ cookie, redirect, env }) => {
    const token = cookie.get("token")?.value;

    if (!token) {
      throw redirect(301, "/login");
    }
    try {
      const verified: any = jwt.verify(token, env.get("VITE_JWTSECRET") ?? "");
      if (!verified) {
        throw redirect(301, "/login");
      }
      const user_id = verified.user_id;
      const getMyOrders = await getMyOrdersService(user_id);
      return JSON.stringify(getMyOrders);
    } catch (err) {
      throw redirect(301, "/login");
    }
  }
);

export default component$(() => {
  const myOrders = useGetMyOrders();
  const myOrdersData = JSON.parse(myOrders.value ?? "[]");
  const nav = useNavigate();

  return (
    <>
      <div class="card shadow-lg">
        <div class="card-body">
          {/* <div class="flex flex-col gap-2">
            {myOrdersData.request.length > 0 && (
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
                  <p class="text-black">No Orders Found</p>
                </div>
              </>
            )}
          </div> */}
          {/* <div class="flex flex-col gap-2"> */}
          <div class="overflow-x-scroll w-full">
            <table class="table table-pin-rows table-sm h-full w-full">
              <thead class="">

                <tr class="bg-[#F1F5F9] text-bold text-lg ">

                  <th>Order Number</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Payment Status</th>
                  <th>Shipping Status</th>

                  <th></th>
                </tr>
              </thead>
              <tbody>
                {myOrdersData?.request?.length > 0 &&
                  myOrdersData?.request?.map((order: any, index: number) => {
                    const date = new Date(order.createdAt);
                    // useVisibleTask$(() => {
                    //   console.log(order);
                    // });
                    return (

                      <tr key={index} onClick$={() => {
                         nav(`/profile/my-order/${order._id.toString()}`);
                      }} class="cursor-pointer">
                        {/* <a
                          href={`/profile/my-order/${order._id.toString()}`}
                          class="flex flex-row justify-center items-center gap-4 btn btn-ghost"
                        > */}

                          <td class="uppercase">{order.order_number}</td>

                          <td>
                            {order.totalPrice.toLocaleString("en-US", {
                              style: "currency",
                              currency: "CAD",
                            })}
                          </td>
                          <td>{date.toLocaleString("en-US", {
                            timeZone: "America/Toronto",
                          })}</td>

                          <td>
                            <p class=" badge text-[#013220] font-bold">Success</p>
                            
                          </td>
                          <td>
                            <p
                              class={`badge ${order.orderStatus === "Pending"
                                ? "bg-[#FEF9C3] text-[#CA8A04]"
                                : order.orderStatus === "Shipped"
                                  ? "bg-[#E0F2FE] text-[#0EA5E9]"
                                  : order.orderStatus === "Completed"
                                    ? "bg-[#C6F6D5] text-[#059669]"
                                    : "bg-[#FED7D7] text-[#B91C1C]"
                                } text-xs`}
                            >
                              {order.orderStatus}
                            </p>
                          </td>
                        {/* </a> */}

                      </tr>
                    );
                  })}
                {myOrdersData?.request?.length === 0 && (
                  <tr>
                    <td colSpan={8} class="text-center">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          {/* </div> */}
        </div>
      </div>
    </>
  );
});
