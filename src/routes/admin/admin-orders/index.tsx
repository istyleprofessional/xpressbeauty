import { component$, $, useSignal } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import {
  CheckOrderIcon,
  MoreAdminIcon,
  OrderFilterIcon,
} from "~/components/shared/icons/icons";
import { getOrdersService } from "~/express/services/order.service";

export const useOrderTableData = routeLoader$(async ({ url }) => {
  const page = url.searchParams.get("page") ?? "1";
  const orders = await getOrdersService(parseInt(page));
  if (orders.status === "success") {
    return { status: orders.status, res: JSON.stringify(orders) };
  } else {
    return { status: orders.status };
  }
});

export default component$(() => {
  const loc = useLocation();
  const orders = useOrderTableData();
  let ordersData: any;
  if (orders.value?.res) {
    ordersData = JSON.parse(orders.value?.res ?? "[]");
  }
  const currentPageNo = loc.url.searchParams.get("page") ?? "1";
  const total = ordersData?.total ?? 0;
  const totalPages = Math.ceil(total / 20);
  const orderStatus = useSignal<string>("");
  const userEmail = useSignal<string>("");
  const orderId = useSignal<string>("");
  const searchValue = loc.url.searchParams.get("search") ?? "";

  const handleStatusChanged = $((status: string, email: string, id: string) => {
    (document?.getElementById("my_modal_1") as any)?.showModal();
    orderStatus.value = status;
    userEmail.value = email;
    orderId.value = id.toString();
  });

  const handleConfirmStatusChange = $(() => {
    (document?.getElementById("my_modal_1") as any)?.close();
  });

  // const handleSearchOrders = $(() => {
  //   const
  // });

  return (
    <div class="flex flex-col w-full h-full bg-[#F9FAFB]">
      <div class="flex flex-row gap-5 items-center">
        <h1 class="text-2xl font-bold p-2">Orders</h1>
        <input
          type="text"
          class="input input-bordered w-[20rem] m-2"
          placeholder="Search For Orders"
          // onInput$={handleSearchOrders}
          value={searchValue}
        />
      </div>

      <div class="overflow-x-auto h-[80vh] bg-[#FFF]">
        <table class="table table-pin-rows table-sm h-full">
          <thead>
            <tr>
              {" "}
              <th>
                <label>
                  <input type="checkbox" class="checkbox" />
                </label>
              </th>
              <th align="right" colSpan={7}>
                <button class="flex flex-row gap-2 items-center btn btn-ghost">
                  <OrderFilterIcon />
                </button>
              </th>
            </tr>
            <tr class="bg-[#F1F5F9]">
              <th></th>
              <th>User</th>
              <th>Order No.</th>
              <th>Address</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ordersData?.request?.length > 0 &&
              ordersData?.request?.map((order: any, index: number) => {
                const date = new Date(order.createdAt);
                return (
                  <tr key={index}>
                    <th>
                      <label>
                        <input type="checkbox" class="checkbox" />
                      </label>
                    </th>
                    <td>
                      {order?.user?.firstName} {order?.user?.lastName}
                    </td>
                    <td>{order.order_number}</td>
                    <td>
                      <span>{order.shippingAddress.addressLine1}</span>
                      {", "}
                      <span>{order.shippingAddress.city}</span>
                      {", "}
                      <span>{order.shippingAddress.country}</span>
                    </td>
                    <td>
                      {order.totalPrice.toLocaleString("en-US", {
                        style: "currency",
                        currency: "CAD",
                      })}
                    </td>
                    <td>
                      {date.toLocaleString("en-CA", {
                        timeZone: "America/Toronto",
                      })}
                    </td>
                    <td>
                      <p
                        class={`badge ${
                          order.orderStatus === "Pending"
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
                    <td>
                      <div class="dropdown dropdown-end">
                        <label tabIndex={0} class="btn m-1 btn-ghost btn-xs">
                          <MoreAdminIcon />
                        </label>
                        <ul
                          tabIndex={0}
                          class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                        >
                          <li>
                            <button
                              onClick$={() =>
                                handleStatusChanged(
                                  "Shipped",
                                  order.user.email,
                                  order._id
                                )
                              }
                            >
                              Shipped
                            </button>
                          </li>
                          <li>
                            <button
                              onClick$={() =>
                                handleStatusChanged(
                                  "Completed",
                                  order.user.email,
                                  order._id
                                )
                              }
                            >
                              Completed
                            </button>
                          </li>
                          <li>
                            <button
                              onClick$={() =>
                                handleStatusChanged(
                                  "Pending",
                                  order.user.email,
                                  order._id
                                )
                              }
                            >
                              Pending
                            </button>
                          </li>
                          <li>
                            <button
                              onClick$={() =>
                                handleStatusChanged(
                                  "Return",
                                  order.user.email,
                                  order._id
                                )
                              }
                            >
                              Return
                            </button>
                          </li>
                        </ul>
                      </div>
                      <button class="btn btn-ghost btn-xs">
                        <CheckOrderIcon />
                      </button>
                    </td>
                  </tr>
                );
              })}
            {ordersData?.request?.length === 0 && (
              <tr>
                <td colSpan={8} class="text-center">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div class="bg-[#fff]">
        <div class="flex flex-row justify-between gap-2 p-2">
          <button
            class={`btn btn-ghost btn-sm ${
              currentPageNo === "1" ? "text-[#D1D5DB]" : "text-[#7C3AED]"
            } text-xs`}
            disabled={currentPageNo === "1"}
          >
            Previous
          </button>
          <p class="text-xs">
            {currentPageNo} of {totalPages}
          </p>
          <button
            class={`btn btn-ghost btn-sm text-xs ${
              currentPageNo === totalPages.toString()
                ? "text-[#D1D5DB]"
                : "text-[#7C3AED]"
            }`}
            disabled={currentPageNo === totalPages.toString()}
          >
            Next
          </button>
          <dialog id="my_modal_1" class="modal">
            <div class="modal-box">
              <h3 class="font-bold text-lg">Change Order Status!</h3>
              <p class="py-4">
                Are you sure you want to change the order status?
              </p>
              <div class="modal-action">
                <form method="dialog">
                  <button
                    class="btn"
                    onClick$={() => {
                      orderId.value = "";
                      userEmail.value = "";
                      orderStatus.value = "";
                    }}
                  >
                    Close
                  </button>
                  <button
                    class="btn btn-primary"
                    onClick$={handleConfirmStatusChange}
                  >
                    Confirm
                  </button>
                </form>
              </div>
            </div>
          </dialog>
        </div>
      </div>
    </div>
  );
});
