import type { QRL, QwikChangeEvent } from "@builder.io/qwik";
import { component$, useTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { uuid } from "~/utils/uuid";

export interface BrandFilterProps {
  filterBrandsArray: any;
  filterBrands: any;
  handleBrandCheckBoxChange: QRL<
    (e: QwikChangeEvent<HTMLInputElement>, brandName: string) => void
  >;
}

export const BrandFilter = component$((props: BrandFilterProps) => {
  const { filterBrandsArray, filterBrands, handleBrandCheckBoxChange } = props;
  const loc = useLocation();

  useTask$(
    () => {
      const args = loc.params.args;
      const filters = args.split("/");
      const filterBrandss = () => {
        const index = filters.findIndex((filter) => filter === "filterBrands");
        if (index !== -1) {
          return filters[index + 1];
        }
        return "";
      };
      const brandsFilters = filterBrandss();
      if (brandsFilters !== "") {
        filterBrandsArray.value = brandsFilters
          .split("+")
          .map((brand: string) => brand.replace(/-/g, " "));
      }
    },
    { eagerness: "idle" }
  );

  return (
    <ul class="rounded-box flex flex-col gap-1 h-96 overflow-y-auto">
      {filterBrands.value
        ?.sort(function (a: any, b: any) {
          return a.name.localeCompare(b.name);
        })
        .map((brand: any) => (
          <li
            key={uuid()}
            class="p-2 flex flex-row gap-1 items-center text-black"
          >
            <input
              type="checkbox"
              checked={
                filterBrandsArray.value.includes(brand.name) ? true : false
              }
              class="checkbox checkbox-sm w-fit"
              onChange$={(e: QwikChangeEvent<HTMLInputElement>) =>
                handleBrandCheckBoxChange(e, brand.name)
              }
              name={brand.name}
              id={brand.name}
            />
            <label for={brand.name} class="text-black text-xs font-semibold">
              {brand.name}
            </label>
          </li>
        ))}
    </ul>
  );
});
