import { component$, $, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Form, routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import { Toast } from "~/components/admin/toast/toast";
import { get_all_brands } from "~/express/services/brand.service";
import { get_all_categories } from "~/express/services/category.service";
import {
  getProductByIdForAdmin,
  update_product_service,
} from "~/express/services/product.service";

export const useEditProductData = routeLoader$(async ({ params }) => {
  const product = await getProductByIdForAdmin(params.id);
  // console.log(product);
  const categories = await get_all_categories();
  const brands = await get_all_brands();
  return JSON.stringify({
    product: product,
    categories: categories,
    brands: brands,
  });
});

export const useFormAction = routeAction$(async function (data, event) {
  const token = event.cookie.get("token")?.value ?? "";
  if (!token) {
    throw event.redirect(301, "/admin-login");
  }
  const formData: any = data;
  Object.keys(formData).forEach((key: string) => {
    if (key === "category") {
      formData.categories = [
        {
          main: formData[key],
          name: formData["sub-category"],
        },
      ];
      delete formData[key];
      delete formData["sub-category"];
    }
    if (key === "price.regular") {
      formData[key] = parseFloat(formData[key]);
    }
    if (key === "product_image") {
      formData.imgs = [formData[key]];
      delete formData[key];
    }
    if (key === "isHidden") {
      formData[key] = formData[key] === "true" ? true : false;
    }
    if (key === "updateQuickBooks") {
      formData[key] = true;
    } else {
      formData["updateQuickBooks"] = false;
    }
  });
  await update_product_service(formData);
  return { status: "success" };
});

export default component$(() => {
  const product = JSON.parse(useEditProductData()?.value ?? "[]").product;
  const categories = JSON.parse(useEditProductData()?.value ?? "[]").categories;
  const brands = JSON.parse(useEditProductData()?.value ?? "[]").brands;
  const action = useFormAction();
  const imageSignal = useSignal<string>(product?.imgs[0] ?? "");
  const descriptionSignal = useSignal<string>(product?.description ?? "");

  useVisibleTask$(() => {
    (window as any)?.tinymce?.init({
      selector: "#mytextarea",
      height: 300,
      width: 800,
      plugins: [
        "advlist autolink lists link image charmap print preview anchor",
        "searchreplace visualblocks code fullscreen",
        "insertdatetime media table paste code help wordcount",
      ],
      toolbar:
        "undo redo | formatselect | " +
        "bold italic backcolor | alignleft aligncenter " +
        "alignright alignjustify | bullist numlist outdent indent | " +
        "removeformat | help",
      content_style:
        "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
    });
    (window as any)?.tinymce?.activeEditor?.on("change", () => {
      descriptionSignal.value = (
        window as any
      )?.tinymce?.activeEditor?.getContent();
    });
  });

  const handleFileChange = $(async (event: any) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    formData.append(
      "name",
      `${product.product_name?.replace(/ /g, "-")}/${
        file.name.split(".")[0]
      }.webp`
    );
    const uploadReq = await fetch("/api/admin/product/upload", {
      method: "POST",
      body: formData,
    });
    const uploadRes = await uploadReq.json();
    if (uploadRes.message !== 200) {
      return;
    }
    imageSignal.value = `https://xpressbeauty.s3.ca-central-1.amazonaws.com/testimages/${product.product_name.replace(
      / /g,
      "-"
    )}/${file.name.split(".")[0]}.webp`;
  });

  const handleAlertClose = $(() => {
    document.querySelector(".alert")?.classList.add("hidden");
  });

  return (
    <div class="flex flex-col w-full h-full bg-[#F9FAFB]">
      <script
        src="https://cdn.tiny.cloud/1/7d7c50ku3fuvbrrbjft38fdtt26o51zx0iwuab7hlwexhgr9/tinymce/5/tinymce.min.js"
        referrerPolicy="origin"
      ></script>
      {action.isRunning && (
        <>
          <div class="w-full backdrop-blur-lg backdrop-brightness-75 drop-shadow-lg fixed z-20 m-auto inset-x-0 inset-y-0 ">
            <progress class="progress progress-secondary bg-black w-56 fixed z-20 m-auto inset-x-0 inset-y-0"></progress>
          </div>
        </>
      )}

      {action.value?.status === "success" && (
        <Toast
          message="Product Updated Successfully"
          index={1}
          handleClose={handleAlertClose}
          status="s"
        />
      )}

      <Form action={action}>
        <div class="flex flex-row justify-between w-full">
          <input type="hidden" name="_id" value={product?._id} />
          <input type="hidden" name="priceType" value={product?.priceType} />
          <h1 class="text-2xl font-bold p-2 text-[#6B7280]">
            Edit <span class="text-[#7C3AED]">{product.product_name}</span>{" "}
            Product
          </h1>
          <div class="flex flex-row gap-2 items-center">
            <button
              type="button"
              class="btn btn-ghost border-1 border-black btn-sm text-[#7C3AED] w-40"
            >
              Add Variant
            </button>
            <button
              type="submit"
              class="btn bg-[#7C3AED] btn-sm text-white w-40"
            >
              Save
            </button>
          </div>
        </div>

        <div class="flex flex-col bg-[#FFF] h-full w-full p-6 gap-10">
          <div class="grid grid-cols-4">
            <p class="col-span-1">Image</p>
            <div class="col-span-3 flex flex-col gap-2">
              <img src={imageSignal.value} class="w-24 h-24" alt="" />
              <input
                type="file"
                class="file-input file-input-xs file-input-bordered w-full max-w-xs"
                onChange$={handleFileChange}
              />
              <input
                type="hidden"
                name="product_image"
                value={imageSignal.value}
              />
            </div>
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">Product Name</p>
            <input
              type="text"
              name="product_name"
              class="input input-md w-full border-[1px] border-[#D1D5DB] col-span-3"
              value={product.product_name}
            />
          </div>
          <div class="grid grid-cols-4">
            {product.priceType === "range" && (
              <>
                <p class="col-span-1">Price Range</p>
                <div class="flex flex-row gap-2 col-span-3 items-center">
                  <input
                    type="text"
                    name="price.min"
                    class="input input-md w-full border-[1px] border-[#D1D5DB]"
                    value={product.price.min}
                  />
                  <p class="col-span-1">-</p>
                  <input
                    type="text"
                    name="price.max"
                    class="input input-md w-full border-[1px] border-[#D1D5DB]"
                    value={product.price.max}
                  />
                </div>
              </>
            )}
            {product.priceType === "single" && (
              <>
                <p class="col-span-1">Price</p>
                <input
                  type="text"
                  name="price.regular"
                  class="input input-md w-full border-[1px] border-[#D1D5DB] col-span-3"
                  value={product.price.regular}
                />
              </>
            )}
          </div>
          <div class="grid grid-cols-4">
            {product.priceType === "range" && (
              <>
                <p class="col-span-1">Sale Price Range</p>
                <div class="flex flex-row gap-2 col-span-3 items-center">
                  <input
                    type="text"
                    name="sale_price.min"
                    class="input input-md w-full border-[1px] border-[#D1D5DB]"
                    value={product.sale_price.min}
                  />
                  <p class="col-span-1">-</p>
                  <input
                    type="text"
                    name="sale_price.max"
                    class="input input-md w-full border-[1px] border-[#D1D5DB]"
                    value={product.sale_price.max}
                  />
                </div>
              </>
            )}
            {product.priceType === "single" && (
              <>
                <p class="col-span-1">Sale Price</p>
                <input
                  type="text"
                  name="sale_price.sale"
                  class="input input-md w-full border-[1px] border-[#D1D5DB] col-span-3"
                  value={product.sale_price.sale}
                />
              </>
            )}
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">Category</p>
            <select class="select w-full max-w-xs" name="category">
              <option disabled selected={product.categories.length === 0}>
                Pick product main category
              </option>
              {categories.result
                .reduce((resArr: any, currentArr: any) => {
                  const other = resArr.some(
                    (ele: any) => currentArr.main === ele.main
                  );
                  if (!other) resArr.push(currentArr);
                  return resArr;
                }, [])
                .sort((a: any, b: any) => a.main - b.main)
                .map((category: any, index: number) => {
                  return (
                    <option
                      key={index}
                      value={category.main}
                      selected={product.categories.some(
                        (prodCat: any) => prodCat.main === category.main
                      )}
                    >
                      {category.main}
                    </option>
                  );
                })}
            </select>
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">Sub Category</p>
            <select class="select w-full max-w-xs" name="sub-category">
              <option disabled selected={product.categories.length === 0}>
                Pick product sub category
              </option>
              {categories.result
                .reduce((resArr: any, currentArr: any) => {
                  const other = resArr.some(
                    (ele: any) => currentArr.name === ele.name
                  );
                  if (!other) resArr.push(currentArr);
                  return resArr;
                }, [])
                .sort((a: any, b: any) => a.name.localeCompare(b.name))
                .map((category: any, index: number) => (
                  <option
                    key={index}
                    value={category.name}
                    selected={product.categories.some(
                      (cate: any) => cate.name === category.name
                    )}
                  >
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">Brand</p>
            <select class="select w-full max-w-xs" name="companyName.name">
              <option disabled selected={!product.companyName.name}>
                Pick product brand
              </option>
              {brands.result
                .reduce((resArr: any, currentArr: any) => {
                  const other = resArr.some(
                    (ele: any) =>
                      currentArr.name.toLowerCase() === ele.name.toLowerCase()
                  );
                  if (!other) resArr.push(currentArr);
                  return resArr;
                }, [])
                .sort((a: any, b: any) => a.name.localeCompare(b.name))
                .map((brand: any, index: number) => (
                  <option
                    key={index}
                    value={brand.name}
                    selected={product.companyName.name === brand.name}
                  >
                    {brand.name}
                  </option>
                ))}
            </select>
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">Description</p>
            <textarea id="mytextarea" value={descriptionSignal.value} />
            <input
              type="hidden"
              name="description"
              value={descriptionSignal.value}
            />
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">Item No.</p>
            <input
              type="text"
              name="item_no"
              class="input input-md w-full border-[1px] border-[#D1D5DB] col-span-3"
              value={product.item_no}
            />
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">SKU</p>
            <input
              type="text"
              name="sku"
              class="input input-md w-full border-[1px] border-[#D1D5DB] col-span-3"
              value={product?.sku}
            />
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">Quantity on hand</p>
            <input
              type="text"
              name="quantity_on_hand"
              class="input input-md w-full border-[1px] border-[#D1D5DB] col-span-3"
              value={product?.quantity_on_hand}
            />
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">Barcode value</p>
            <input
              type="text"
              name="bar_code_value"
              class="input input-md w-full border-[1px] border-[#D1D5DB] col-span-3"
              value={product?.bar_code_value}
            />
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">Status</p>
            <select class="select w-full max-w-xs" name="status">
              <option disabled selected={!product.status}>
                Pick product status
              </option>
              <option value="Normal" selected={product.status === "Normal"}>
                Normal
              </option>
              <option
                value="New Arrival"
                selected={product.status === "New Arrival"}
              >
                New Arrival
              </option>
              <option value="Hot Sale" selected={product.status === "Hot Sale"}>
                Hot Sale
              </option>
            </select>
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">Visibility</p>
            <select class="select w-full max-w-xs" name="isHidden">
              <option disabled>Pick product visibility</option>
              <option value="false" selected={!product.isHidden}>
                Active
              </option>
              <option value="true" selected={product.isHidden}>
                In Active
              </option>
            </select>
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">Update Using QuickBooks</p>
            <input
              class="form-checkbox h-5 w-5 text-[#7C3AED]"
              type="checkbox"
              name="updateQuickBooks"
              checked={product.updateQuickBooks}
            />
          </div>
        </div>
      </Form>
      <div class="bg-[#fff]">
        <div class="flex flex-row justify-between gap-2 p-2">
          <dialog id="my_modal_1" class="modal">
            <div class="modal-box">
              <h3 class="font-bold text-lg">Change Product Visibility!</h3>
              <p class="py-4">Are you sure you want change </p>
              <div class="modal-action">
                <form method="dialog" class="flex gap-2">
                  <button class="btn">Close</button>
                  <button class="btn btn-primary">Confirm</button>
                </form>
              </div>
            </div>
          </dialog>
        </div>
      </div>
    </div>
  );
});
