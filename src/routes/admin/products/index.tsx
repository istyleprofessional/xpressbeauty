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
import { Pagination } from "~/components/admin/pagination/pagination";
import { deleteRequest, putRequest } from "~/utils/fetch.utils";
import { TableHeader } from "~/components/admin/table/table.header";
import { Toast } from "~/components/admin/toast/toast";

export const useProductData = routeLoader$(async (ev) => {
  const token = ev.cookie.get("token")?.value;
  const pageNumber = parseInt(ev.url.searchParams.get("page") ?? "1");
  await connect();
  const products: any = await get_products_service(token ?? "", pageNumber);
  const count = await get_products_count_service(token ?? "");
  return JSON.stringify({ products: products, count: count });
});

export default component$(() => {
  const isEdit = useSignal<boolean>(false);
  const index = useSignal<number>();
  const productData = JSON.parse(useProductData().value).products;
  const count = JSON.parse(useProductData().value).count / 100;
  const products = useSignal<any>([{ isHidden: false }]);
  const totalPages = Math.floor(count);
  const loc = useLocation();
  const currentPage = loc.url.searchParams.get("page") ?? "1";
  const messages = useStore<string[]>([], { deep: true });

  useTask$(() => {
    products.value = productData;
  });

  const handleEditClick = $(async (i: number) => {
    if (index.value || index.value === 0) {
      if (index.value !== i) {
        const token = document?.cookie.split("=")[1];
        const result = await putRequest(
          "/api/admin/product/update",
          products.value[index.value],
          token
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
    const token = document?.cookie.split("=")[1];
    const result = await putRequest(
      "/api/admin/product/update",
      products.value[i],
      token
    );
    const resultJson = await result.json();
    if (!resultJson.err) {
      messages.push("Item updated successfully");
    }
    isEdit.value = false;
    index.value = i;
  });

  const handleOnChange = $((e: any, i: number, type: string) => {
    products.value[i][type] = e.target.value;
  });

  const handleDeleteClick = $(async (i: number) => {
    const result = confirm(
      "Are you sure you want to permanent delete this item ?"
    );
    if (result) {
      const token = document?.cookie.split("=")[1];
      const result = await deleteRequest(
        "/api/admin/product/delete",
        products.value[i],
        token
      );
      const resultJson = await result.json();
      if (!resultJson.err) {
        products.value = products.value.filter((item: any) => {
          return item !== products.value[i];
        });
        messages.push("Item Deleted successfully");
      }
    }
  });

  const handleHideClick = $(async (i: number) => {
    const token = document?.cookie.split("=")[1];
    const result = await putRequest(
      "/api/admin/product/hide",
      products.value[i],
      token
    );
    const resultJson = await result.json();
    if (!resultJson.err) {
      products.value = products.value.map((item: any, index: number) => {
        if (i === index) {
          item = resultJson;
        }
        return item;
      });
      messages.push("Item Hidden successfully");
    }
  });

  useVisibleTask$(({ track, cleanup }) => {
    track(() => messages);
    const interval = setInterval(() => {
      messages.shift();
    }, 8000);
    cleanup(() => clearInterval(interval));
  });

  return (
    <div class="flex flex-col w-[85%]">
      <div class="relative overflow-x-auto h-[90vh] w-full mt-9">
        <table class="table table-compact w-[50%] overflow-scroll">
          <TableHeader />
          <tbody>
            {products.value.map((product: any, i: number) => (
              <tr class="bg-white border-b" key={i}>
                <TableBody
                  product={product}
                  isEdit={isEdit.value}
                  index={index.value || 0}
                  handleDoneClick={handleDoneClick}
                  handleEditClick={handleEditClick}
                  handleOnChange={handleOnChange}
                  handleDeleteClick={handleDeleteClick}
                  handleHideClick={handleHideClick}
                  i={i}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div class="flex flex-col gap-4">
        {messages.length !== 0 && (
          <div class="toast toast-end z-100">
            {messages.map((message: string, index: number) => (
              <Toast message={message} key={index} />
            ))}
          </div>
        )}
      </div>
      <Pagination currentPage={currentPage || ""} totalPages={totalPages} />
    </div>
  );
});
