import { component$, $, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  server$,
} from "@builder.io/qwik-city";
import { Toast } from "~/components/admin/toast/toast";
import { ExtraImgs } from "~/components/shared/extraImgs";
import { get_all_brands } from "~/express/services/brand.service";
import { get_all_categories } from "~/express/services/category.service";
import {
  addMainImg,
  addNewVarient,
  getProductByIdForAdmin,
  updateVarations,
  update_product_service,
  removeImgFromDb,
} from "~/express/services/product.service";

const goAddMainImg = server$(async (product: any, imgUrl: string) => {
  await addMainImg(product, imgUrl);
});

const goRemoveImgFromDb = server$(async (product: any, imgUrl: string) => {
  await removeImgFromDb(product, imgUrl);
});

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
    //console.log(key);

    if (key === "proDiscPercent") {
      if (isNaN(formData[key])) formData[key] = parseFloat(formData[key]);
    }
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
    if (key === "price") {
      if (formData[key].regular)
        formData[key].regular = parseFloat(formData[key].regular);
      if (formData[key].min) formData[key].min = parseFloat(formData[key].min);
      if (formData[key].max) formData[key].max = parseFloat(formData[key].max);
    }
    if (key === "sale_price") {
      if (formData[key]?.sale)
        formData[key].sale = parseFloat(formData[key]?.sale);
      if (formData[key].min) formData[key].min = parseFloat(formData[key].min);
      if (formData[key].max) formData[key].max = parseFloat(formData[key].max);
    }
    const regex = /s\d+Img/i.test(key);
    if (regex) {
      console.log("here");
      if (formData[key].includes("http")) {
        if (formData.imgs) {
          formData.imgs.push(formData[key]);
        } else {
          formData.imgs = [formData[key]];
        }
      }
    }
    if (key === "product_image") {
      // formData.imgs = [formData[key]];
      // delete formData[key];
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

export const useNewVarientFormAction = routeAction$(async function (
  data,
  event
) {
  const token = event.cookie.get("token")?.value ?? "";
  if (!token) {
    throw event.redirect(301, "/admin-login");
  }
  const formData: any = data;
  Object.keys(formData).forEach((key: string) => {
    if (key === "proprice") {
      formData[key] = parseFloat(formData[key]);
    }
    if (key === "price") {
      formData[key] = parseFloat(formData[key]);
    }
    if (key === "quantity_on_hand") {
      formData[key] = parseFloat(formData[key]);
    }
  });

  await addNewVarient(formData);
  return { status: "success" };
});

export const updateVarients = server$(async (id: any, data: any) => {
  const req = await updateVarations(id, data);
  if (req.status === "error") {
    return JSON.stringify([]);
  }
  return JSON.stringify(req.result);
});

export default component$(() => {
  const productss: any = useEditProductData().value;
  const product = JSON.parse(productss).product;
  const categoriesss = useEditProductData().value;
  const categories = JSON.parse(categoriesss).categories;
  const brandsss = useEditProductData().value;
  const brands = JSON.parse(brandsss).brands;
  const action = useFormAction();
  const VarientFormAction = useNewVarientFormAction();
  const imageSignal = useSignal<string>(product?.imgs[0] ?? "");
  const imageSignalOfNewVarient = useSignal<string>("");
  const NameSignalOfNewVarient = useSignal<string>("");
  const descriptionSignal = useSignal<string>(product?.description ?? "");
  const showToastVarients = useSignal(0);
  const showAddToastVarients = useSignal(0);

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
      `${product.product_name
        ?.replace(/ /g, "-")
        .replace(/[^a-zA-Z0-9\s]/g, "")}/${file?.name
        .split(".")[0]
        .replace(/[^a-zA-Z0-9\s]/g, "")}.webp`
    );
    const uploadReq = await fetch("/api/admin/product/upload", {
      method: "POST",
      body: formData,
    });
    const uploadRes = await uploadReq.json();
    if (uploadRes.message !== 200) {
      return;
    }
    imageSignal.value = `https://xpressbeauty.s3.ca-central-1.amazonaws.com/products-images-2/${product.product_name
      .replace(/ /g, "-")
      .replace(/[^a-zA-Z0-9\s]/g, "")}/${file?.name
      .split(".")[0]
      .replace(/[^a-zA-Z0-9\s]/g, "")}.webp`;

    await goAddMainImg(product, imageSignal.value);
  });

  const handleFileChangeOfVarient = $(async (event: any) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    formData.append(
      "name",
      `${product.product_name
        ?.replace(/ /g, "-")
        .replace(
          /[^a-zA-Z0-9\s]/g,
          ""
        )}/variations/${NameSignalOfNewVarient.value
        .replace(/ /g, "-")
        .replace(/[^a-zA-Z0-9\s]/g, "")}-${file?.name.split(".")[0]}.webp`
    );
    const uploadReq = await fetch("/api/admin/product/upload", {
      method: "POST",
      body: formData,
    });
    const uploadRes = await uploadReq.json();
    if (uploadRes.message !== 200) {
      return;
    }
    imageSignalOfNewVarient.value = `https://xpressbeauty.s3.ca-central-1.amazonaws.com/products-images-2/${product.product_name
      ?.replace(/ /g, "-")
      .replace(/[^a-zA-Z0-9\s]/g, "")}/variations/${NameSignalOfNewVarient.value
      .replace(/ /g, "-")
      .replace(/[^a-zA-Z0-9\s]/g, "")}-${file?.name.split(".")[0]}.webp`;
  });

  const handleAlertClose = $(() => {
    document.querySelector(".alert")?.classList.add("hidden");
    showToastVarients.value = 0;
    showAddToastVarients.value = 0;
  });

  const goUpdateVarations = $(async (id: any) => {
    const result = await updateVarients(id, product.variations);
    if (result) {
      showToastVarients.value = 1;
      window.location.reload();
    }
  });

  const newVrAddedDone = $(() => {
    // console.log(args);
    window.location.reload();
  });

  const editVarientImg = $(async (event: any, item: any) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    formData.append(
      "name",
      `${item.variation_name.replace(/ /g, "-")}/${
        file?.name.split(".")[0]
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
    item.variation_image = `https://xpressbeauty.s3.ca-central-1.amazonaws.com/products-images-2/${item.variation_name.replace(
      / /g,
      "-"
    )}/${file?.name.split(".")[0]}.webp`;

    (
      document.getElementById(item.variation_id + "img") as HTMLImageElement
    ).src = item.variation_image;
  });

  const handleRemoveImg = $(async (imgUrl: string) => {
    //console.log(imgUrl);
    document.getElementById(imgUrl)?.remove();
    await goRemoveImgFromDb(product, imgUrl);
  });

  return (
    <div class="flex h-full w-full flex-col bg-[#F9FAFB]">
      <script
        src="https://cdn.tiny.cloud/1/7d7c50ku3fuvbrrbjft38fdtt26o51zx0iwuab7hlwexhgr9/tinymce/5/tinymce.min.js"
        referrerPolicy="origin"
      ></script>
      {action.isRunning && (
        <>
          <div class="fixed inset-x-0 inset-y-0 z-20 m-auto w-full drop-shadow-lg backdrop-blur-lg backdrop-brightness-75 ">
            <progress class="progress progress-secondary fixed inset-x-0 inset-y-0 z-20 m-auto w-56 bg-black"></progress>
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
        <div class="flex w-full flex-row justify-between">
          <input type="hidden" name="_id" value={product?._id} />
          <input type="hidden" name="priceType" value={product?.priceType} />
          <h1 class="p-2 text-2xl font-bold text-[#6B7280]">
            Edit <span class="text-[#7C3AED]">{product.product_name}</span>{" "}
            Product
          </h1>
          <div class="flex flex-row items-center gap-2">
            <button
              data-drawer-target="drawer-right-example2"
              data-drawer-show="drawer-right-example2"
              data-drawer-placement="right"
              aria-controls="drawer-right-example2"
              disabled={product.priceType == "single"}
              type="button"
              class="border-1 btn btn-ghost btn-sm w-40 border-black text-[#7C3AED]"
            >
              Add Variant
            </button>
            <button
              data-drawer-target="drawer-right-example"
              data-drawer-show="drawer-right-example"
              data-drawer-placement="right"
              aria-controls="drawer-right-example"
              disabled={product.priceType == "single"}
              type="button"
              class="border-1 btn btn-ghost btn-sm w-40 border-black text-[#7C3AED]"
            >
              Manage Variant
            </button>
            <button
              type="submit"
              class="btn btn-sm w-40 bg-[#7C3AED] text-white"
            >
              Save
            </button>
          </div>
        </div>

        <div class="flex h-full w-full flex-col gap-10 bg-[#FFF] p-6">
          <div class="grid grid-cols-9">
            <p class="col-span-1">Image</p>
            <div class="col-span-3 flex flex-col gap-2">
              <img src={imageSignal.value} class="h-24 w-24" alt="" />
              <input
                type="file"
                class="file-input file-input-bordered file-input-sm  w-full max-w-xs"
                onChange$={handleFileChange}
              />
              <input
                type="hidden"
                name="product_image"
                value={imageSignal.value}
              />
            </div>
            <p class="col-span-1">Preview</p>
            <div class="col-span-4 flex flex-wrap gap-2">
              {(product.imgs?.length ?? 0) > 1 &&
                product.imgs?.map((img: string, index: number) => (
                  <div class="flex flex-col" key={index} id={img}>
                    <svg
                      class="mx-1 my-1 h-6 w-6 cursor-pointer self-center rounded-sm bg-gray-100 text-gray-800 shadow dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      onClick$={() => handleRemoveImg(img)}
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 12h14"
                      />
                    </svg>
                    <img
                      width={24}
                      height={24}
                      src={img}
                      class={`h-24 w-24 max-w-full rounded-lg border-2 border-gray-300 object-contain object-center p-3`}
                      alt="Product Image"
                    />
                  </div>
                ))}
            </div>
          </div>
          <div class="grid grid-cols-9">
            <div class="col-span-9 ml-[139px]  ">
              <ExtraImgs product_name={product.product_name} />
            </div>
          </div>

          <div class="grid grid-cols-4">
            <p class="col-span-1">Product Name</p>
            <input
              type="text"
              name="product_name"
              class="input input-md col-span-3 w-full border-[1px] border-[#D1D5DB]"
              value={product.product_name}
            />
          </div>
          <div class="grid grid-cols-4">
            {product.priceType === "range" && (
              <>
                <p class="col-span-1">Price Range</p>
                <div class="col-span-3 flex flex-row items-center gap-2">
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
            {/* {product.priceType === "single" ||
              (!product.priceType && ( */}
            <>
              <p class="col-span-1">Price</p>
              <input
                type="text"
                name="price.regular"
                class="input input-md col-span-3 w-full border-[1px] border-[#D1D5DB]"
                value={product.price?.regular}
              />
            </>
            {/* ))} */}
          </div>

          <div class="grid grid-cols-4">
            {product.priceType === "range" && (
              <>
                <p class="col-span-1">Sale Price Range</p>
                <div class="col-span-3 flex flex-row items-center gap-2">
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
                    value={product.sale_price?.max}
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
                  class="input input-md col-span-3 w-full border-[1px] border-[#D1D5DB]"
                  value={product.sale_price?.sale}
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
                ?.reduce((resArr: any, currentArr: any) => {
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
                ?.reduce((resArr: any, currentArr: any) => {
                  const other = resArr.some(
                    (ele: any) => currentArr?.name === ele?.name
                  );
                  if (!other) resArr.push(currentArr);
                  return resArr;
                }, [])
                .sort((a: any, b: any) => a?.name?.localeCompare(b?.name))
                .map((category: any, index: number) => (
                  <option
                    key={index}
                    value={category?.name}
                    selected={product.categories.some(
                      (cate: any) => cate?.name === category?.name
                    )}
                  >
                    {category?.name}
                  </option>
                ))}
            </select>
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">Brand</p>
            <select class="select w-full max-w-xs" name="companyName.name">
              <option disabled selected={!product.companyName?.name}>
                Pick product brand
              </option>
              {brands.result
                ?.reduce((resArr: any, currentArr: any) => {
                  const other = resArr.some(
                    (ele: any) =>
                      currentArr?.name?.toLowerCase() ===
                      ele?.name?.toLowerCase()
                  );
                  if (!other) resArr.push(currentArr);
                  return resArr;
                }, [])
                .sort((a: any, b: any) => a?.name.localeCompare(b?.name))
                .map((brand: any, index: number) => (
                  <option
                    key={index}
                    value={brand?.name}
                    selected={product.companyName?.name === brand?.name}
                  >
                    {brand?.name}
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
              class="input input-md col-span-3 w-full border-[1px] border-[#D1D5DB]"
              value={product.item_no}
            />
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">SKU</p>
            <input
              type="text"
              name="sku"
              class="input input-md col-span-3 w-full border-[1px] border-[#D1D5DB]"
              value={product?.sku}
            />
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">Quantity on hand</p>
            <input
              type="text"
              name="quantity_on_hand"
              class="input input-md col-span-3 w-full border-[1px] border-[#D1D5DB]"
              value={product?.quantity_on_hand}
            />
          </div>
          <div class="grid grid-cols-4">
            <p class="col-span-1">Barcode value</p>
            <input
              type="text"
              name="bar_code_value"
              class="input input-md col-span-3 w-full border-[1px] border-[#D1D5DB]"
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
            <p class="col-span-1">Gtin</p>
            <input
              type="text"
              name="gtin"
              class="input input-md col-span-3 w-full border-[1px] border-[#D1D5DB]"
              value={product.gtin}
            />
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
              <h3 class="text-lg font-bold">Change Product Visibility!</h3>
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

      <div
        id="drawer-right-example"
        class="fixed right-0 top-0 z-40 h-screen w-1/2 translate-x-full overflow-y-auto bg-gray-50 p-4 transition-transform dark:bg-gray-800"
        aria-labelledby="drawer-right-label"
      >
        {showToastVarients.value === 1 && (
          <div class="w-5/6">
            <Toast
              message="Prices Updated Successfully"
              index={1}
              handleClose={handleAlertClose}
              status="s"
            />
          </div>
        )}

        <h5
          id="drawer-right-label"
          class="mb-4 inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400"
        >
          <svg
            class="me-2.5 h-4 w-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          Variations
        </h5>
        <button
          type="button"
          data-drawer-hide="drawer-right-example"
          aria-controls="drawer-right-example"
          class="absolute end-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            class="h-3 w-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span class="sr-only">Close menu</span>
        </button>

        <div class="mb-6 flex items-end justify-end">
          <button
            onClick$={() => {
              goUpdateVarations(product._id);
            }}
            class="btn btn-sm mr-6 w-40 bg-[#7C3AED] text-white"
          >
            Save
          </button>
        </div>

        <div class="relative h-5/6 overflow-x-auto overflow-y-auto shadow-md sm:rounded-lg">
          <table class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
            <thead class="text-xs uppercase text-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" class="bg-gray-50 px-2 py-1 dark:bg-gray-800">
                  Product name
                </th>
                <th scope="col" class="px-2 py-1">
                  Price
                </th>
                <th scope="col" class="px-2 py-1">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {product.variations.map((item: any, index: number) => (
                <tr
                  key={index}
                  class="border-b border-gray-200 dark:border-gray-700"
                >
                  <th
                    scope="row"
                    class="whitespace-nowrap bg-gray-50 px-2 py-1 font-medium text-gray-900 dark:bg-gray-800 dark:text-white"
                  >
                    <input
                      type="text"
                      class="input input-md col-span-3 w-full border-[1px] text-black border-[#D1D5DB]"
                      value={item.variation_name}
                      onChange$={(e: any) => {
                        item.variation_name = e.target?.value;
                      }}
                    />
                  </th>
                  <td class="px-2 py-1">
                    <input
                      type="number"
                      class="input input-md col-span-3 w-full border-[1px] text-black border-[#D1D5DB]"
                      value={item?.price}
                      onChange$={(e: any) => {
                        item.price = parseFloat(e.target?.value);
                      }}
                    />
                  </td>
                  <td class="px-2 py-1">
                    <input
                      type="number"
                      class="input input-md col-span-3 w-full border-[1px] text-black border-[#D1D5DB]"
                      value={item.quantity_on_hand}
                      onChange$={(e: any) => {
                        item.quantity_on_hand = parseInt(e.target?.value);
                      }}
                    />
                  </td>
                  <td class="px-2 py-1">
                    <img
                      src={item.variation_image}
                      class="h-10 w-10 cursor-pointer rounded"
                      alt=""
                      width={10}
                      height={10}
                      onClick$={() => {
                        document.getElementById(item.variation_id)?.click();
                      }}
                      id={`${item.variation_id}img`}
                      onError$={(e: any) => {
                        const src = product.product_name?.replace(
                          /[^A-Za-z0-9]+/g,
                          ""
                        );
                        const folder = `https://xpressbeauty.s3.ca-central-1.amazonaws.com/products-images-2/${src}/variation/variation-image-${index}.webp`;
                        e.target.src = folder;
                      }}
                    />
                    <input
                      type="file"
                      id={item.variation_id}
                      class="file-input file-input-bordered file-input-sm  w-full max-w-xs"
                      hidden
                      onChange$={(e: any) => {
                        editVarientImg(e, item);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        id="drawer-right-example2"
        class="fixed right-0 top-0 z-40 h-screen w-1/2 translate-x-full overflow-y-auto bg-gray-50 p-4 transition-transform dark:bg-gray-800"
        aria-labelledby="drawer-right-label"
      >
        {showAddToastVarients.value === 1 && (
          <div class="w-5/6">
            <Toast
              message="Added Successfully"
              index={1}
              handleClose={handleAlertClose}
              status="s"
            />
          </div>
        )}

        <h5
          id="drawer-right-label"
          class="mb-4 inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400"
        >
          <svg
            class="me-2.5 h-4 w-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          Add variation
        </h5>
        <button
          type="button"
          data-drawer-hide="drawer-right-example2"
          aria-controls="drawer-right-example2"
          class="absolute end-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            class="h-3 w-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span class="sr-only">Close menu</span>
        </button>

        <div class="relative h-5/6 overflow-x-auto overflow-y-auto shadow-md   sm:rounded-lg">
          <Form
            action={VarientFormAction}
            reloadDocument={false}
            onSubmitCompleted$={newVrAddedDone}
          >
            <div class="flex w-full flex-row justify-between">
              <input type="hidden" name="_id" value={product?._id} />
              <div class="mb-4 flex w-full items-end justify-end gap-2">
                <button
                  onClick$={() => {
                    showAddToastVarients.value = 1;
                  }}
                  type="submit"
                  class="btn btn-sm w-40 bg-[#7C3AED] text-white"
                >
                  Save
                </button>
              </div>
            </div>

            <div class="flex h-full w-full flex-col gap-2 bg-gray-50 p-6">
              <div class="grid grid-cols-4">
                <p class="col-span-1">Variation Name</p>
                <input
                  type="text"
                  name="variation_name"
                  onChange$={(e: any) =>
                    (NameSignalOfNewVarient.value = e.target.value)
                  }
                  class="input input-md col-span-3 w-full border-[1px] border-[#D1D5DB]"
                />
              </div>

              <div class="grid grid-cols-4">
                <p class="col-span-1">Price</p>
                <input
                  type="number"
                  name="price"
                  class="input input-md col-span-3 w-full border-[1px] border-[#D1D5DB]"
                />
              </div>

              <div class="grid grid-cols-4">
                <p class="col-span-1">Pro Price</p>
                <input
                  type="number"
                  name="wholesale_price"
                  class="input input-md col-span-3 w-full border-[1px] border-[#D1D5DB]"
                />
              </div>

              <div class="grid grid-cols-4">
                <p class="col-span-1">Quantity on hand</p>
                <input
                  type="number"
                  name="quantity_on_hand"
                  class="input input-md col-span-3 w-full border-[1px] border-[#D1D5DB]"
                />
              </div>

              <div class="grid grid-cols-4">
                <p class="col-span-1">GTIN</p>
                <input
                  type="text"
                  name="gtin"
                  class="input input-md col-span-3 w-full border-[1px] border-[#D1D5DB]"
                />
              </div>

              <div class="col-span-3 flex flex-col gap-2">
                <img
                  src={imageSignalOfNewVarient.value}
                  class="h-24 w-24"
                  alt=""
                />
                <input
                  type="file"
                  class="file-input file-input-bordered file-input-sm  w-full max-w-xs"
                  onChange$={handleFileChangeOfVarient}
                  disabled={NameSignalOfNewVarient.value.length < 1}
                />
                <input
                  type="hidden"
                  name="variation_image"
                  value={imageSignalOfNewVarient.value}
                />
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
});
