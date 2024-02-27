import { component$, $, useSignal } from "@builder.io/qwik";
import {
  routeLoader$,
  server$,
  useLocation,
  useNavigate,
} from "@builder.io/qwik-city";
import { Image } from "@unpic/qwik";
import Stripe from "stripe";
import {
  CheckOrderIcon,
  MoreAdminIcon,
  OrderFilterIcon,
} from "~/components/shared/icons/icons";
import {
  getOrderByOrderIdService,
  getOrdersService,
  updateOrderStatus,
  updatePaymentOrderStatus,
} from "~/express/services/order.service";
import { sendShippedEmail } from "~/utils/sendShippedEmail";

export const useOrderTableData = routeLoader$(async ({ url }) => {
  const search = url.searchParams.get("search") ?? "";
  const page = url.searchParams.get("page") ?? "1";
  const orders = await getOrdersService(parseInt(page), search.trim());
  if (orders.status === "success") {
    return { status: orders.status, res: JSON.stringify(orders) };
  } else {
    return { status: orders.status };
  }
});

export const sendShippedEmailServer = server$(async function (data: any) {
  const getOrder = await getOrderByOrderIdService(data.orderId);
  if (getOrder.status === "error")
    return { status: "error", message: "Order not found" };
  const order = getOrder?.request;
  const orderNo = order?.order_number;
  await sendShippedEmail(
    data.email,
    data.fullName,
    data.shippingAddress,
    data.selectedProducts,
    data.trackingNumber,
    data.trackingCompanyName,
    data.trackingLink,
    orderNo ?? ""
  );
  const updateOrderStatusreq = await updateOrderStatus(data.orderId, "Shipped");
  if (updateOrderStatusreq.status === "error")
    return { status: "error", message: "Order status not updated" };
  return {
    status: "success",
    message: JSON.stringify(updateOrderStatusreq.request),
  };
});

export const updateOrderStatusServer = server$(async function (
  orderId: string,
  status: string
) {
  const updateOrderStatusreq = await updateOrderStatus(orderId, status);
  if (updateOrderStatusreq.status === "error")
    return { status: "error", message: "Order status not updated" };
  return {
    status: "success",
    message: JSON.stringify(updateOrderStatusreq.request),
  };
});

export const capturePaymentServer = server$(async function (
  paymentIntent: string,
  orderId: string
) {
  const stripe = new Stripe(this.env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "");
  const payment = await stripe.paymentIntents.capture(paymentIntent);
  if (payment.status === "succeeded") {
    const updateOrderStatusreq = await updatePaymentOrderStatus(orderId, true);
    if (updateOrderStatusreq.status === "error")
      return { status: "error", message: "Order status not updated" };
    return {
      status: "success",
      message: JSON.stringify(updateOrderStatusreq.request),
    };
  } else {
    return { status: "error", message: "Payment not captured" };
  }
});

export const cancelPaymentServer = server$(async function (
  paymentIntent: string,
  orderId: string
) {
  const stripe = new Stripe(this.env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "");
  const payment = await stripe.paymentIntents.cancel(paymentIntent);
  if (payment.status === "canceled") {
    const updateOrderStatusreq = await updatePaymentOrderStatus(
      orderId,
      false,
      "Cancelled"
    );
    if (updateOrderStatusreq.status === "error")
      return { status: "error", message: "Order status not updated" };
    return {
      status: "success",
      message: JSON.stringify(updateOrderStatusreq.request),
    };
  } else {
    return { status: "error", message: "Payment not canceled" };
  }
});

export default component$(() => {
  const loc = useLocation();
  const orders = useOrderTableData();
  const ordersData = JSON.parse(orders.value?.res ?? "[]");
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
  const selectedProducts = useSignal<any>([]);
  const nav = useNavigate();

  const handleSearchOrders = $(async (_: Event, elem: HTMLInputElement) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", "1");
    url.searchParams.set("search", elem.value.trim());
    nav(url.toString());
  });

  const handleStatusChanged = $(
    async (
      status: string,
      email: string,
      id: string,
      products?: any,
      shippingAddress?: any,
      user?: any
    ) => {
      console.log(status, email, id, products, shippingAddress, user);
      if (status === "Shipped") {
        (document?.getElementById("my_modal_1") as any)?.showModal();
        orderStatus.value = status;
        userEmail.value = email;
        orderId.value = id.toString();
        orderDetail.value = {
          products: products,
          shippingAddress: shippingAddress,
          fullName: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`,
        };
      } else {
        const updateOrderStatusreq = await updateOrderStatusServer(id, status);
        if (updateOrderStatusreq.status === "error") {
          alert(updateOrderStatusreq.message);
          location.reload();
        } else {
          const result = JSON.parse(updateOrderStatusreq.message);
          ordersData.request = ordersData.request.map((order: any) => {
            if (order._id === result._id) {
              order.orderStatus = result.orderStatus;
            }
            return order;
          });
          alert("Order status updated successfully");
        }
      }
    }
  );

  const handleConfirmStatusChange = $(() => {
    (document?.getElementById("my_modal_1") as any)?.close();
    if (orderStatus.value === "Shipped")
      (document?.getElementById("my_modal_2") as any)?.showModal();
  });

  const handleSendTrackingNumber = $(async () => {
    (document?.getElementById("my_modal_2") as any)?.close();
    (document?.getElementById("my_modal_3") as any)?.showModal();
  });

  const handleSendTrackingNumberConfirm = $(async () => {
    (document?.getElementById("my_modal_3") as any)?.close();
    const sendShippedEmailreq = await sendShippedEmailServer({
      email: userEmail.value.trim(),
      orderId: orderId.value,
      trackingNumber: trackingNumber.value,
      trackingCompanyName: trackingCompanyName.value,
      trackingLink: trackingLink.value,
      selectedProducts: selectedProducts.value,
      shippingAddress: orderDetail.value?.shippingAddress,
      fullName: `${orderDetail.value?.user?.firstName ?? ""} ${
        orderDetail.value?.user?.lastName ?? ""
      }`,
    });
    // console.log(sendShippedEmailreq);
    if (sendShippedEmailreq.status === "error") {
      alert(sendShippedEmailreq.message);
      location.reload();
    } else {
      alert("Order status updated successfully");
    }
  });

  const handleCapturePayments = $(async (order: any) => {
    const confirm = window.confirm("Are you sure you want to capture payment?");
    if (!confirm) return;
    if (order.payment_intent) {
      const callStripe = await capturePaymentServer(
        order.payment_intent,
        order._id
      );
      if (callStripe.status === "error") {
        alert(callStripe.message);
      } else {
        const result = JSON.parse(callStripe.message);
        ordersData.request = ordersData.request.map((order: any) => {
          if (order._id === result._id) {
            order.paid = result.paid;
          }
          return order;
        });
        alert("Payment captured successfully");
        location.reload();
      }
    }
  });

  const handleCancelPayment = $(async (order: any) => {
    const answer = confirm("Are you sure you want to cancel the payment?");
    if (!answer) return;
    if (order.payment_intent) {
      const callStripe = await cancelPaymentServer(
        order.payment_intent,
        order._id
      );
      if (callStripe.status === "error") {
        alert(callStripe.message);
      } else {
        const result = JSON.parse(callStripe.message);

        ordersData.request = ordersData.request.map((order: any) => {
          if (order._id === result._id) {
            order.paid = result.paid;
          }
          return order;
        });
        alert("Payment cancelled successfully");
        location.reload();
      }
    }
  });

  return (
    <div class="flex flex-col w-full h-full bg-[#F9FAFB]">
      <div class="flex flex-row gap-5 items-center">
        <h1 class="text-2xl font-bold p-2">Orders</h1>
        <input
          type="text"
          class="input input-bordered w-[20rem] m-2"
          placeholder="Search For Orders"
          onChange$={handleSearchOrders}
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
              <th>Payment Status</th>
              <th>Capture Payment</th>
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
                      {order?.user?.firstName ??
                        order?.dummyUser?.firstName ??
                        "Guest User"}{" "}
                      {order?.user?.lastName ??
                        order?.dummyUser?.lastName ??
                        ""}
                    </td>
                    <td>{order.order_number}</td>
                    <td>
                      <span>{order?.shippingAddress?.addressLine1}</span>
                      {", "}
                      <span>{order?.shippingAddress?.city}</span>
                      {", "}
                      <span>{order?.shippingAddress?.country}</span>
                      {", "}
                      <span>{order?.shippingAddress?.postalCode}</span>
                    </td>
                    <td>
                      {order?.totalInfo?.finalTotal?.toLocaleString("en-US", {
                        style: "currency",
                        currency:
                          order?.totalInfo?.currency?.toUpperCase() ?? "CAD",
                      }) ??
                        order?.totalPrice?.toLocaleString("en-US", {
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
                            : order.orderStatus === "Return"
                            ? "bg-[#FED7D7] text-[#B91C1C]"
                            : order.orderStatus === "Refund"
                            ? "bg-[#FED7D7] text-[#B91C1C]"
                            : "bg-[#D1FAE5] text-[#047857]"
                        } text-xs`}
                      >
                        {order.orderStatus}
                      </p>
                    </td>
                    <td>{order.paid === false ? "unpaid" : "paid"}</td>
                    <td class="flex flex-col md:flex-row gap-3 justify-center items-center w-full h-full">
                      <button
                        class="btn btn-sm btn-primary"
                        onClick$={() => handleCapturePayments(order)}
                        disabled={
                          order.paid ||
                          !order.payment_intent ||
                          order.payment_intent === "" ||
                          order.orderStatus === "Cancelled"
                        }
                      >
                        Capture
                      </button>
                      <button
                        class="btn btn-sm btn-ghost"
                        disabled={
                          order.paid ||
                          !order.payment_intent ||
                          order.payment_intent === "" ||
                          order.orderStatus === "Cancelled"
                        }
                        onClick$={() => handleCancelPayment(order)}
                      >
                        Cancel
                      </button>
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
                              onClick$={() => {
                                console.log(order);
                                handleStatusChanged(
                                  "Shipped",
                                  order?.user?.email ??
                                    order?.dummyUser?.email ??
                                    "Not Found",
                                  order?._id,
                                  order?.products,
                                  order?.shippingAddress,
                                  order?.user ?? order?.dummyUser ?? {}
                                );
                              }}
                            >
                              Shipped
                            </button>
                          </li>
                          <li>
                            <button
                              onClick$={() =>
                                handleStatusChanged(
                                  "Pending",
                                  order?.user?.email,
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
                                  order?.user?.email,
                                  order?._id
                                )
                              }
                            >
                              Return
                            </button>
                          </li>
                          <li>
                            <button
                              onClick$={() =>
                                handleStatusChanged(
                                  "Refund",
                                  order?.user?.email,
                                  order?._id
                                )
                              }
                            >
                              Refund
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
            onClick$={() => {
              const url = new URL(window.location.href);
              url.searchParams.set(
                "page",
                (parseInt(currentPageNo) - 1).toString()
              );
              location.href = url.toString();
            }}
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
            onClick$={() => {
              const url = new URL(window.location.href);
              url.searchParams.set(
                "page",
                (parseInt(currentPageNo) + 1).toString()
              );
              location.href = url.toString();
            }}
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
          <dialog id="my_modal_3" class="modal">
            <div class="modal-box">
              <h3 class="font-bold text-lg">Products To Be Shipped</h3>
              <p class="py-4">Please select the products</p>
              <div class="modal-action">
                <form method="dialog" class="w-full">
                  <div class="flex flex-col gap-3 w-full">
                    {orderDetail.value?.products?.map(
                      (product: any, index: number) => {
                        return (
                          <div
                            class="flex flex-row gap-2 items-center"
                            key={index}
                          >
                            <input
                              type="checkbox"
                              class="checkbox"
                              onChange$={(e: any) => {
                                if (e.target.checked) {
                                  selectedProducts.value = [
                                    ...selectedProducts.value,
                                    product,
                                  ];
                                } else {
                                  selectedProducts.value =
                                    selectedProducts.value.filter(
                                      (item: any) => item.id !== product.id
                                    );
                                }
                              }}
                            />
                            <label>
                              {product.product_name}
                              {product?.id?.includes(".")
                                ? ` - ${product?.id?.split(".")[1]}`
                                : ""}
                            </label>
                          </div>
                        );
                      }
                    )}
                    <div class="flex flex-row gap-2">
                      <button
                        class="btn"
                        onClick$={() => {
                          orderId.value = "";
                          userEmail.value = "";
                          orderStatus.value = "";
                          orderDetail.value = {};
                        }}
                      >
                        Close
                      </button>
                      <button
                        class="btn btn-primary"
                        onClick$={handleSendTrackingNumberConfirm}
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
                {/** Customer Details */}
                <div class="flex flex-row justify-between items-center p-2">
                  <p class="text-xs">
                    Customer Name:{" "}
                    {orderDetail.value?.user?.firstName ??
                      orderDetail.value?.dummyUser?.firstName ??
                      "Guest User"}{" "}
                    {orderDetail.value?.user?.lastName ??
                      orderDetail.value?.dummyUser?.lastName ??
                      ""}
                  </p>
                  <p class="text-xs">
                    Customer Email:{" "}
                    {orderDetail.value?.user?.email ??
                      orderDetail.value?.dummyUser?.email ??
                      "Not Found"}
                  </p>
                  <p class="text-xs">
                    Customer Phone:{" "}
                    {orderDetail.value?.user?.phoneNumber ??
                      orderDetail.value?.dummyUser?.phoneNumber ??
                      "Not Found"}
                  </p>
                </div>
                <div class="flex flex-row justify-between items-center p-2">
                  <p class="text-xs">
                    Order No: {orderDetail.value?.order_number}
                  </p>
                  <p class="text-xs">
                    Order Date: {orderDetail.value?.createdAt}
                  </p>
                </div>
                <div class="flex flex-row justify-between items-center p-2">
                  <p class="text-xs">
                    Order Note:{" "}
                    <span class=" font-bold">{orderDetail.value?.notes}</span>
                  </p>
                </div>
                <div class="overflow-x-auto h-[80%]">
                  <table class="table table-pin-rows table-sm h-full">
                    <thead>
                      <tr class="bg-[#F1F5F9]">
                        <th>Image</th>
                        <th>Product</th>
                        <th>Product Id</th>
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
                                <Image
                                  src={
                                    product?.product_img?.includes("http")
                                      ? product?.product_img
                                      : product?.product_img?.replace(".", "")
                                  }
                                  alt=""
                                  class="w-24 h-24"
                                />
                              </td>
                              <td>{product?.product_name}</td>
                              <td>
                                {product?.id?.includes(".")
                                  ? `${product?.id?.split(".")[0]}.0${
                                      product?.variation_name ?? ""
                                    }`
                                  : product?.id}
                              </td>
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
