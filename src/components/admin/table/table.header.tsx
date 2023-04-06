import { component$ } from "@builder.io/qwik";

export const TableHeader = component$(() => {
  return (
    <thead class="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-20">
      <tr>
        <th scope="col" class="px-6 py-3 whitespace-nowrap">
          Product name
        </th>
        <th scope="col" class="px-6 py-3 whitespace-nowrap">
          Price
        </th>
        <th scope="col" class="px-6 py-3 whitespace-nowrap">
          Category
        </th>
        <th scope="col" class="px-6 py-3 whitespace-nowrap">
          Item No
        </th>
        <th scope="col" class="px-6 py-3 whitespace-nowrap">
          SKU
        </th>
        <th scope="col" class="px-6 py-3 whitespace-nowrap">
          Quantity on hand
        </th>
        <th scope="col" class="px-6 py-3 whitespace-nowrap">
          Bar Code Value
        </th>
        <th scope="col" class="px-6 py-3 whitespace-nowrap">
          Status
        </th>
        <th scope="col" class="px-6 py-3 whitespace-nowrap">
          Image
        </th>
        <th scope="col" class="px-6 py-3 whitespace-nowrap w-10">
          Action
        </th>
      </tr>
    </thead>
  );
});
