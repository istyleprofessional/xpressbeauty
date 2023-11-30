import type { QwikChangeEvent } from "@builder.io/qwik";
import {
  component$,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
  $,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { BrandFilter } from "~/components/products-page/brand-filter/brand-filter";
import { CategoryFilter } from "~/components/products-page/category-filter/category-filter";
import { PriceFilter } from "~/components/products-page/price-filter/price-filter";
import { ProductsSection } from "~/components/products-page/products-section/products-section";
import { connect } from "~/express/db.connection";
import { get_all_brands } from "~/express/services/brand.service";
import { get_all_categories } from "~/express/services/category.service";
import { get_products_data } from "~/express/services/product.service";
import { postRequest } from "~/utils/fetch.utils";

export const useCurrLoader = routeLoader$(async ({ cookie }) => {
  const country = cookie.get("cur")?.value ?? "";
  const rate = cookie.get("curRate")?.value ?? "";
  return { country: country, rate: rate };
});

export const useFilterData = routeLoader$(async () => {
  await connect();
  const requestBrand = await get_all_brands();
  const requestCat = await get_all_categories();
  return JSON.stringify({ brand: requestBrand, cat: requestCat });
});

export const useDomContentLoaded = routeLoader$(async ({ params, url }) => {
  const page = url.searchParams.get("page") ?? "1";
  const searchQuery = url.searchParams.get("search") ?? "";
  const filters = params.args.split("/");
  const filterBrands = () => {
    const index = filters.findIndex((filter: string) => {
      return filter === "filterBrands";
    });
    if (index !== -1) {
      return filters[index + 1];
    } else {
      return "";
    }
  };
  const filter = () => {
    const index = filters.findIndex((filter: string) => {
      return filter === "filter";
    });
    if (index !== -1) {
      return filters[index + 1];
    } else {
      return "";
    }
  };
  const search = () => {
    const index = filters.findIndex((filter: string) => {
      return filter === "search";
    });
    if (index !== -1) {
      return filters[index + 1];
    } else {
      return "";
    }
  };
  const filterCategories = () => {
    const index = filters.findIndex((filter: string) => {
      return filter === "filterCategories";
    });
    if (index !== -1) {
      return filters[index + 1];
    } else {
      return "";
    }
  };
  const filterPrices = () => {
    const index = filters.findIndex((filter: string) => {
      return filter === "filterPrices";
    });
    if (index !== -1) {
      return filters[index + 1];
    } else {
      return "";
    }
  };
  const filterBrandsArray =
    filterBrands() !== "" ? filterBrands().split("+") : [];
  const filterCategoriesArray =
    filterCategories() !== "" ? filterCategories().split("+") : [];
  const filterPricesArray =
    filterPrices() !== "" ? filterPrices().split("+") : [];
  const finalFilterBrandsArray = filterBrandsArray.map((brand: string) => {
    return brand.replace(/-/g, " ");
  });
  const finalFilter = filter() === "Brands" ? "" : filter();
  const finalFilterCategoriesArray = filterCategoriesArray.map(
    (category: string) => {
      return category.replace(/-/g, " ");
    }
  );

  const request = await get_products_data(
    finalFilterBrandsArray,
    finalFilterCategoriesArray,
    filterPricesArray,
    finalFilter,
    parseInt(page),
    search() !== "" ? search() : searchQuery
  );

  const data = JSON.parse(request);
  return JSON.stringify({
    finalFilter,
    finalFilterBrandsArray,
    finalFilterCategoriesArray,
    filterPricesArray,
    serverData: data,
  });
});

export default component$(() => {
  const firstRender = useDomContentLoaded();
  const filterServerData = JSON.parse(useFilterData().value);
  const filtersNo = useSignal<number>(0);
  const categoriesSetObject = useSignal<any>({});
  const productData = useSignal<any[]>(
    JSON.parse(firstRender.value).serverData
  );
  const currencyObject = useCurrLoader().value;
  const sort = useSignal<string>("");
  const loc = useLocation();
  const page = useSignal<string>(loc.url.searchParams.get("page") ?? "1");
  const filterBrandsArray = useStore<any>({ value: [] }, { deep: true });
  const filterCategoriessArray = useStore<any>({ value: [] }, { deep: true });
  const filterPrices = useSignal<any[]>([]);
  const query = useSignal<string>(loc.url.searchParams.get("search") ?? "");
  const isChecked = useStore<any>(
    {
      Hair: false,
      Tools: false,
      Brands: false,
      Price: false,
    },
    { deep: true }
  );
  const nav = useNavigate();
  const filterType = useSignal<string>("");

  useTask$(() => {
    const filters = loc.params.args.split("/");
    const filter = () => {
      const index = filters.findIndex((filter: string) => {
        return filter === "filter";
      });
      if (index !== -1) {
        return filters[index + 1];
      } else {
        return "";
      }
    };
    filterType.value = filter();
  });

  useVisibleTask$(
    ({ track }) => {
      track(() => filterBrandsArray.value.length);
      track(() => filterCategoriessArray.value.length);
      track(() => filterPrices.value.length);
      track(() => query.value);
      track(() => sort.value);
      const url = loc.url;
      const isSearch = url.searchParams.get("search") ?? "";
      const isFilter = url.searchParams.get("filter") ?? "";
      filtersNo.value =
        filterBrandsArray.value.length +
        filterCategoriessArray.value.length +
        filterPrices.value.length +
        (query.value ? 1 : 0) +
        (isSearch ? 1 : 0) + // search
        (isFilter ? 1 : 0) +
        (sort.value ? 1 : 0);
    },
    { strategy: "intersection-observer" }
  );

  useVisibleTask$(
    () => {
      localStorage.setItem(
        "prev",
        loc.url.pathname + loc.url.searchParams.toString()
      );
    },
    { strategy: "document-idle" }
  );

  const handleCategoryCheckBoxChange = $(async (event: any, name: string) => {
    const value = event.target.checked;
    if (value) {
      filterCategoriessArray.value.push(`${name}`);
    } else {
      filterCategoriessArray.value = filterCategoriessArray.value.filter(
        (category: any) => category !== `${name}`
      );
    }
    const url = loc.url;
    let newFilterBrands = [];
    let newFilterCategories = [];
    if (filterBrandsArray.value.length) {
      newFilterBrands = filterBrandsArray.value.map((brand: string) => {
        return brand.replace(/ /g, "-");
      });
    }
    if (filterCategoriessArray.value.length > 0) {
      newFilterCategories = filterCategoriessArray.value.map(
        (category: string) => {
          return category.replace(/ /g, "-");
        }
      );
    }
    url.pathname = `/products/${
      newFilterBrands.length > 0
        ? `filterBrands/${newFilterBrands.join("+")}/`
        : ""
    }${
      filterCategoriessArray.value.length
        ? `filterCategories/${newFilterCategories.join("+")}/`
        : ""
    }${
      filterPrices.value.length > 0
        ? `filterPrices/${filterPrices.value.join("+")}/`
        : ""
    }`;
    const checkPage = url.searchParams.get("page") ?? "1";
    const result = await postRequest("/api/products/get", {
      filterBrands: filterBrandsArray.value,
      filterCategories: filterCategoriessArray.value,
      filterPrices: filterPrices.value,
      filter: "",
      query: "",
      page: checkPage,
      sort: sort.value,
    });
    const data = await result.json();
    productData.value = JSON.parse(data);
    url.searchParams.set("page", "1");
    page.value = "1";
    nav(url.pathname, {
      forceReload: false,
      replaceState: false,
      scroll: false,
    });
  });

  useTask$(() => {
    filterServerData?.cat?.result?.forEach((category: any) => {
      if (!categoriesSetObject.value[category.main]) {
        categoriesSetObject.value[category.main] = [];
      }
      categoriesSetObject.value[category.main].push(category.name);
    });
  });

  const handleClearFilter = $(async () => {
    const url = new URL(window.location.href);
    filterBrandsArray.value = [];
    filterCategoriessArray.value = [];
    url.searchParams.delete("search");
    url.searchParams.delete("page");
    url.searchParams.delete("sort");
    sort.value = "";
    filterPrices.value = [];
    page.value = "1";
    url.pathname = "/products/";
    nav(url.pathname, {
      forceReload: false,
      replaceState: false,
      scroll: false,
    });
    const checkPage = url.searchParams.get("page") ?? "1";
    const result = await postRequest("/api/products/get", {
      filterBrands: filterBrandsArray.value,
      filterCategories: filterCategoriessArray.value,
      filterPrices: filterPrices.value,
      filter: "",
      query: "",
      page: checkPage,
      sort: sort.value,
    });
    const data = await result.json();
    productData.value = JSON.parse(data);
    query.value = "";
    filtersNo.value = 0;
  });

  const handleSearchInput = $(async (e: any) => {
    const value = e.target.value;
    query.value = value;
    const url = new URL(window.location.href);
    const checkPage = url.searchParams.get("page") ?? "1";
    const request = await postRequest("/api/products/get", {
      filterBrands: filterBrandsArray.value,
      filterCategories: filterCategoriessArray.value,
      filterPrices: filterPrices.value,
      filter: filterType.value,
      query: query.value,
      page: checkPage,
      sort: sort.value,
    });

    url.searchParams.set("search", value);
    nav(url.search, {
      forceReload: false,
      replaceState: false,
      scroll: false,
    });
    const result = await request.json();
    productData.value = JSON.parse(result);
  });

  const handleSorting = $(async (e: any) => {
    const url = new URL(window.location.href);
    sort.value = e.target.value;
    let newFilterBrands = [];
    let newFilterCategories = [];
    if (filterBrandsArray.value.length) {
      newFilterBrands = filterBrandsArray.value.map((brand: string) => {
        return brand.replace(/ /g, "-");
      });
    }
    if (filterCategoriessArray.value.length > 0) {
      newFilterCategories = filterCategoriessArray.value.map(
        (category: string) => {
          return category.replace(/ /g, "-");
        }
      );
    }
    url.pathname = `/products/${
      newFilterBrands.length > 0
        ? `filterBrands/${newFilterBrands.join("+")}/`
        : ""
    }${
      filterCategoriessArray.value.length
        ? `filterCategories/${newFilterCategories.join("+")}/`
        : ""
    }${
      filterPrices.value.length > 0
        ? `filterPrices/${filterPrices.value.join("+")}/`
        : ""
    }`;
    url.searchParams.set("sort", e.target.value);
    url.searchParams.set("page", "1");
    const checkPage = url.searchParams.get("page") ?? "1";
    const result = await postRequest("/api/products/get", {
      filterBrands: filterBrandsArray.value,
      filterCategories: filterCategoriessArray.value,
      filterPrices: filterPrices.value,
      filter: "",
      query: "",
      page: checkPage,
      sort: sort.value,
    });
    const data = await result.json();
    productData.value = JSON.parse(data);
    url.searchParams.set("page", "1");
    page.value = "1";
    nav(url.pathname + url.search, {
      forceReload: false,
      replaceState: false,
      scroll: false,
    });
  });

  const handleBrandCheckBoxChange = $(
    async (e: QwikChangeEvent<HTMLInputElement>, brandName: string) => {
      const value = e.target.checked;
      const url = loc.url;
      if (value) {
        filterBrandsArray.value.push(brandName);
      } else {
        filterBrandsArray.value = filterBrandsArray.value.filter(
          (brand: any) => brand !== brandName
        );
      }
      const newFilterBrands = filterBrandsArray.value.map((brand: string) => {
        return brand.replace(/ /g, "-");
      });
      let newFilterCategories = [];
      if (filterCategoriessArray.value.length > 0) {
        newFilterCategories = filterCategoriessArray.value.map(
          (category: string) => {
            return category.replace(/ /g, "-");
          }
        );
      }
      url.pathname = `/products/${
        newFilterBrands.length > 0
          ? `filterBrands/${newFilterBrands.join("+")}/`
          : ""
      }${
        filterCategoriessArray.value.length
          ? `filterCategories/${newFilterCategories.join("+")}/`
          : ""
      }${
        filterPrices.value.length
          ? `filterPrices/${filterPrices.value.join("+")}/`
          : ""
      }`;
      url.searchParams.set("page", "1");
      page.value = "1";
      nav(url.pathname, {
        forceReload: false,
        replaceState: false,
        scroll: false,
      });
      const checkPage = url.searchParams.get("page") ?? "1";
      const result = await postRequest("/api/products/get", {
        filterBrands: filterBrandsArray.value,
        filterCategories: filterCategoriessArray.value,
        filterPrices: filterPrices.value,
        filter: "",
        query: "",
        page: checkPage,
        sort: sort.value,
      });
      const data = await result.json();
      productData.value = JSON.parse(data);
    }
  );

  const handlePricesCheckBoxChange = $(async (event: any, valueEl: any) => {
    const value = event.target.checked;
    const url = loc.url;
    if (value) {
      filterPrices.value.push(valueEl);
    } else {
      filterPrices.value = filterPrices.value.filter(
        (price: any) => price !== valueEl
      );
    }
    let newFilterBrands = [];
    if (filterBrandsArray.value.length) {
      newFilterBrands = filterBrandsArray.value.map((brand: string) => {
        return brand.replace(/ /g, "-");
      });
    }
    let newFilterCategories = [];
    if (filterCategoriessArray.value.length > 0) {
      newFilterCategories = filterCategoriessArray.value.map(
        (category: string) => {
          return category.replace(/ /g, "-");
        }
      );
    }
    url.pathname = `/products/${
      newFilterBrands.length > 0
        ? `filterBrands/${newFilterBrands.join("+")}/`
        : ""
    }${
      filterCategoriessArray.value.length
        ? `filterCategories/${newFilterCategories.join("+")}/`
        : ""
    }${
      filterPrices.value.length
        ? `filterPrices/${filterPrices.value.join("+")}/`
        : ""
    }`;

    url.searchParams.set("page", "1");
    page.value = "1";
    nav(url.pathname, {
      forceReload: false,
      replaceState: false,
      scroll: false,
    });
    const checkPage = url.searchParams.get("page") ?? "1";
    const result = await postRequest("/api/products/get", {
      filterBrands: filterBrandsArray.value,
      filterCategories: filterCategoriessArray.value,
      filterPrices: filterPrices.value,
      filter: "",
      query: "",
      page: checkPage,
      sort: sort.value,
    });
    const data = await result.json();
    productData.value = JSON.parse(data);
  });

  return (
    <>
      <h1 class="text-xl md:text-3xl p-5 font-bold">Product Filters</h1>
      <div class="flex flex-col gap-4 lg:grid  lg:grid-cols-4 p-6">
        <div class="drawer lg:drawer-open flex flex-col gap-5">
          <input id="my-drawer" type="checkbox" class="drawer-toggle" />
          <div class="drawer-content">
            <label
              for="my-drawer"
              class="btn btn-primary drawer-button lg:hidden"
            >
              Filter By
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                />
              </svg>
            </label>
          </div>
          <div class="flex flex-row gap-4 items-center lg:hidden">
            <p class="text-black text-base font-bold">
              Filters Applied :{" "}
              <span class="text-black text-base font-normal">
                {filtersNo.value}
              </span>
            </p>
            <button
              class="btn btn-ghost w-fit btn-sm"
              onClick$={handleClearFilter}
            >
              {" "}
              Clear All
            </button>
          </div>
          <div class=" w-full drawer-side z-50">
            <label for="my-drawer" class="drawer-overlay"></label>
            <ul class="menu mt-12 lg:mt-0 bg-base-200 lg:bg-transparent flex flex-col lg:gap-10">
              <li class="lg:flex flex-row gap-4 items-center hidden">
                <p class="text-black lg:text-base md:text-xs font-bold">
                  Filters Applied :{" "}
                  <span class="text-black text-xs font-normal">
                    {filtersNo.value}
                  </span>
                </p>
                <button
                  class="btn btn-ghost w-fit btn-sm text-xs normal-case"
                  onClick$={handleClearFilter}
                >
                  {" "}
                  Clear All
                </button>
              </li>
              <li class="flex flex-col gap-1 w-full">
                <p class="text-black text-base font-bold">Filter By :</p>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                    <svg
                      class="w-4 h-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                  <input
                    id="default-search"
                    class="block w-full p-6 text-xs border-0 focus:border-none rounded-lg bg-gray-50"
                    placeholder="Search by name or brand"
                    onInput$={handleSearchInput}
                    value={query.value}
                  />
                </div>
              </li>
              <li class="collapse collapse-arrow w-fit">
                <input
                  type="radio"
                  name="my-accordion-1"
                  class=" cursor-pointer"
                  onClick$={() => {
                    if (isChecked.Brands) {
                      isChecked.Brands = false;
                    } else {
                      isChecked.Brands = true;
                    }
                  }}
                  checked={isChecked.Brands}
                />
                <div class="collapse-title text-sm md:text-base font-medium">
                  <h3 class="text-base font-bold text-black">Brands</h3>
                </div>
                <div class="collapse-content">
                  <BrandFilter
                    filterBrands={filterServerData?.brand?.result}
                    filterBrandsArray={filterBrandsArray}
                    handleBrandCheckBoxChange={handleBrandCheckBoxChange}
                  />
                </div>
              </li>
              <li class="collapse collapse-arrow w-fit">
                <input
                  type="radio"
                  name="my-accordion-2"
                  class=" cursor-pointer"
                  onClick$={() => {
                    if (isChecked.Tools || isChecked.Hair) {
                      isChecked.Tools = false;
                      isChecked.Hair = false;
                    } else {
                      isChecked.Tools = true;
                      isChecked.Hair = true;
                    }
                  }}
                  checked={isChecked.Tools || isChecked.Hair}
                />
                <div class="collapse-title text-sm md:text-base font-medium">
                  <h3 class="text-base font-bold text-black">Categories</h3>
                </div>
                <div class="collapse-content flex flex-col">
                  <CategoryFilter
                    filterCategoriessArray={filterCategoriessArray}
                    categoriesSetObject={categoriesSetObject.value}
                    handleCategoryCheckBoxChange={handleCategoryCheckBoxChange}
                  />
                </div>
              </li>
              <li class="collapse collapse-arrow w-fit">
                <input
                  type="radio"
                  name="my-accordion-2"
                  class=" cursor-pointer"
                  onClick$={() => {
                    isChecked.Price = !isChecked.Price;
                  }}
                  checked={isChecked.Price}
                />
                <div class="collapse-title text-sm md:text-base font-medium">
                  <h3 class="text-base font-bold text-black">Prices</h3>
                </div>
                <div class="collapse-content flex flex-col">
                  <PriceFilter
                    filterPrices={filterPrices}
                    handlePricesCheckBoxChange={handlePricesCheckBoxChange}
                  />
                </div>
              </li>
              <li class="collapse collapse-arrow w-80">
                <input
                  type="radio"
                  name="my-accordion-3"
                  class="cursor-pointer"
                  onClick$={() => {
                    if (isChecked.Price) {
                      isChecked.Price = false;
                    } else {
                      isChecked.Price = true;
                    }
                  }}
                  checked={isChecked.Price}
                />
              </li>
            </ul>
          </div>
        </div>
        <div class="md:col-span-3">
          <div class="md:flex md:flex-col gap-16">
            <ProductsSection
              currencyObject={currencyObject}
              products={productData}
              currentPage={page.value}
              handleSorting={handleSorting}
            />
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const filters = resolveValue(useDomContentLoaded);
  const json = JSON.parse(filters);
  let mainFilter = "";
  let metaDescription = "";
  let categories = "";
  let brands = "";
  if (json.finalFilter) {
    metaDescription = `Explore all ${json.finalFilter} products`;
    mainFilter = json.finalFilter;
  } else {
    metaDescription = `Explore all products`;
  }
  if (json.finalFilterBrandsArray.length > 0) {
    brands = json.finalFilterBrandsArray.join(", ");
    metaDescription += ` from ${json.finalFilterBrandsArray.join(", ")}`;
  } else {
    metaDescription += ` from all brands`;
  }
  if (json.finalFilterCategoriesArray.length > 0) {
    categories = json.finalFilterCategoriesArray.join(", ");
    metaDescription += ` in ${json.finalFilterCategoriesArray.join(
      ", "
    )} categories and more at XpressBeauty`;
  } else {
    metaDescription += ` in all beauty categories and more at XpressBeauty`;
  }
  return {
    title: `${
      mainFilter
        ? `${mainFilter} products`
        : categories
        ? `${categories} products`
        : brands
        ? `${brands} products`
        : "beauty products"
    } | XpressBeauty`,
    meta: [
      {
        name: "description",
        content: metaDescription,
      },
      {
        name: "keywords",
        content: `beauty, products, hair, tools, brands, prices, ${mainFilter}, ${categories}, ${brands}`,
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        name: "googlebot",
        content: "index, follow",
      },
      {
        property: "og:title",
        content: `${
          mainFilter
            ? `${mainFilter} products`
            : categories
            ? `${categories} products`
            : brands
            ? `${brands} products`
            : "beauty products"
        } | XpressBeauty`,
      },
      {
        property: "og:description",
        content: metaDescription,
      },
      { property: "og:type", content: "website" },
    ],
  };
};
