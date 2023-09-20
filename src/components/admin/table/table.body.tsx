import type { PropFunction } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import {
  DeleteIcon,
  DoneIcon,
  EditIcon,
  HideIcon,
  UnHideIcon,
} from "../../shared/icons/icons";
import type { ProductModel } from "~/models/product.model";

interface TableProps {
  product: ProductModel;
  isEdit: boolean;
  index: number;
  handleOnChange: PropFunction<(e: any, i: number, type: string) => void>;
  handleEditClick: PropFunction<(i: number) => void>;
  handleDoneClick: PropFunction<(i: number) => void>;
  handleDeleteClick: PropFunction<(i: number) => void>;
  handleHideClick: PropFunction<(i: number) => void>;
  handleRowClick: PropFunction<(i: number, element: any) => void>;
  data_widths?: number[];
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
    data_widths,
    handleDoneClick,
    handleDeleteClick,
    handleHideClick,
    handleRowClick,
  } = props;
  const folderName = product.product_name
    ?.replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, "");
  const width: number = data_widths ? data_widths[data_widths.length - 1] : 300;

  const imageSrc = `/products-images-2/${folderName}/primary-image-${width}w.webp`;

  return (
    <>
      <th class="text-sm overflow-hidden w-20 bg-red-200 text-black">
        <div class="flex flex-col gap-3 justify-center items-center">
          {isEdit === true && index === i ? (
            <button
              onClick$={() => handleDoneClick(i)}
              aria-label="Done edit product"
            >
              <DoneIcon />
            </button>
          ) : (
            <button
              onClick$={() => handleEditClick(i)}
              aria-label="edit product"
            >
              <EditIcon />
            </button>
          )}
          <button
            onClick$={() => handleDeleteClick(i)}
            aria-label="Delete product"
          >
            <DeleteIcon />
          </button>
          <button onClick$={() => handleHideClick(i)} aria-label="Hide product">
            {product.isHidden ? <UnHideIcon /> : <HideIcon />}
          </button>
        </div>
      </th>
      <td
        class="whitespace-normal text-black font-bold text-lg w-56 text-left"
        onClick$={(e, element) => handleRowClick(i, element)}
      >
        {product.product_name ?? ""}
      </td>

      <td
        class="text-sm text-center w-56 text-black"
        onClick$={(e, element) => handleRowClick(i, element)}
      >
        {isEdit === true && index === i ? (
          <input
            type="text"
            value={product.price ?? ""}
            onChange$={(e) => handleOnChange(e, i, "regular_price")}
            class="input input-bordered w-full max-w-lg text-xs"
          />
        ) : (
          product.price ?? ""
        )}
      </td>
      <td
        class="text-sm text-center overflow-hidden w-56 text-black"
        onClick$={(e, element) => handleRowClick(i, element)}
      >
        {isEdit === true && index === i ? (
          <textarea
            class="textarea textarea-xs textarea-bordered w-full"
            placeholder={(product?.categories as string[])[0].toString() ?? ""}
            value={product.categories ?? ""}
            onChange$={(e) => handleOnChange(e, i, "category")}
          ></textarea>
        ) : (
          product.categories ?? ""
        )}
      </td>
      <td
        class="text-sm whitespace-normal text-center text-black overflow-hidden w-56"
        onClick$={(e, element) => handleRowClick(i, element)}
      >
        {isEdit === true && index === i ? (
          <textarea
            class="textarea textarea-xs textarea-bordered w-full"
            placeholder={product.description ?? ""}
            value={product.description ?? ""}
            onChange$={(e) => handleOnChange(e, i, "description")}
          ></textarea>
        ) : (
          product.description ?? ""
        )}
      </td>
      <td
        class="text-sm whitespace-normal text-center text-black overflow-hidden w-56"
        onClick$={(e, element) => handleRowClick(i, element)}
      >
        {isEdit === true && index === i ? (
          <textarea
            class="textarea textarea-xs textarea-bordered w-full"
            placeholder={product.item_no ? product.item_no : "Item number"}
            value={product.item_no ?? ""}
            onChange$={(e) => handleOnChange(e, i, "item_no")}
          ></textarea>
        ) : (
          product.item_no ?? ""
        )}
      </td>
      <td
        class="text-sm text-center text-black overflow-hidden w-56"
        onClick$={(e, element) => handleRowClick(i, element)}
      >
        {isEdit === true && index === i ? (
          <textarea
            class="textarea textarea-xs textarea-bordered w-full"
            placeholder={product.sku ? product.sku : "SKU"}
            value={product.sku}
            onChange$={(e) => handleOnChange(e, i, "sku")}
          ></textarea>
        ) : (
          product.sku
        )}
      </td>
      <td
        class="text-sm whitespace-normal text-black text-center overflow-hidden w-56"
        onClick$={(e, element) => handleRowClick(i, element)}
      >
        {product.quantity_on_hand}
      </td>
      <td
        class="text-sm text-center text-black overflow-hidden w-56"
        onClick$={(e, element) => handleRowClick(i, element)}
      >
        {product.bar_code_value}
      </td>
      <td
        class="text-sm text-center text-black overflow-hidden w-56"
        onClick$={(e, element) => handleRowClick(i, element)}
      >
        {product.isHidden ? "hide" : "active"}
      </td>
      <td
        class="text-sm text-center text-black overflow-hidden w-56"
        onClick$={(e, element) => handleRowClick(i, element)}
      >
        {isEdit === true && index === i ? (
          <select
            class="select"
            onChange$={(e) => handleOnChange(e, i, "status")}
          >
            <option selected>NORMAL</option>
            <option>NEW ARRIVAL</option>
            <option>SALE</option>
            <option>LIMITED EDITION</option>
          </select>
        ) : (
          product.status
        )}
      </td>
      <td class="text-center text-black overflow-hidden w-56">
        <a href={imageSrc} target="_blank">
          <img src={imageSrc} class="w-full h-full object-contain" />
        </a>
      </td>
    </>
  );
});
