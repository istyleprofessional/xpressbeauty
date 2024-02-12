import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import { BackArrowIcon, NextArrowIcon } from "../icons/icons";

interface PaginationProps {
  page: any;
  totalProductsNo: number;
  perPage?: number;
}

export const Pagination = component$((props: PaginationProps) => {
  const { page, totalProductsNo, perPage } = props;
  const pages = useSignal<number>(0);
  const totalCols = useSignal<number[]>([]);
  const totalPages = useSignal<number>(0);

  useTask$(({ track }) => {
    track(() => {
      totalProductsNo;
    });
    pages.value = totalProductsNo;
  });

  useTask$(({ track }) => {
    track(() => {
      page;
      pages.value;
    });
    totalCols.value = [];
    const floatPages = pages.value / (perPage ?? 12);
    totalPages.value = Math.ceil(floatPages);
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
      <div class="flex flex-row gap-2">
        <button
          onClick$={() => {
            const url = new URL(window.location.href);
            url.searchParams.set("page", (parseInt(page) - 1).toString());
            location.href = url.toString();
          }}
          role="button"
          class={`btn btn-sm md:btn-md w-fit inline-flex items-center text-xs md:text-sm font-medium text-gray-500
          bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700
          ${parseInt(page ?? "1") === 1 ? "pointer-events-none" : ""}`}
          aria-label="Pervious Page"
        >
          <BackArrowIcon />
          <span class="hidden md:block">Previous</span>
        </button>
        {page > 2 && (
          <>
            <button
              class={`btn btn-sm md:btn-md ${
                parseInt(page ?? "1") === 1 ? "btn-active" : ""
              } `}
              aria-label="page 1"
              onClick$={() => {
                const url = new URL(window.location.href);
                url.searchParams.set("page", "1");
                location.href = url.toString();
              }}
            >
              1
            </button>
            {parseInt(page ?? "1") > 3 && (
              <p class="btn-disabled text-black btn btn-sm md:btn-md">...</p>
            )}
          </>
        )}
        {totalCols.value.map((col: any, i: number) => (
          <button
            key={i}
            class={`btn btn-sm md:btn-md ${
              parseInt(page ?? "1") === col ? "btn-active" : ""
            } `}
            onClick$={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("page", col.toString());
              location.href = url.toString();
            }}
            aria-label={`page ${col}`}
          >
            {col}
          </button>
        ))}
        {page <= totalPages.value - 2 && (
          <>
            {page < totalPages.value - 2 && (
              <p class="btn btn-disabled text-black btn-sm md:btn-md">...</p>
            )}
            <button
              class={`btn btn-sm md:btn-md ${
                parseInt(page ?? "1") === totalPages.value ? "btn-active" : ""
              } `}
              onClick$={() => {
                const url = new URL(window.location.href);
                url.searchParams.set("page", totalPages.value.toString());
                location.href = url.toString();
              }}
            >
              {totalPages.value}
            </button>
          </>
        )}
        <button
          onClick$={() => {
            const url = new URL(window.location.href);
            url.searchParams.set("page", (parseInt(page) + 1).toString());
            location.href = url.toString();
          }}
          class={`btn btn-sm md:btn-md w-fit inline-flex items-center px-4 py-2 text-xs md:text-sm font-medium text-gray-500
           bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700
          ${
            parseInt(page ?? "1") === totalPages.value
              ? "pointer-events-none"
              : ""
          }`}
          aria-label="Next Page"
        >
          <span class="hidden md:block">Next</span>
          <NextArrowIcon />
        </button>
      </div>
      {/* </div> */}
    </>
  );
});
