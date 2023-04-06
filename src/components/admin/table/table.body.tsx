import type { PropFunction } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import {
  DeleteIcon,
  DoneIcon,
  EditIcon,
  HideIcon,
  UnHideIcon,
} from "../icons/icons";

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
      <th class="whitespace-normal text-base z-10">
        <div class="flex justify-center items-center">
          <p>{product.product_name}</p>
        </div>
      </th>
      <td class="text-sm">
        <div class="flex justify-center items-center whitespace-normal">
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
        </div>
      </td>
      <td class="text-sm">
        <div class="flex justify-center items-center">
          {isEdit === true && index === i ? (
            <textarea
              class="textarea textarea-xs textarea-bordered w-full"
              placeholder={product.category}
              onChange$={(e) => handleOnChange(e, i, "category")}
            ></textarea>
          ) : (
            <p>{product.category}</p>
          )}
        </div>
      </td>
      <td class="text-sm">
        <div class="flex justify-center items-center">
          {isEdit === true && index === i ? (
            <textarea
              class="textarea textarea-xs textarea-bordered w-full"
              placeholder={product.item_no ? product.item_no : "Item number"}
              onChange$={(e) => handleOnChange(e, i, "item_no")}
            ></textarea>
          ) : (
            <p>{product.item_no}</p>
          )}
        </div>
      </td>
      <td class="text-sm">
        <div class="flex justify-center items-center">
          {isEdit === true && index === i ? (
            <textarea
              class="textarea textarea-xs textarea-bordered w-full"
              placeholder={product.sku ? product.sku : "SKU"}
              onChange$={(e) => handleOnChange(e, i, "sku")}
            ></textarea>
          ) : (
            <p>{product.sku}</p>
          )}
        </div>
      </td>
      <td class="text-sm">
        <div class="flex justify-center items-center">
          <p>{product.quantity_on_hand}</p>
        </div>
      </td>
      <td class="text-sm">
        <div class="flex justify-center items-center">
          <p>{product.bar_code_value}</p>
        </div>
      </td>
      <td class="text-sm">
        <div class="flex justify-center items-center">
          <p>{product.isHidden ? "hide" : "active"}</p>
        </div>
      </td>
      <td>
        <div class="flex justify-center items-center">
          <a href={product.image} target="_blank">
            <img src={product.image} class="w-12 object-contain" />
          </a>
        </div>
      </td>
      <td class="text-sm">
        <div class="flex flex-col gap-3 justify-center items-center">
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
            {product.isHidden ? <UnHideIcon /> : <HideIcon />}
          </button>
        </div>
      </td>
    </>
  );
});
