import { component$ } from "@builder.io/qwik";
import { BackArrowIcon, NextArrowIcon } from "../icons/icons";

interface PaginationProps {
  currentPage: string;
  totalPages: number;
}

export const Pagination = component$((props: PaginationProps) => {
  const { currentPage, totalPages } = props;
  return (
    <div class="flex justify-center items-center gap-2">
      <a
        href={`?page=${parseInt(currentPage ?? "1") - 1}`}
        role="button"
        class={`inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700
          ${parseInt(currentPage ?? "1") === 1 ? "pointer-events-none" : ""}`}
        aria-label="Pervious Page"
      >
        <BackArrowIcon />
        Previous
      </a>
      <a
        href={`?page=${parseInt(currentPage ?? "1") + 1}`}
        class={`inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700
          ${
            parseInt(currentPage ?? "1") === totalPages + 1
              ? "pointer-events-none"
              : ""
          }`}
        aria-label="Next Page"
      >
        Next
        <NextArrowIcon />
      </a>
    </div>
  );
});
