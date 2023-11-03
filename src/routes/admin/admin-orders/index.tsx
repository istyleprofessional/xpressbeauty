import { component$, $, useSignal } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation } from "@builder.io/qwik-city";
import {
  CheckOrderIcon,
  MoreAdminIcon,
  OrderFilterIcon,
} from "~/components/shared/icons/icons";
import {
  getOrderByOrderIdService,
  getOrdersService,
  updateOrderStatus,
} from "~/express/services/order.service";
import { findUserByUserEmail } from "~/express/services/user.service";
import { sendShippedEmail } from "~/utils/sendShippedEmail";

export const useOrderTableData = routeLoader$(async ({ url }) => {
  const page = url.searchParams.get("page") ?? "1";
  const orders = await getOrdersService(parseInt(page));
  if (orders.status === "success") {
    return { status: orders.status, res: JSON.stringify(orders) };
  } else {
    return { status: orders.status };
  }
});

export const sendShippedEmailServer = server$(async function (data: any) {
  const getUser = await findUserByUserEmail(data.email);
  if (getUser.status === "error")
    return { status: "error", message: "User not found" };
  if (getUser.result?.length === 0)
    return { status: "error", message: "User not found" };
  const user = (getUser?.result ?? [])[0];
  const fullName = `${user?.firstName} ${user?.lastName}`;
  const shippingAddress = user?.generalInfo.address;
  const getOrder = await getOrderByOrderIdService(data.orderId);

  if (getOrder.status === "error")
    return { status: "error", message: "Order not found" };
  const order = getOrder?.request;
  const orderNo = order?.order_number;
  const products = order?.products;
  await sendShippedEmail(
    data.email,
    fullName,
    shippingAddress,
    products ?? [],
    data.trackingNumber,
    data.trackingCompanyName,
    data.trackingLink,
    orderNo ?? ""
  );
  const updateOrderStatusreq = await updateOrderStatus(data.orderId, "Shipped");
  if (updateOrderStatusreq.status === "error")
    return { status: "error", message: "Order status not updated" };
  return { status: "success", message: updateOrderStatusreq.request };
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
  const isOrderDetailsOpen = useSignal<boolean>(false);
  const orderDetail = useSignal<any>({});
  const trackingNumber = useSignal<string>("");
  const trackingCompanyName = useSignal<string>("");
  const trackingLink = useSignal<string>("");

  const handleStatusChanged = $((status: string, email: string, id: string) => {
    (document?.getElementById("my_modal_1") as any)?.showModal();
    orderStatus.value = status;
    userEmail.value = email;
    orderId.value = id.toString();
  });

  const handleConfirmStatusChange = $(() => {
    (document?.getElementById("my_modal_1") as any)?.close();
    if (orderStatus.value === "Shipped")
      (document?.getElementById("my_modal_2") as any)?.showModal();
  });

  const handleSendTrackingNumber = $(async () => {
    (document?.getElementById("my_modal_2") as any)?.close();
    const data = {
      email: userEmail.value,
      orderId: orderId.value,
      trackingNumber: trackingNumber.value,
      trackingCompanyName: trackingCompanyName.value,
      trackingLink: trackingLink.value,
    };
    await sendShippedEmailServer(data);
    window.location.reload();
  });

  return (
    <div class="flex flex-col w-full h-full bg-[#F9FAFB]">
      <div class="flex flex-row gap-5 items-center">
        <h1 class="text-2xl font-bold p-2">Orders</h1>
        <input
          type="text"
          class="input input-bordered w-[20rem] m-2"
          placeholder="Search For Orders"
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
                      <span>{order?.shippingAddress?.addressLine1}</span>
                      {", "}
                      <span>{order?.shippingAddress?.city}</span>
                      {", "}
                      <span>{order?.shippingAddress?.country}</span>
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
                                  order?.user?.email,
                                  order?._id
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
                                  "Pending",
                                  order?.user.email,
                                  order?._id
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
                                  order?.user.email,
                                  order?._id
                                )
                              }
                            >
                              Return
                            </button>
                          </li>
                        </ul>
                      </div>
                      <button
                        class="btn btn-ghost btn-xs"
                        onClick$={() => {
                          isOrderDetailsOpen.value = true;
                          orderDetail.value = order;
                        }}
                      >
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
                Are you sure you want to change the order status to{" "}
                {orderStatus.value}?
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
          <dialog id="my_modal_2" class="modal">
            <div class="modal-box">
              <h3 class="font-bold text-lg">Tracking Details!</h3>
              <p class="py-4">Please enter the tracking number?</p>
              <div class="modal-action">
                <form method="dialog" class="w-full">
                  <div class="flex flex-col gap-3 w-full">
                    <input
                      type="text"
                      class="input input-bordered w-full"
                      placeholder="Company Name"
                      onChange$={(e: any) => {
                        trackingCompanyName.value = e.target.value;
                      }}
                    />
                    <input
                      type="text"
                      class="input input-bordered w-full"
                      placeholder="Tracking Number"
                      onChange$={(e: any) => {
                        trackingNumber.value = e.target.value;
                      }}
                    />
                    <input
                      type="text"
                      class="input input-bordered w-full"
                      placeholder="Tracking Link"
                      onChange$={(e: any) => {
                        trackingLink.value = e.target.value;
                      }}
                    />
                    <div class="flex flex-row gap-2">
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
                        onClick$={handleSendTrackingNumber}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </dialog>
          {/** create a card with order details from orderDetail signal */}
          {isOrderDetailsOpen.value && (
            <div class="fixed inset-0 z-[100] bg-[#00000080] flex justify-center items-center">
              <div class="bg-[#fff] w-[80%] h-[80%] rounded-md">
                <div class="flex flex-row justify-between items-center p-2">
                  <h1 class="text-xl font-bold">Order Details</h1>
                  <button
                    class="btn btn-ghost btn-xs"
                    onClick$={() => {
                      isOrderDetailsOpen.value = false;
                      orderDetail.value = {};
                    }}
                  >
                    Close
                  </button>
                </div>
                <div class="flex flex-row justify-between items-center p-2">
                  <p class="text-xs">
                    Order No: {orderDetail.value?.order_number}
                  </p>
                  <p class="text-xs">
                    Order Date: {orderDetail.value?.createdAt}
                  </p>
                </div>
                <div class="overflow-x-auto h-[80%]">
                  <table class="table table-pin-rows table-sm h-full">
                    <thead>
                      <tr class="bg-[#F1F5F9]">
                        <th>Image</th>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Sub Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetail.value?.products?.map(
                        (product: any, index: number) => {
                          const total =
                            parseFloat(product?.price) * product?.quantity;
                          const subTotal = total.toLocaleString("en-US", {
                            style: "currency",
                            currency: "CAD",
                          });
                          return (
                            <tr key={index}>
                              <td>
                                <img
                                  src={product?.product_img}
                                  alt=""
                                  class="w-24 h-24"
                                />
                              </td>
                              <td>{product?.product_name}</td>
                              <td>{product?.price}</td>
                              <td>{product?.quantity}</td>
                              <td>{subTotal}</td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
