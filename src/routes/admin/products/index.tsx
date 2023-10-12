import { component$, $, useSignal } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import { getProductBySearchAdmin } from "~/express/services/product.service";
import {
  CheckOrderIcon,
  EditAdimnIcon,
  HideAdminIcon,
  OrderFilterIcon,
} from "~/components/shared/icons/icons";
import { putRequest } from "~/utils/fetch.utils";

export const useProductData = routeLoader$(async (ev) => {
  const pageNumber = parseInt(ev.url.searchParams.get("page") ?? "1");
  console.log("page", pageNumber);
  const search = ev.url.searchParams.get("search") ?? "";
  await connect();
  const products = await getProductBySearchAdmin(search, pageNumber);
  // const products = await get_products_service(token ?? "", pageNumber);
  // const count = await get_products_count_service(token ?? "");
  return JSON.stringify(products);
});

export const getProductsServer = server$(async function (value: string) {
  await connect();
  // const token = this.cookie.get("token")?.value;
  const page = this.url.searchParams.get("page") ?? "1";
  console.log("page", page);
  const products = await getProductBySearchAdmin(value, parseInt(page));
  return JSON.stringify(products);
});

export default component$(() => {
  // const productData = useSignal(JSON.parse(useProductData().value)?.);
  const json = JSON.parse(useProductData().value);
  const productData = useSignal(json.result);
  const count = useSignal(json.total);
  const loc = useLocation();
  const currentPageNo = loc.url.searchParams.get("page") ?? "1";
  const totalPages = Math.ceil(count.value / 20);
  const currentProduct = useSignal<any>({});
  const searchValue = loc.url.searchParams.get("search") ?? "";

  const handleVisibilityChange = $((product: any) => {
    (document?.getElementById("my_modal_1") as any)?.showModal();
    currentProduct.value = product;
  });

  const handleConfirmStatusChange = $(async () => {
    (document?.getElementById("my_modal_1") as any)?.close();
    const data = currentProduct.value;
    const url = `/api/admin/product/hide`;
    const request = await putRequest(url, data);
    const response = await request.json();
    if (response.status !== "success") {
      return;
    }
    productData.value = productData.value.map((product: any) => {
      if (product._id === data._id) {
        product.isHidden = response.result.isHidden;
      }
      return product;
    });
    currentProduct.value = {};
  });

  const handleSearchProducts = $(async (e: any) => {
    const value = e.target.value;
    const getProducts = await getProductsServer(value);
    const jsonRes = JSON.parse(getProducts);
    productData.value = jsonRes.result;
    count.value = jsonRes.total;
    const url = new URL(window.location.href);
    url.searchParams.set("page", "1");
    url.searchParams.set("search", value);
    history.pushState({}, "", url.toString());
  });

  return (
    <div class="flex flex-col w-full h-full bg-[#F9FAFB]">
      <div class="flex flex-row gap-5 items-center">
        <h1 class="text-2xl font-bold p-2">Products</h1>
        <input
          type="text"
          class="input input-bordered w-[20rem] m-2"
          placeholder="Search For Products"
          onInput$={handleSearchProducts}
          value={searchValue}
        />
      </div>

      <div class="overflow-x-auto h-[80vh] bg-[#FFF]">
        <table class="table table-pin-rows h-full">
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
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Item Number</th>
              <th>SKU</th>
              <th>Visibility</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {productData.value.map((product: any, index: number) => {
              return (
                <tr key={index}>
                  <th>
                    <label>
                      <input type="checkbox" class="checkbox" />
                    </label>
                  </th>
                  <th>
                    <img
                      src={product.imgs[0]}
                      class="w-12 h-12 object-contain"
                      onError$={(_, element: HTMLImageElement) => {
                        element.src = "/placeholder.webp";
                      }}
                    />
                  </th>
                  <th>{product.product_name}</th>
                  <th>{product.categories.join(" - ")}</th>
                  <th>{product.item_no}</th>
                  <th>{product.sku}</th>
                  <th>
                    <p
                      class={`badge ${
                        !product.isHidden
                          ? "bg-[#D1FAE5] text-[#059669]"
                          : "bg-[#FEF2F2] text-[#DC2626]"
                      }`}
                    >
                      {!product.isHidden ? "Active" : "In Active"}
                    </p>
                  </th>
                  <th>
                    <button
                      class="btn btn-ghost btn-sm text-xs"
                      onClick$={() => handleVisibilityChange(product)}
                    >
                      {!product.isHidden ? (
                        <CheckOrderIcon />
                      ) : (
                        <HideAdminIcon />
                      )}
                    </button>
                    <a
                      class="btn btn-ghost btn-sm text-xs"
                      href={`/admin/products/${product?._id?.toString()}`}
                    >
                      <EditAdimnIcon />
                    </a>
                  </th>
                </tr>
              );
            })}
            {productData.value.length === 0 && (
              <tr>
                <td colSpan={8} class="text-center">
                  No products found
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
              <h3 class="font-bold text-lg">Change Product Visibility!</h3>
              <p class="py-4">
                Are you sure you want change{" "}
                {currentProduct?.value?.product_name} product to{" "}
                {!currentProduct.value.isHidden ? "In Active" : "Active"}?
              </p>
              <div class="modal-action">
                <form method="dialog" class="flex gap-2">
                  <button class="btn">Close</button>
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
