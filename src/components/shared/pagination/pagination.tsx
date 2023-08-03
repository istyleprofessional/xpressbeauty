import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { BackArrowIcon, NextArrowIcon } from "../icons/icons";

interface PaginationProps {
  page: any;
  totalProductsNo: number;
}

export const Pagination = component$((props: PaginationProps) => {
  const { page, totalProductsNo } = props;
  const pages = useSignal<number>(0);
  const totalCols = useSignal<number[]>([]);
  const totalPages = useSignal<number>(0);

  useVisibleTask$(({ track }) => {
    track(() => {
      totalProductsNo;
    });
    pages.value = totalProductsNo;
  });

  useVisibleTask$(({ track }) => {
    track(() => {
      page;
      pages.value;
    });
    totalCols.value = [];
    const floatPages = pages.value / 100;
    totalPages.value = Math.floor(floatPages + 1);
    const start = (parseInt(page) ?? 1) - 1;
    const end = (parseInt(page) ?? 1) + 1;
    for (let i = start; i <= end; i++) {
      if (i > 0 && i <= totalPages.value) {
        totalCols.value.push(i);
      }
    }
  });

  return (
    <>
      <div class="flex justify-center items-center gap-2">
        <a
          href={`?page=${parseInt(page) - 1}`}
          role="button"
          class={`text-black btn inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700
          ${parseInt(page ?? "1") === 1 ? "pointer-events-none" : ""}`}
          aria-label="Pervious Page"
        >
          <BackArrowIcon />
          Previous
        </a>
        <div class="btn-group">
          {page > 2 && (
            <>
              <a
                href={`?page=${1}`}
                class={`btn ${
                  parseInt(page ?? "1") === 1 ? "btn-active" : ""
                } `}
                aria-label="page 1"
              >
                1
              </a>
              {parseInt(page ?? "1") > 3 && (
                <p class="btn btn-disabled text-black">...</p>
              )}
            </>
          )}
          {totalCols.value.map((col: any, i: number) => (
            <a
              key={i}
              class={`btn ${
                parseInt(page ?? "1") === col ? "btn-active" : ""
              } `}
              href={`?page=${col}`}
              aria-label={`page ${col}`}
            >
              {col}
            </a>
          ))}
          {page <= totalPages.value - 2 && (
            <>
              {page < totalPages.value - 2 && (
                <p class="btn btn-disabled text-black">...</p>
              )}
              <a
                class={`btn ${
                  parseInt(page ?? "1") === totalPages.value ? "btn-active" : ""
                } `}
                href={`?page=${totalPages.value}`}
              >
                {totalPages.value}
              </a>
            </>
          )}
        </div>
        <a
          href={`?page=${parseInt(page ?? "1") + 1}`}
          class={`text-black btn inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700
          ${
            parseInt(page ?? "1") === totalPages.value + 1
              ? "pointer-events-none"
              : ""
          }`}
          aria-label="Next Page"
        >
          Next
          <NextArrowIcon />
        </a>
      </div>
    </>
  );
});
