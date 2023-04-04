import type { PropFunction } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";

interface TableProps {
  products: any;
  isEdit: boolean;
  index: number;
  handleOnChange: PropFunction<(e: any, i: number, type: string) => void>;
  handleEditClick: PropFunction<(i: number) => void>;
  handleDoneClick: PropFunction<(i: number) => void>;
}

export const Table = component$((props: TableProps) => {
  const {
    products,
    isEdit,
    handleOnChange,
    handleEditClick,
    index,
    handleDoneClick,
  } = props;

  return (
    <>
      <table class="w-full text-sm text-left text-gray-500  overflow-scroll">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
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
              Image
            </th>
            <th scope="col" class="px-6 py-3 whitespace-nowrap w-10">
              Edit
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: any, i: number) => (
            <tr class="bg-white border-b" key={i}>
              <th
                scope="row"
                class={`px-6 py-4 font-medium text-gray-900 whitespace-nowrap ${
                  isEdit === true && index === i ? "w-full" : ""
                }`}
              >
                {isEdit === true && index === i ? (
                  <input
                    type="text"
                    value={product.product_name}
                    class="input input-bordered w-full max-w-lg text-sm"
                    onChange$={(e) => handleOnChange(e, i, "product_name")}
                  />
                ) : (
                  <p>{product.product_name}</p>
                )}
              </th>
              <td class={`px-6 py-4 w-10`}>
                {isEdit === true && index === i ? (
                  <input
                    type="text"
                    value={product.regular_price}
                    onChange$={(e) => handleOnChange(e, i, "regular_price")}
                    class="input input-bordered w-full max-w-lg text-xs"
                  />
                ) : (
                  <p>{product.regular_price}</p>
                )}
              </td>
              <td class={`px-6 py-4 w-10`}>
                {isEdit === true && index === i ? (
                  <input
                    type="text"
                    value={product.category}
                    onChange$={(e) => handleOnChange(e, i, "category")}
                    class="input input-bordered w-full max-w-lg text-xs"
                  />
                ) : (
                  <p>{product.category}</p>
                )}
              </td>
              <td class={`px-6 py-4 w-10`}>
                {isEdit === true && index === i ? (
                  <input
                    type="text"
                    value={product.item_no}
                    onChange$={(e) => handleOnChange(e, i, "item_no")}
                    class="input input-bordered w-full max-w-lg text-xs"
                  />
                ) : (
                  <p>{product.item_no}</p>
                )}
              </td>
              <td class={`px-6 py-4 w-10`}>
                <a href={product.image} target="_blank">
                  <img src={product.image} class="w-12 object-contain" />
                </a>
              </td>
              <td class={`px-6 py-4 w-10`}>
                {isEdit === true && index === i ? (
                  <button onClick$={() => handleDoneClick(i)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </button>
                ) : (
                  <button onClick$={() => handleEditClick(i)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                      />
                    </svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
});
