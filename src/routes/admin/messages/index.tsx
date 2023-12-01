import { component$, $, useSignal } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation } from "@builder.io/qwik-city";
import {
  CheckOrderIcon,
  EditAdimnIcon,
  HideAdminIcon,
  OrderFilterIcon,
} from "~/components/shared/icons/icons";
import { connect } from "~/express/db.connection";
import {
  get_all_categories_per_page,
  updateVisibility,
} from "~/express/services/category.service";

export const useCategories = routeLoader$(async ({ url }) => {
  await connect();
  const page = url.searchParams.get("page") ?? "1";
  const categories = await get_all_categories_per_page(parseInt(page));
  return JSON.stringify(categories);
});

export const getCategoriesServer = server$(async function () {
  await connect();
  const page = this.url.searchParams.get("page") ?? "1";
  const categories = await get_all_categories_per_page(parseInt(page));
  return JSON.stringify(categories);
});

export const updateCategoryVisibility = server$(async function (data: any) {
  const update = await updateVisibility(data._id, !data.isHidden);
  return JSON.stringify(update);
});

export default component$(() => {
  const data = JSON.parse(useCategories().value ?? "{}");
  const categoriesIntial = data?.result[0]?.categories ?? [];
  const categories = useSignal(categoriesIntial);
  const count = useSignal(data?.result[0]?.total ?? 0);
  const loc = useLocation();
  const searchValue = loc.url.searchParams.get("search") ?? "";
  const currentCategory = useSignal<any>({});
  const currentPageNo = loc.url.searchParams.get("page") ?? "1";

  const totalPages = Math.ceil(count.value / 20);

  const handleVisibilityChange = $((category: any) => {
    (document?.getElementById("my_modal_1") as any)?.showModal();
    currentCategory.value = category;
  });

  const handleSearchCategories = $(async (e: any) => {
    const value = e.target.value;
    const getProducts = await getCategoriesServer(value);
    const jsonRes = JSON.parse(getProducts);
    categories.value = jsonRes.result;
    count.value = jsonRes.total;
    const url = new URL(window.location.href);
    url.searchParams.set("page", "1");
    url.searchParams.set("search", value);
    history.pushState({}, "", url.toString());
  });

  const handleConfirmStatusChange = $(async () => {
    (document?.getElementById("my_modal_1") as any)?.close();
    const data = currentCategory.value;
    const request = await updateCategoryVisibility(data);
    const response = JSON.parse(request);
    if (response.status !== "success") {
      return;
    }
    categories.value = categories.value.map((category: any) => {
      if (category._id === data._id) {
        category.isHidden = response.result.isHidden;
      }
      return category;
    });
  });

  return (
    <div class="flex flex-col w-full h-full bg-[#F9FAFB]">
      <div class="flex flex-row gap-5 items-center">
        <h1 class="text-2xl font-bold p-2">Categories</h1>
        <input
          type="text"
          class="input input-bordered w-[20rem] m-2"
          placeholder="Search For Products"
          onInput$={handleSearchCategories}
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
              <th>Category Name</th>
              <th>Visibility</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.value?.map((category: any, index: number) => {
              return (
                <tr key={index}>
                  <th>
                    <label>
                      <input type="checkbox" class="checkbox" />
                    </label>
                  </th>
                  <th>{category}</th>
                  <th>
                    <p
                      class={`badge ${
                        !category?.isHidden
                          ? "bg-[#D1FAE5] text-[#059669]"
                          : "bg-[#FEF2F2] text-[#DC2626]"
                      }`}
                    >
                      {!category?.isHidden ? "Active" : "In Active"}
                    </p>
                  </th>
                  <th>
                    <button
                      class="btn btn-ghost btn-sm text-xs"
                      onClick$={() => handleVisibilityChange(category)}
                    >
                      {!category?.isHidden ? (
                        <CheckOrderIcon />
                      ) : (
                        <HideAdminIcon />
                      )}
                    </button>
                    <a
                      class="btn btn-ghost btn-sm text-xs"
                      href={`/admin/brands/${category?._id?.toString()}`}
                    >
                      <EditAdimnIcon />
                    </a>
                  </th>
                </tr>
              );
            })}
            {categories.value?.length === 0 && (
              <tr>
                <td colSpan={8} class="text-center">
                  No categories found
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
                Are you sure you want change {currentCategory?.value?.name} to{" "}
                {!currentCategory?.value?.isHidden ? "In Active" : "Active"}?
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
