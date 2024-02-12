import type { PropFunction } from "@builder.io/qwik";
import { component$, useTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

interface PriceFilterInterface {
  filterPrices: any;
  handlePricesCheckBoxChange: PropFunction<(event: any, valueEl: any) => void>;
}

export const PriceFilter = component$((props: PriceFilterInterface) => {
  const { filterPrices, handlePricesCheckBoxChange } = props;
  const loc = useLocation();

  useTask$(
    () => {
      const args = loc.params.args;
      const filters = args.split("/");
      const filterPricesFunc = () => {
        const index = filters.findIndex((filter) => filter === "filterPrices");
        if (index !== -1) {
          return filters[index + 1];
        }
        return "";
      };
      const pricesFilters = filterPricesFunc();
      if (pricesFilters !== "") {
        filterPrices.value = pricesFilters.split("+");
      }
    },
    { eagerness: "idle" }
  );

  return (
    <ul class="w-full pl-2 rounded-box overflow-y-auto">
      <li class="flex flex-row w-full gap-1 text-black items-center p-2">
        <input
          type="checkbox"
          checked={filterPrices.value.includes(">25") ? true : false}
          class="checkbox checkbox-sm"
          name=">25"
          id=">25"
          onChange$={(e: any) => handlePricesCheckBoxChange(e, ">25")}
        />
        <label for=">25" class="text-black text-xs font-semibold">
          {"> $25"}
        </label>
      </li>
      <li class="flex flex-row w-full gap-1 text-black items-center p-2">
        <input
          type="checkbox"
          checked={filterPrices.value.includes("25-50") ? true : false}
          name="25-50"
          id="25-50"
          class="checkbox checkbox-sm"
          onChange$={(e: any) => handlePricesCheckBoxChange(e, "25-50")}
        />
        <label for="25-50" class="text-black text-xs font-semibold">
          {"$25 - $50"}
        </label>
      </li>
      <li class="flex flex-row w-full gap-1 text-black items-center p-2">
        <input
          type="checkbox"
          checked={filterPrices.value.includes("50-100") ? true : false}
          class="checkbox checkbox-sm"
          name="50-100"
          id="50-100"
          onChange$={(e: any) => handlePricesCheckBoxChange(e, "50-100")}
        />
        <label for="50-100" class="text-black text-xs font-semibold">
          {"$50 - $100"}
        </label>
      </li>
      <li class="flex flex-row w-full gap-1 text-black items-center p-2">
        <input
          type="checkbox"
          checked={filterPrices.value.includes("100-500") ? true : false}
          class="checkbox checkbox-sm"
          name="100-500"
          id="100-500"
          onChange$={(e: any) => handlePricesCheckBoxChange(e, "100-500")}
        />
        <label for="100-500" class="text-black text-xs font-semibold">
          {"$100 - $500"}
        </label>
      </li>
      <li class="flex flex-row w-full gap-1 text-black items-center p-2">
        <input
          type="checkbox"
          checked={filterPrices.value.includes("<500") ? true : false}
          class="checkbox checkbox-sm"
          name="<500"
          id="<500"
          onChange$={(e: any) => handlePricesCheckBoxChange(e, "<500")}
        />
        <label for="<500" class="text-black text-xs font-semibold">
          {"< $500"}
        </label>
      </li>
    </ul>
  );
});
