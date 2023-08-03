import {
  component$,
  $,
  useSignal,
  useTask$,
  useVisibleTask$,
  useStore,
} from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import {
  get_products_count_service,
  get_products_service,
} from "~/express/services/product.service";
import { TableBody } from "~/components/admin/table/table.body";
import { Pagination } from "~/components/shared/pagination/pagination";
import { deleteRequest, putRequest } from "~/utils/fetch.utils";
import { TableHeader } from "~/components/admin/table/table.header";
import { Toast } from "~/components/admin/toast/toast";
import type { ProductModel } from "~/models/product.model";

export const useProductData = routeLoader$(async (ev) => {
  const token = ev.cookie.get("token")?.value;
  const pageNumber = parseInt(ev.url.searchParams.get("page") ?? "1");
  await connect();
  const products = await get_products_service(token ?? "", pageNumber);
  const count = await get_products_count_service(token ?? "");
  return JSON.stringify({ products: products, count: count });
});

export default component$(() => {
  const isEdit = useSignal<boolean>(false);
  const index = useSignal<number>();
  const productData = JSON.parse(useProductData().value).products;
  const count = JSON.parse(useProductData().value).count;
  const products = useSignal<ProductModel[]>([]);
  const loc = useLocation();
  const currentPage = loc.url.searchParams.get("page") ?? "1";
  const messages = useStore<string[]>([], { deep: true });
  const rowHeight = useSignal<any[]>([]);
  useTask$(() => {
    products.value = productData;
  });

  const handleEditClick = $(async (i: number) => {
    if (index.value || index.value === 0) {
      if (index.value !== i) {
        const result = await putRequest(
          "/api/admin/product/update",
          products.value[index.value]
        );
        const resultJson = await result.json();
        if (!resultJson.err) {
          messages.push("Item updated successfully");
        }
      }
    }
    isEdit.value = true;
    index.value = i;
  });

  const handleDoneClick = $(async (i: number) => {
    const result = await putRequest(
      "/api/admin/product/update",
      products.value[i]
    );
    const resultJson = await result.json();
    if (!resultJson.e) {
      messages.push("Item updated successfully");
    }
    isEdit.value = false;
    index.value = i;
  });

  const handleOnChange = $((e: any, i: number, type: string) => {
    products.value[i][type as keyof ProductModel] = e.target.value;
  });

  const handleDeleteClick = $(async (i: number) => {
    const result = confirm(
      "Are you sure you want to permanent delete this item ?"
    );
    if (result) {
      const result = await deleteRequest(
        "/api/admin/product/delete",
        products.value[i]
      );
      const resultJson = await result.json();
      if (!resultJson.err) {
        products.value = products.value.filter((item: ProductModel) => {
          return item !== products.value[i];
        });
        messages.push("Item Deleted successfully");
      }
    }
  });

  const handleHideClick = $(async (i: number) => {
    const result = await putRequest(
      "/api/admin/product/hide",
      products.value[i]
    );
    const resultJson = await result.json();
    if (!resultJson.err) {
      products.value = products.value.map(
        (item: ProductModel, index: number) => {
          if (i === index) {
            item = resultJson;
          }
          return item;
        }
      );
      messages.push(`Item ${products.value[i].isHidden === true ? 'Hide' : 'Unhide'} successfully`);
    }
  });

  useVisibleTask$(({ track, cleanup }) => {
    track(() => messages);
    const interval = setInterval(() => {
      messages.shift();
    }, 8000);
    cleanup(() => clearInterval(interval));
  });

  const handleToastClose = $((index: number) => {
    messages.splice(index, 1);
  });

  const handleRowClick = $((i: number, e: any) => {
    const tr = e.parentNode;
    if (tr.classList.contains("h-44")) {
      tr.classList.remove("h-44");
      tr.classList.add("h-full");
    } else {
      tr.classList.remove("h-full");
      tr.classList.add("h-44");
    }
  });

  return (
    <div class="flex flex-col w-[95%]">
      <div class="relative overflow-auto h-[88vh] w-full">
        <table class="table w-full overflow-y-scroll">
          <TableHeader />
          <tbody>
            {products.value.map((product: ProductModel, i: number) => (
              <tr
                class={`flex flex-row ${rowHeight.value[i] ?? "h-44"} w-full`}
                key={i}
              >
                <TableBody
                  product={product as ProductModel}
                  isEdit={isEdit.value}
                  index={index.value || 0}
                  handleDoneClick={handleDoneClick}
                  handleEditClick={handleEditClick}
                  handleOnChange={handleOnChange}
                  handleDeleteClick={handleDeleteClick}
                  data_widths={product.data_widths}
                  handleHideClick={handleHideClick}
                  handleRowClick={handleRowClick}
                  i={i}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div class="flex flex-col gap-4">
        {messages.length !== 0 && (
          <div class="toast toast-end z-50">
            {messages.map((message: string, index: number) => (
              <Toast
                message={message}
                key={index}
                status="s"
                index={index}
                handleClose={handleToastClose}
              />
            ))}
          </div>
        )}
      </div>
      <Pagination page={currentPage || ''} totalProductsNo={count} />
    </div>
  );
});
