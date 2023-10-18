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
    <div class="w-full flex flex-col gap-2">
      <div class="grid grid-cols-2 justify-items-center">
        <input
          type="checkbox"
          checked={filterPrices.value.includes(">25") ? true : false}
          class="checkbox checkbox-primary checkbox-sm"
          onChange$={(e: any) => handlePricesCheckBoxChange(e, ">25")}
        />
        <p class="text-black text-sm font-semibold">{"> $25"}</p>
      </div>
      <div class="grid grid-cols-2 justify-items-center">
        <input
          type="checkbox"
          checked={filterPrices.value.includes("25-50") ? true : false}
          class="checkbox checkbox-primary checkbox-sm"
          onChange$={(e: any) => handlePricesCheckBoxChange(e, "25-50")}
        />
        <p class="text-black text-sm font-semibold">{"$25 - $50"}</p>
      </div>
      <div class="grid grid-cols-2 justify-items-center">
        <input
          type="checkbox"
          checked={filterPrices.value.includes("50-100") ? true : false}
          class="checkbox checkbox-primary checkbox-sm"
          onChange$={(e: any) => handlePricesCheckBoxChange(e, "50-100")}
        />
        <p class="text-black text-sm font-semibold">{"$50 - $100"}</p>
      </div>
      <div class="grid grid-cols-2 justify-items-center">
        <input
          type="checkbox"
          checked={filterPrices.value.includes("100-500") ? true : false}
          class="checkbox checkbox-primary checkbox-sm"
          onChange$={(e: any) => handlePricesCheckBoxChange(e, "100-500")}
        />
        <p class="text-black text-sm font-semibold">{"$100 - $500"}</p>
      </div>
      <div class="grid grid-cols-2 justify-items-center">
        <input
          type="checkbox"
          checked={filterPrices.value.includes("<500") ? true : false}
          class="checkbox checkbox-primary checkbox-sm"
          onChange$={(e: any) => handlePricesCheckBoxChange(e, "<500")}
        />
        <p class="text-black text-sm font-semibold">{"< $500"}</p>
      </div>
    </div>
  );
});
