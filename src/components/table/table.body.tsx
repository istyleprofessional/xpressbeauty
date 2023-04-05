import type { PropFunction } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import { DeleteIcon, DoneIcon, EditIcon, HideIcon } from "../icons/icons";

interface TableProps {
  product: any;
  isEdit: boolean;
  index: number;
  handleOnChange: PropFunction<(e: any, i: number, type: string) => void>;
  handleEditClick: PropFunction<(i: number) => void>;
  handleDoneClick: PropFunction<(i: number) => void>;
  handleDeleteClick: PropFunction<(i: number) => void>;
  handleHideClick: PropFunction<(i: number) => void>;
  i: number;
}

export const TableBody = component$((props: TableProps) => {
  const {
    product,
    isEdit,
    handleOnChange,
    handleEditClick,
    index,
    i,
    handleDoneClick,
    handleDeleteClick,
    handleHideClick,
  } = props;

  return (
    <>
      <th scope="row" class={"px-6 py-4 w-10"}>
        <p>{product.product_name}</p>
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
        {isEdit === true && index === i ? (
          <input
            type="text"
            value={product.sku}
            onChange$={(e) => handleOnChange(e, i, "sku")}
            class="input input-bordered w-full max-w-lg text-xs"
          />
        ) : (
          <p>{product.sku}</p>
        )}
      </td>
      <td class={`px-6 py-4 w-10`}>
        <p>{product.quantity_on_hand}</p>
      </td>
      <td class={`px-6 py-4 w-10`}>
        <p>{product.manufacturer_part_number}</p>
      </td>
      <td class={`px-6 py-4 w-10`}>
        <p>{product.bar_code_value}</p>
      </td>
      <td class={`px-6 py-4 w-10`}>
        <p>{product.isHidden ? "hide" : "active"}</p>
      </td>
      <td class={`px-6 py-4 w-10`}>
        <a href={product.image} target="_blank">
          <img src={product.image} class="w-12 object-contain" />
        </a>
      </td>
      <td class={`px-6 py-4 w-10`}>
        <div class="flex flex-row gap-3">
          {isEdit === true && index === i ? (
            <button onClick$={() => handleDoneClick(i)}>
              <DoneIcon />
            </button>
          ) : (
            <button onClick$={() => handleEditClick(i)}>
              <EditIcon />
            </button>
          )}
          <button onClick$={() => handleDeleteClick(i)}>
            <DeleteIcon />
          </button>
          <button onClick$={() => handleHideClick(i)}>
            <HideIcon />
          </button>
        </div>
      </td>
    </>
  );
});
