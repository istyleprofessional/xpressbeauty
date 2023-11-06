import { component$, useSignal, $ } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation } from "@builder.io/qwik-city";
import {
  CheckOrderIcon,
  MoreAdminIcon,
  OrderFilterIcon,
} from "~/components/shared/icons/icons";
import { getCartsPerPageService } from "~/express/services/cart.service";
import { sendReminderEmailService } from "~/utils/sendReminderEmailService";

export const useCartTableData = routeLoader$(async ({ url }) => {
  const page = url.searchParams.get("page") ?? "1";
  const carts = await getCartsPerPageService(parseInt(page ?? "1"));
  if (carts.status === "success") {
    return { status: carts.status, res: JSON.stringify(carts) };
  } else {
    return { status: carts.status };
  }
});

export const sendReminderEmailServer = server$(async (data: any) => {
  await sendReminderEmailService(data);
  return "success";
});

export default component$(() => {
  const loc = useLocation();
  const carts = useCartTableData();
  let cartsData: any;
  if (carts.value?.res) {
    cartsData = JSON.parse(carts.value?.res ?? "[]");
  }
  const currentPageNo = loc.url.searchParams.get("page") ?? "1";
  const total = cartsData?.total ?? 0;
  const totalPages = Math.ceil(total / 20);
  const searchValue = loc.url.searchParams.get("search") ?? "";
  const isCartDetailsOpen = useSignal<boolean>(false);
  const cartDetail = useSignal<any>({});
  const isLoading = useSignal<boolean>(false);

  const sendReminderEmail = $(
    async (
      email: string,
      name: string,
      totalQuantity: number,
      products: any,
      _id: string,
      isDummy: boolean
    ) => {
      const data = {
        email,
        name,
        totalQuantity,
        products,
        _id,
        isDummy,
      };
      if (email) {
        isLoading.value = true;
        await sendReminderEmailServer(data);
        isLoading.value = false;
        alert("Email sent successfully");
      } else {
        alert("Email is not available");
      }
    }
  );

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
              <th>Email</th>
              <th>Total Quantity</th>
              <th>Created At</th>
              <th>Last Updated At</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cartsData?.result?.length > 0 &&
              cartsData?.result?.map((cart: any, index: number) => {
                const createdDate = new Date(cart.createdAt);
                const updatedDate = new Date(cart.updatedAt);
                return (
                  <tr key={index}>
                    <th>
                      <label>
                        <input type="checkbox" class="checkbox" />
                      </label>
                    </th>
                    <td>
                      {cart?.user?.firstName ||
                        (cart?.dummyUser?.firstName ?? "Unkown")}{" "}
                      {cart?.user?.lastName ||
                        (cart?.dummyUser?.lastName ?? "")}
                    </td>
                    <td>
                      {cart?.user?.email ||
                        (cart?.dummyUser?.email ?? "Unkown")}
                    </td>
                    <td>{cart?.totalQuantity}</td>
                    <td>
                      {createdDate.toLocaleString("en-CA", {
                        timeZone: "America/Toronto",
                      })}
                    </td>
                    <td>
                      {updatedDate.toLocaleString("en-CA", {
                        timeZone: "America/Toronto",
                      })}
                    </td>
                    <td>
                      <button
                        class="btn btn-ghost btn-xs"
                        onClick$={() => {
                          isCartDetailsOpen.value = true;
                          cartDetail.value = cart;
                        }}
                      >
                        <CheckOrderIcon />
                      </button>
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
                                sendReminderEmail(
                                  cart?.user?.email ??
                                    cart?.dummyUser?.email ??
                                    "",
                                  `${
                                    cart?.user?.firstName ??
                                    cart?.dummyUser?.firstName ??
                                    ""
                                  } ${
                                    cart?.user?.lastName ??
                                    cart?.dummyUser?.lastName ??
                                    ""
                                  }`,
                                  cart?.totalQuantity ?? 0,
                                  cart?.products ?? [],
                                  cart?.userId ?? "",
                                  cart?.dummyUser ? true : false
                                );
                              }}
                            >
                              Sent Reminder Email
                            </button>
                          </li>
                          <li>
                            <button>Sent Reminder Text</button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })}
            {cartsData?.result?.length === 0 && (
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
          {isCartDetailsOpen.value && (
            <div class="fixed inset-0 z-[100] bg-[#00000080] flex justify-center items-center">
              <div class="bg-[#fff] w-[80%] h-[80%] rounded-md">
                <div class="flex flex-row justify-between items-center p-2">
                  <h1 class="text-xl font-bold">Order Details</h1>
                  <button
                    class="btn btn-ghost btn-xs"
                    onClick$={() => {
                      isCartDetailsOpen.value = false;
                      cartDetail.value = {};
                    }}
                  >
                    Close
                  </button>
                </div>
                <div class="flex flex-row justify-between items-center p-2">
                  <p class="text-xs">
                    Cart Date: {cartDetail.value?.createdAt}
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
                      {cartDetail.value?.products?.map(
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
