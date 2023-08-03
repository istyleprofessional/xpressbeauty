import {
  component$,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { BrandFilter } from "~/components/products-page/brand-filter/brand-filter";
import { CategoryFilter } from "~/components/products-page/category-filter/category-filter";
import { PriceFilter } from "~/components/products-page/price-filter/price-filter";
import { ProductsSection } from "~/components/products-page/products-section/products-section";
import { SearchIcon } from "~/components/shared/icons/icons";
import { connect } from "~/express/db.connection";
import { get_all_brands } from "~/express/services/brand.service";
import { get_all_categories } from "~/express/services/category.service";
import { postRequest } from "~/utils/fetch.utils";
import { uuid } from "~/utils/uuid";

export const useFilterData = routeLoader$(async () => {
  await connect();
  const requestBrand = await get_all_brands();
  const requestCat = await get_all_categories();
  return JSON.stringify({ brand: requestBrand, cat: requestCat });
});

export default component$(() => {
  const filterServerData = JSON.parse(useFilterData().value);
  const categoriesSetObject = useSignal<any>({});
  const intialProductsData = useSignal<any[]>([]);
  const productData = useSignal<any[]>([]);
  const filter = useSignal<string>("");
  const loc = useLocation();
  const page = loc.url.searchParams.get("page") ?? "1";
  const filterBrandsArray = useStore<any>({ value: [] }, { deep: true });
  const filterCategoriessArray = useStore<any>({ value: [] }, { deep: true });
  const requestUrlPageChange = useSignal<string>("");
  const finalFiterObject = useStore<any>(
    {
      brands: [],
      categories: [],
    },
    { deep: true }
  );

  useVisibleTask$(async () => {
    filter.value = localStorage.getItem("filter") ?? "Tools";
    const result = await postRequest("/api/products/get", {
      filters: filter.value,
      page: 1,
    });
    requestUrlPageChange.value = "/api/products/get";
    const response = await result.json();
    productData.value = response;
    intialProductsData.value = response;
  });

  useTask$(() => {
    filterServerData?.cat?.result?.forEach((category: any) => {
      if (!categoriesSetObject.value[category.main]) {
        categoriesSetObject.value[category.main] = [];
      }
      categoriesSetObject.value[category.main].push(category.name);
    });
  });

  useVisibleTask$(({ track }) => {
    track(() => filterBrandsArray.value.length);
    finalFiterObject.brands = filterBrandsArray.value;
  });

  useVisibleTask$(({ track }) => {
    track(() => filterCategoriessArray.value.length);
    finalFiterObject.categories = filterCategoriessArray.value;
  });

  useVisibleTask$(async () => {
    const filter = localStorage.getItem("filter") ?? "Tools";
    const filterBrands = localStorage.getItem("filterBrands") ?? "[]";
    const filterCategories = localStorage.getItem("filterCategories") ?? "[]";
    finalFiterObject.brands = JSON.parse(filterBrands);
    finalFiterObject.categories = JSON.parse(filterCategories);

    if (
      finalFiterObject.brands.length === 0 &&
      finalFiterObject.categories.length === 0
    ) {
      const result = await postRequest("/api/products/get", {
        filters: filter,
        page: page,
      });
      const response = await result.json();
      productData.value = response;
    } else {
      const data = {
        filters: finalFiterObject,
        page: page,
      };
      const request = await postRequest("/api/products/filter", data);
      const response = await request.json();
      requestUrlPageChange.value = `/api/products/filter`;
      productData.value = response;
    }
  });

  return (
    <div class="grid grid-cols-4 p-6">
      <div class="flex flex-col gap-16 w-full">
        <h2 class="text-3xl text-black font-bold pt-5">Clearance</h2>
        <div class="flex flex-col gap-1">
          <p class="text-black text-base font-bold">Filter By :</p>
          <div>
            <div class="relative w-8 top-9 left-3 h-6">
              <SearchIcon />
            </div>
            <input
              type="text"
              aria-label="search"
              placeholder="Search For..."
              class="input w-80 input-bordered pl-14 bg-[#F4F4F5] text-black"
            />
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <h3 class="text-lg font-bold text-black">Brands</h3>
          {filterServerData?.brand?.result?.map((brand: any, index: number) => (
            <div key={index}>
              <BrandFilter
                brandName={brand.name}
                filterBrandsArray={filterBrandsArray}
              />
            </div>
          ))}
        </div>
        <div class="flex flex-col gap-3">
          <h3 class="text-lg font-bold text-black">Categories</h3>
          {Object.keys(categoriesSetObject.value).map((key: any) => (
            <>
              <ul class="w-56 pl-2 rounded-box">
                <li class="text-base text-black p-3 font-bold ">
                  <span>{key}</span>
                </li>
                {categoriesSetObject.value[key].map((category: any) => (
                  <li key={uuid()} class="pl-5 pb-4 text-black">
                    <CategoryFilter
                      filterCategoriessArray={filterCategoriessArray}
                      category={category}
                      main={key}
                    />
                  </li>
                ))}
              </ul>
            </>
          ))}
        </div>
        <div class="flex flex-col gap-3">
          <h3 class="text-lg font-bold text-black">Prices</h3>
          <PriceFilter />
        </div>
      </div>
      <div class="col-span-3">
        <div class="flex flex-col gap-16">
          <ProductsSection products={productData} currentPage={page} />
        </div>
      </div>
    </div>
  );
});
