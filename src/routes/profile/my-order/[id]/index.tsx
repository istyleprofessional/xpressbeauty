import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { getDummyCustomer } from "~/express/services/dummy.user.service";
import { getOrderByOrderIdService } from "~/express/services/order.service";
import { getUserById } from "~/express/services/user.service";

export const useGetMyOrderDetails = routeLoader$(
  async ({ cookie, params, env }) => {
    const token = cookie.get("token")?.value;
    if (!token) {
      return JSON.stringify({ status: "failed", data: {} });
    }
    try {
      const verified: any = jwt.verify(token, env.get("VITE_JWTSECRET") ?? "");
      if (!verified) {
        return JSON.stringify({ status: "failed", data: {} });
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
        userName: `${user.result?.firstName ?? ""} ${user.result?.lastName ?? ""
          }`,
      };
      return JSON.stringify({ status: "success", data: data });
    } catch (err) {
      return JSON.stringify({ status: "failed", data: {} });
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
  const date = new Date(order.createdAt);
  return (

    <div class="card shadow-lg">
      <div class="card-body justify-center ">
        <div class="flex flex-col gap-2 justify-center">    
          <div>
            <span class="font-bold text-black text-xl uppercase">Order No: {order.order_number}</span>

          </div>
          <div class="grid grid-flow-row-dense gap-3 pl-6 md:grid-cols-4 grid-cols-2">
            <div class="">
              <span>
                Order Number:

              </span>
            </div>
            <div class="md:pt-6">
              <span class="font-bold uppercase">
                {order.order_number}
              </span>

            </div>
          </div>
          <div class="grid grid-flow-row-dense gap-3 pl-6 md:grid-cols-4 grid-cols-2">
            <div class="">
              <span>
                Order Date:

              </span>
            </div>
            <div class="">
              <span class="font-bold">
                {date.toLocaleString("en-US", {
                  timeZone: "America/Toronto",
                })}
              </span>

            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2 justify-center  py-8">
          {/* <h2 class="text-black text-xl font-bold"> Order No: {order.order_number}</h2> */}
          <div>
            <span class="font-bold text-black text-xl ">Shipping Details: </span>

          </div>




          <div class="grid grid-flow-row-dense gap-3 pl-6 md:grid-cols-4 grid-cols-2">
            <div class="">
              <span>

                Address: 
              </span>
            </div>
            <div class="">
              <span class="font-bold">
                <span>{order.shippingAddress.addressLine1} { " " }</span>
                <span>{order.shippingAddress.postalCode} { " " }</span>
                <span>{order.shippingAddress.city} { " " }</span>
                <span>{order.shippingAddress.country} { " " }</span>
              </span>

            </div>
          </div>


        </div>

        <div class="flex flex-col gap-2 justify-center  py-8">
          {/* <h2 class="text-black text-xl font-bold"> Order No: {order.order_number}</h2> */}
          <div>
            <span class="font-bold text-black text-xl ">Payment Details:</span>

          </div>




          <div class="grid grid-flow-row-dense gap-3 pl-6 md:grid-cols-4 grid-cols-2">
            <div class="">
              <span>

                Subtotal:
              </span>
            </div>
            <div class="">
              <span class="font-bold">
                {subTotal.toLocaleString("en-US", {
                  style: "currency",
                  currency: "CAD",
                })}

              </span>

            </div>
          </div>
          <div class="grid grid-flow-row-dense gap-3 pl-6 md:grid-cols-4 grid-cols-2">
            <div class="">
              <span>

                HST
              </span>
            </div>
            <div class="">
              <span class="font-bold">
                {hst.toLocaleString("en-US", {
                  style: "currency",
                  currency: "CAD",
                })}

              </span>

            </div>
          </div>
          <div class="grid grid-flow-row-dense gap-3 pl-6 md:grid-cols-4 grid-cols-2">
            <div class="">
              <span>

                Shipping:
              </span>
            </div>
            <div class="">
              <span class="font-bold">
                {parseFloat(order.totalPrice) > 150 ? "Free" : "CA$15.00"}

              </span>

            </div>
          </div>
          <div class="grid grid-flow-row-dense gap-3 pl-6 md:grid-cols-4 grid-cols-2">
            <div class="">
              <span>

                Total:
              </span>
            </div>
            <div class="">
              <span class="font-bold">

                {order.totalPrice.toLocaleString("en-US", {
                  style: "currency",
                  currency: "CAD",
                })}
              </span>

            </div>
          </div>


        </div>

        <div class="flex flex-col gap-2 justify-center 
        ">
          {/* <h2 class="text-black text-xl font-bold"> Order No: {order.order_number}</h2> */}
          <div>
            <span class="font-bold text-black text-xl ">Product Details:</span>

          </div>


          {order.products.map((product: any, index: number) => {
            return (
              <div class="border border-[#ced4da] shadow-md rounded-md py-6
              "
              key={index}>

                <div class="grid grid-flow-row-dense gap-3 pl-6 md:grid-cols-4 grid-cols-2">
                  <div class="">
                    <span>

                      Product Image:
                    </span>
                  </div>
                  <div class="">
                   
                      <img
                        src={product.product_img}
                        alt={product.product_name}
                        class="w-20 h-20"
                      />
                    

                  </div>
                </div>
                <div class="grid grid-flow-row-dense gap-3 pl-6 md:grid-cols-4 grid-cols-2">
                  <div class="">
                    <span>

                      Product Name:
                    </span>
                  </div>
                  <div class="">
                    <span class="font-bold">
                    {product.product_name}

                    </span>

                  </div>
                </div>
                <div class="grid grid-flow-row-dense gap-3 pl-6 md:grid-cols-4 grid-cols-2">
                  <div class="">
                    <span>

                      Product Variation:
                    </span>
                  </div>
                  <div class="">
                    <span class="font-bold">
                      {product.variation_name}

                    </span>

                  </div>
                </div>
                <div class="grid grid-flow-row-dense gap-3 pl-6 md:grid-cols-4 grid-cols-2">
                  <div class="">
                    <span>
                      Product Price:
                    </span>
                  </div>
                  <div class="">
                    <span class="font-bold">

                      CA${product.price}
                    </span>

                  </div>
                </div>
                <div class="grid grid-flow-row-dense gap-3 pl-6 md:grid-cols-4 grid-cols-2">
                  <div class="">
                    <span>
                      Quanitity:
                    </span>
                  </div>
                  <div class="">
                    <span class="font-bold">

                      
                      {product.quantity}
                    </span>

                  </div>
                </div>
              </div>
            );
          })}
        </div>


      </div>

    </div>
  );
});
