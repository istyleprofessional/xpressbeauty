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
  addBrandService,
  get_brands_per_page,
  updateVisibility,
} from "~/express/services/brand.service";

export const useBrands = routeLoader$(async ({ url }) => {
  await connect();
  const page = url.searchParams.get("page") ?? "1";
  const searchValue = url.searchParams.get("search") ?? "";
  const brands = await get_brands_per_page(parseInt(page), searchValue);
  // console.log(brands);
  return JSON.stringify(brands);
});

export const getBrandsServer = server$(async function (value: string) {
  await connect();
  const page = this.url.searchParams.get("page") ?? "1";
  const brands = await get_brands_per_page(parseInt(page), value);
  return JSON.stringify(brands);
});

export const updateBrandVisibility = server$(async function (data: any) {
  const update = await updateVisibility(data._id, !data.isHidden);
  return JSON.stringify(update);
});

export const updateBrandServer = server$(async function (name: string) {
  const update = await addBrandService(name);
  return JSON.stringify(update);
});

export default component$(() => {
  const data = JSON.parse(useBrands().value ?? "{}");
  const brandsIntial = data?.result ?? [];
  const brands = useSignal(brandsIntial);
  const count = useSignal(data?.total ?? 0);
  const loc = useLocation();
  const searchValue = loc.url.searchParams.get("search") ?? "";
  const currentBrand = useSignal<any>({});
  const currentPageNo = loc.url.searchParams.get("page") ?? "1";
  const totalPages = Math.ceil(count.value / 20);
  const brandNameSignal = useSignal<string>("");
  const handleVisibilityChange = $((brand?: any, number?: number) => {
    (
      document?.getElementById(
        number ? `my_modal_${number}` : "my_modal_1"
      ) as any
    )?.showModal();
    if (brand) {
      currentBrand.value = brand;
    }
  });

  const handleSearchBrands = $(async (e: any) => {
    const value = e.target.value;
    const getProducts = await getBrandsServer(value);
    const jsonRes = JSON.parse(getProducts);
    brands.value = jsonRes.result;
    count.value = jsonRes.total;
    const url = new URL(window.location.href);
    url.searchParams.set("page", "1");
    url.searchParams.set("search", value);
    history.pushState({}, "", url.toString());
  });

  const handleConfirmStatusChange = $(async () => {
    (document?.getElementById("my_modal_1") as any)?.close();
    const data = currentBrand.value;
    const request = await updateBrandVisibility(data);
    const response = JSON.parse(request);
    if (response.status !== "success") {
      return;
    }
    brands.value = brands.value.map((brand: any) => {
      if (brand._id === data._id) {
        brand.isHidden = response.result.isHidden;
      }
      return brand;
    });
  });

  const handleSubmitNewBrand = $(async () => {
    (document?.getElementById("my_modal_2") as any)?.close();
    const callServerToUpdate = await updateBrandServer(brandNameSignal.value);
    const response = JSON.parse(callServerToUpdate);
    if (response.status !== "success") {
      return;
    }
  });

  return (
    <div class="flex flex-col w-full h-full bg-[#F9FAFB]">
      <div class="flex flex-row gap-5 items-center">
        <h1 class="text-2xl font-bold p-2">Brands</h1>
        <input
          type="text"
          class="input input-bordered w-[20rem] m-2"
          placeholder="Search For Products"
          onInput$={handleSearchBrands}
          value={searchValue}
        />
        <div class="flex-grow">
          <button
            class="btn btn-primary"
            onClick$={() => handleVisibilityChange(undefined, 2)}
          >
            Add New Brand
          </button>
        </div>
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
              <th>Brand Name</th>
              <th>Visibility</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {brands.value?.map((brand: any, index: number) => {
              return (
                <tr key={index}>
                  <th>
                    <label>
                      <input type="checkbox" class="checkbox" />
                    </label>
                  </th>
                  <th>{brand?.name}</th>
                  <th>
                    <p
                      class={`badge ${
                        !brand?.isHidden
                          ? "bg-[#D1FAE5] text-[#059669]"
                          : "bg-[#FEF2F2] text-[#DC2626]"
                      }`}
                    >
                      {!brand?.isHidden ? "Active" : "In Active"}
                    </p>
                  </th>
                  <th>
                    <button
                      class="btn btn-ghost btn-sm text-xs"
                      onClick$={() => handleVisibilityChange(brand)}
                    >
                      {!brand?.isHidden ? (
                        <CheckOrderIcon />
                      ) : (
                        <HideAdminIcon />
                      )}
                    </button>
                    <a
                      class="btn btn-ghost btn-sm text-xs"
                      href={`/admin/brands/${brand?._id?.toString()}`}
                    >
                      <EditAdimnIcon />
                    </a>
                  </th>
                </tr>
              );
            })}
            {brands.value?.length === 0 && (
              <tr>
                <td colSpan={8} class="text-center">
                  No brands found
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
                Are you sure you want change {currentBrand?.value?.name} to{" "}
                {!currentBrand?.value?.isHidden ? "In Active" : "Active"}?
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
          <dialog id="my_modal_2" class="modal">
            <div class="modal-box">
              <h3 class="font-bold text-lg">Change Product Visibility!</h3>
              <p class="py-4">Brand Name</p>
              <input
                type="text"
                class="input input-bordered w-full"
                onChange$={(e) => (brandNameSignal.value = e.target.value)}
              />
              <div class="modal-action">
                <form method="dialog" class="flex gap-2">
                  <button class="btn">Close</button>
                  <button
                    class="btn btn-primary"
                    onClick$={handleSubmitNewBrand}
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
