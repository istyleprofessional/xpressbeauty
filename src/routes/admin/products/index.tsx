import { component$, $, useSignal } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import {
  getAllProductForDownload,
  getProductBySearchAdmin,
  updateVisibility,
} from "~/express/services/product.service";
import {
  CheckOrderIcon,
  EditAdimnIcon,
  HideAdminIcon,
  OrderFilterIcon,
} from "~/components/shared/icons/icons";

export const useProductData = routeLoader$(async (ev) => {
  const pageNumber = parseInt(ev.url.searchParams.get("page") ?? "1");
  const search = ev.url.searchParams.get("search") ?? "";
  await connect();
  const products = await getProductBySearchAdmin(search, pageNumber);
  return JSON.stringify(products);
});

export const getProductsServer = server$(async function (value: string) {
  await connect();
  const page = this.url.searchParams.get("page") ?? "1";
  const products = await getProductBySearchAdmin(value, parseInt(page));
  return JSON.stringify(products);
});

export const updateProductVisibility = server$(async function (data: any) {
  const update = await updateVisibility(data._id, !data.isHidden);
  return JSON.stringify(update);
});

export const getAllProductsServer = server$(async function () {
  await connect();
  const products = await getAllProductForDownload();
  return JSON.stringify(products);
});

export default component$(() => {
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
    if (product) {
      currentProduct.value = product;
    }
  });

  const handleConfirmStatusChange = $(async () => {
    (document?.getElementById("my_modal_1") as any)?.close();
    const data = currentProduct.value;
    const request = await updateProductVisibility(data);
    const response = JSON.parse(request);
    if (response.status !== "success") {
      return;
    }
    const newArray = productData.value.map((product: any) => {
      if (product._id === data._id) {
        product.isHidden = response.result.isHidden;
      }
      return product;
    });
    productData.value = newArray;
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

  const handleDownloadClick = $(async () => {
    const getAllProducts = await getAllProductsServer();
    const jsonRes = JSON.parse(getAllProducts);
    const csvRows = [];
    const headers = [
      "id",
      "title",
      "description",
      "availability",
      "condition",
      "price",
      "link",
      "image_link",
      "brand",
    ];
    csvRows.push(headers.join(","));
    for (const product of jsonRes) {
      const values = [
        product._id,
        product.product_name.substring(0, 150),
        // maxium 9999 characters
        product.description
          ? product.description
              .replace(/<img .*?>/g, "")
              .replace(/Cosmo Prof/g, "Xpress Beauty")
              .substring(0, 9999)
          : "",
        parseInt(product.quantity_on_hand) > 0 ? "in stock" : "out of stock",
        "new",
        `${parseFloat(product.price.regular).toFixed(2)} CAD`,
        `https://xpressbeauty.ca/products/${product.perfix}`,
        product.imgs[0],
        product.companyName.name,
      ];
      csvRows.push(values.join(","));
    }
    const csvString = csvRows.join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
    a.download = "products.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  return (
    <div class="flex flex-col w-full h-full bg-[#F9FAFB]">
      <div class="flex flex-row gap-5 items-center w-full">
        <h1 class="text-2xl font-bold p-2">Products</h1>
        <input
          type="text"
          class="input input-bordered w-[20rem] m-2"
          placeholder="Search For Products"
          onInput$={handleSearchProducts}
          value={searchValue}
        />
        <a class="btn btn-primary ml-auto" href={`/admin/products/add-new`}>
          Add New Product
        </a>
        <button class="btn btn-primary ml-auto" onClick$={handleDownloadClick}>
          Download Products Backup
        </button>
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
                      src={(product?.imgs as any[])[0] ?? ""}
                      class="w-12 h-12 object-contain"
                      onError$={(_, element: HTMLImageElement) => {
                        element.src = "/placeholder.webp";
                      }}
                    />
                  </th>
                  <th>{product.product_name}</th>
                  <th>
                    {product.categories
                      .map((cat: any) => `${cat.main} - ${cat.name}`)
                      .join(" & ")}
                  </th>
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
