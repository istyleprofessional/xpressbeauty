import { component$ } from "@builder.io/qwik";

export const TableHeader = component$(() => {
  return (
    <thead>
      <tr class="flex flex-row  w-full">
        <th scope="col" class="text-center w-20">
          Action
        </th>
        <th class="text-center w-56">
          Product name
        </th>

        <th scope="col" class="text-center w-56">
          Price
        </th>
        <th scope="col" class="text-center w-56">
          Category
        </th>
        <th scope="col" class="text-center w-56">
          Description
        </th>
        <th scope="col" class="text-center w-56">
          Item No
        </th>
        <th scope="col" class="text-center w-56">
          SKU
        </th>
        <th scope="col" class="text-center w-56">
          Quantity on hand
        </th>
        <th scope="col" class="text-center w-56">
          Bar Code Value
        </th>
        <th scope="col" class="text-center w-56">
          Visability
        </th>
        <th scope="col" class="text-center w-56">
          Status
        </th>
        <th scope="col" class="text-center w-56">
          Image
        </th>

      </tr>
    </thead>
  );
});
