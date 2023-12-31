import type { PropFunction } from "@builder.io/qwik";
import { component$, useTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { uuid } from "~/utils/uuid";

export interface CategoryFilterProps {
  filterCategoriessArray: any;
  categoriesSetObject: any;
  handleCategoryCheckBoxChange: PropFunction<
    (e: any, category: string) => void
  >;
}

export const CategoryFilter = component$((props: CategoryFilterProps) => {
  const {
    filterCategoriessArray,
    categoriesSetObject,
    handleCategoryCheckBoxChange,
  } = props;
  const loc = useLocation();

  useTask$(
    () => {
      const args = loc.params.args;
      const filters = args.split("/");
      const filterCategories = () => {
        const index = filters.findIndex(
          (filter) => filter === "filterCategories"
        );
        if (index !== -1) {
          return filters[index + 1];
        }
        return "";
      };
      const categoriesFilters = filterCategories();
      if (categoriesFilters !== "") {
        filterCategoriessArray.value = categoriesFilters
          .split("+")
          .map((category: string) => category.replace(/-/g, " "));
      }
    },
    { eagerness: "idle" }
  );

  return (
    <>
      {Object.keys(categoriesSetObject).map((key: any, index: number) => (
        <ul class="w-full pl-2 rounded-box" key={index}>
          <li class="text-base text-black p-3 font-bold ">
            <span>{key}</span>
          </li>
          {categoriesSetObject[key].map((category: any) => (
            <li
              class="flex flex-row w-full gap-1 text-black items-center"
              key={uuid()}
            >
              <input
                type="checkbox"
                checked={
                  filterCategoriessArray.value.includes(category) ? true : false
                }
                class="checkbox checkbox-primary checkbox-sm"
                onChange$={(e) => handleCategoryCheckBoxChange(e, category)}
                name={category}
                id={category}
              />
              <label for={category} class="text-black text-xs font-semibold">
                {category}
              </label>
            </li>
          ))}
        </ul>
      ))}
    </>
  );
});
