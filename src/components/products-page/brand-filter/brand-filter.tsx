import type { PropFunction, QwikChangeEvent } from "@builder.io/qwik";
import { component$, useTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

export interface BrandFilterProps {
  filterBrandsArray: any;
  filterBrands: any[];
  handleBrandCheckBoxChange: PropFunction<
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
      const filterBrands = () => {
        const index = filters.findIndex((filter) => filter === "filterBrands");
        if (index !== -1) {
          return filters[index + 1];
        }
        return "";
      };
      const brandsFilters = filterBrands();
      if (brandsFilters !== "") {
        filterBrandsArray.value = brandsFilters
          .split("+")
          .map((brand: string) => brand.replace(/-/g, " "));
      }
    },
    { eagerness: "idle" }
  );

  return (
    <ul class="rounded-box flex flex-col gap-3">
      {filterBrands
        ?.sort(function (a: any, b: any) {
          return a.name.localeCompare(b.name);
        })
        .map((brand: any, index: number) => (
          <div class="flex flex-row gap-2" key={index}>
            <input
              type="checkbox"
              checked={
                filterBrandsArray.value.includes(brand.name) ? true : false
              }
              class="checkbox checkbox-primary checkbox-sm"
              onChange$={(e: QwikChangeEvent<HTMLInputElement>) =>
                handleBrandCheckBoxChange(e, brand.name)
              }
            />
            <p class="text-black text-sm font-semibold">{brand.name}</p>
          </div>
        ))}
    </ul>
  );
});
