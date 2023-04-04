import {
  component$,
  $,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import {
  get_products_count_service,
  get_products_service,
} from "~/express/services/product.service";
import { Table } from "~/components/table/table";
import { Alert } from "~/components/alert/alert";
import { Pagination } from "~/components/pagination/pagination";
import { putRequest } from "~/utils/fetch.utils";
// import { server$ } from "@builder.io/qwik-city";

export const useProductData = routeLoader$(async (ev) => {
  const token = ev.cookie.get("token")?.value;
  const pageNumber = parseInt(ev.url.searchParams.get("page") ?? "1");
  await connect();
  const products: any = await get_products_service(token ?? "", pageNumber);
  const count = await get_products_count_service(token ?? "");
  return JSON.stringify({ products: products, count: count });
});

// const updateProduct = server$(async (product, token) => {
//   await connect();
//   const result = await update_product_service(product, token);
//   return JSON.stringify(result);
// });

export default component$(() => {
  const isEdit = useSignal<boolean>(false);
  const index = useSignal<number>();
  const productData = JSON.parse(useProductData().value).products;
  const count = JSON.parse(useProductData().value).count / 100;
  const products = useSignal<any[]>([]);
  const totalPages = Math.floor(count);
  const loc = useLocation();
  const currentPage = loc.url.searchParams.get("page") ?? "1";
  const updateStatus = useSignal<string>("");

  useTask$(() => {
    products.value = productData;
  });

  const handleEditClick = $(async (i: number) => {
    if (index.value || index.value === 0) {
      if (index.value !== i) {
        const token = document?.cookie.split("=")[1];
        await putRequest("/api/product", products.value[index.value], token);
      }
    }
    isEdit.value = true;
    index.value = i;
  });

  const handleDoneClick = $(async (i: number) => {
    const token = document?.cookie.split("=")[1];
    await putRequest("/api/product", products.value[i], token);
    isEdit.value = false;
    index.value = i;
  });

  const handleOnChange = $((e: any, i: number, type: string) => {
    products.value[i][type] = e.target.value;
  });

  useVisibleTask$(({ track }) => {
    track(() => updateStatus.value);
    if (updateStatus.value !== "") {
      const interval = setInterval(() => (updateStatus.value = ""), 3000);
      return () => {
        clearInterval(interval);
      };
    }
  });

  return (
    <div>
      <Alert status={updateStatus.value} />
      <div class="relative overflow-x-auto h-[95vh]">
        <Table
          products={products.value}
          isEdit={isEdit.value}
          index={index.value || 0}
          handleDoneClick={handleDoneClick}
          handleEditClick={handleEditClick}
          handleOnChange={handleOnChange}
        />
      </div>
      <Pagination currentPage={currentPage || ""} totalPages={totalPages} />
    </div>
  );
});
