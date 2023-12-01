import { component$, $, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Form, routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import { Toast } from "~/components/admin/toast/toast";
import { get_all_brands } from "~/express/services/brand.service";
import { get_all_categories } from "~/express/services/category.service";
import { addProductServer } from "~/express/services/product.service";

export const useEditProductData = routeLoader$(async () => {
  const categories = await get_all_categories();
  const brands = await get_all_brands();
  return JSON.stringify({
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
    if (key === "price") {
      for (const price in formData[key]) {
        formData[key][price] = parseFloat(formData[key][price]);
      }
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
    formData["perfix"] = encodeURIComponent(
      formData["product_name"]
        ?.replace(/[^a-zA-Z0-9 ]/g, "") // Exclude numbers from removal
        .replace(/ /g, "-")
        .toLowerCase() ?? ""
    );
    if (key === "variations") {
      if (
        formData[key].length === 1 &&
        formData[key][0].variation_name === ""
      ) {
        formData[key] = [];
        return;
      }

      formData[key].forEach((variation: any) => {
        variation.quantity_on_hand = parseInt(variation.quantity_on_hand);
      });
      const newVariations = formData[key].filter(
        (variation: any) => variation !== null
      );
      formData[key] = newVariations;
    }
  });
  await addProductServer(formData);
  return { status: "success" };
});

export default component$(() => {
  const categories = JSON.parse(useEditProductData()?.value ?? "[]").categories;
  const brands = JSON.parse(useEditProductData()?.value ?? "[]").brands;
  const action = useFormAction();
  const imageSignal = useSignal<string>("");
  const descriptionSignal = useSignal<string>("");
  const productName = useSignal<string>("");
  const isVariantOpen = useSignal<boolean>(false);
  const variantSignal = useSignal<number>(1);
  const typeOfPrice = useSignal<string>("");

  useVisibleTask$(({ track }) => {
    track(() => productName.value);
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

  const handleFileChange = $(async (event: any, track: string) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    const uuid = Math.random().toString(36).substring(2, 15);
    formData.append(
      "name",
      `${productName.value.replace(/ /g, "-")}/${
        file.name.split(".")[0]
      }${uuid}.webp`
    );
    const uploadReq = await fetch("/api/admin/product/upload", {
      method: "POST",
      body: formData,
    });
    const uploadRes = await uploadReq.json();
    if (uploadRes.message !== 200) {
      return;
    }
    if (track === "main") {
      imageSignal.value = `https://xpressbeauty.s3.ca-central-1.amazonaws.com/testimages/${productName.value.replace(
        / /g,
        "-"
      )}/${file.name.split(".")[0]}${uuid}.webp`;
    }
    if (track === "variant") {
      document
        .querySelector(`#variantImage-${variantSignal.value}`)
        ?.setAttribute(
          "src",
          `https://xpressbeauty.s3.ca-central-1.amazonaws.com/testimages/${productName.value.replace(
            / /g,
            "-"
          )}/${file.name.split(".")[0]}${uuid}.webp`
        );

      // return `https://xpressbeauty.s3.ca-central-1.amazonaws.com/testimages/${productName.value.replace(
      //   / /g,
      //   "-"
      // )}/${file.name.split(".")[0]}${uuid}.webp`;
    }
    // imageSignal.value = `https://xpressbeauty.s3.ca-central-1.amazonaws.com/testimages/${productName.value.replace(
    //   / /g,
    //   "-"
    // )}/${file.name.split(".")[0]}${uuid}.webp`;
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
          {/* <input type="hidden" name="_id" value={product?._id} /> */}
          {/* <input type="hidden" name="priceType" value={product?.priceType} /> */}
          <h1 class="text-2xl font-bold p-2 text-[#6B7280]">Add Product</h1>
          <div class="flex flex-row gap-2 items-center">
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
            <p class="col-span-1">Product Name</p>
            <input
              type="text"
              name="product_name"
              class="input input-md w-full border-[1px] border-[#D1D5DB] col-span-3"
              onInput$={(e: any) => (productName.value = e.target.value)}
            />
          </div>
          {productName.value !== "" && (
            <>
              <div class="grid grid-cols-4">
                <p class="col-span-1">Image</p>
                <div class="col-span-3 flex flex-col gap-2">
                  <img src={imageSignal.value} class="w-24 h-24" alt="" />
                  <input
                    type="file"
                    class="file-input file-input-xs file-input-bordered w-full max-w-xs"
                    onChange$={(event: any) => handleFileChange(event, "main")}
                  />
                  <input
                    type="hidden"
                    name="product_image"
                    value={imageSignal.value}
                  />
                </div>
              </div>

              <div class="grid grid-cols-4">
                <p class="col-span-1">Price Type</p>
                <select
                  class="select w-full max-w-xs"
                  name="priceType"
                  onChange$={(e) => (typeOfPrice.value = e.target.value)}
                >
                  <option disabled>Pick product price type</option>
                  <option value="single">Single</option>
                  <option value="range">Range</option>
                </select>
              </div>
              <div class="grid grid-cols-4">
                {typeOfPrice.value === "range" && (
                  <>
                    <p class="col-span-1">Price Range</p>
                    <div class="flex flex-row gap-2 col-span-3 items-center">
                      <input
                        type="text"
                        name="price.min"
                        class="input input-md w-full border-[1px] border-[#D1D5DB]"
                      />
                      <p class="col-span-1">-</p>
                      <input
                        type="text"
                        name="price.max"
                        class="input input-md w-full border-[1px] border-[#D1D5DB]"
                      />
                    </div>
                  </>
                )}
                {typeOfPrice.value === "single" && (
                  <>
                    <p class="col-span-1">Price</p>
                    <input
                      type="text"
                      name="price.regular"
                      class="input input-md w-full border-[1px] border-[#D1D5DB] col-span-3"
                    />
                  </>
                )}
              </div>
              <div class="grid grid-cols-4">
                {typeOfPrice.value === "range" && (
                  <>
                    <p class="col-span-1">Sale Price Range</p>
                    <div class="flex flex-row gap-2 col-span-3 items-center">
                      <input
                        type="text"
                        name="sale_price.min"
                        class="input input-md w-full border-[1px] border-[#D1D5DB]"
                      />
                      <p class="col-span-1">-</p>
                      <input
                        type="text"
                        name="sale_price.max"
                        class="input input-md w-full border-[1px] border-[#D1D5DB]"
                      />
                    </div>
                  </>
                )}
                {typeOfPrice.value === "single" && (
                  <>
                    <p class="col-span-1">Sale Price</p>
                    <input
                      type="text"
                      name="sale_price.sale"
                      class="input input-md w-full border-[1px] border-[#D1D5DB] col-span-3"
                    />
                  </>
                )}
              </div>
              <div class="grid grid-cols-4">
                <p class="col-span-1">Category</p>
                <select class="select w-full max-w-xs" name="category">
                  <option disabled>Pick product main category</option>
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
                        <option key={index} value={category.main}>
                          {category.main}
                        </option>
                      );
                    })}
                </select>
              </div>
              <div class="grid grid-cols-4">
                <p class="col-span-1">Sub Category</p>
                <select class="select w-full max-w-xs" name="sub-category">
                  <option disabled>Pick product sub category</option>
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
                      <option key={index} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>
              <div class="grid grid-cols-4">
                <p class="col-span-1">Brand</p>
                <select class="select w-full max-w-xs" name="companyName.name">
                  <option disabled>Pick product brand</option>
                  {brands.result
                    .reduce((resArr: any, currentArr: any) => {
                      const other = resArr.some(
                        (ele: any) =>
                          currentArr.name.toLowerCase() ===
                          ele.name.toLowerCase()
                      );
                      if (!other) resArr.push(currentArr);
                      return resArr;
                    }, [])
                    .sort((a: any, b: any) => a.name.localeCompare(b.name))
                    .map((brand: any, index: number) => (
                      <option key={index} value={brand.name}>
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
                />
              </div>
              <div class="grid grid-cols-4">
                <p class="col-span-1">SKU</p>
                <input
                  type="text"
                  name="sku"
                  class="input input-md w-full border-[1px] border-[#D1D5DB] col-span-3"
                />
              </div>
              <div class="grid grid-cols-4">
                <p class="col-span-1">Quantity on hand</p>
                <input
                  type="text"
                  name="quantity_on_hand"
                  class="input input-md w-full border-[1px] border-[#D1D5DB] col-span-3"
                />
              </div>
              <div class="grid grid-cols-4">
                <p class="col-span-1">Barcode value</p>
                <input
                  type="text"
                  name="bar_code_value"
                  class="input input-md w-full border-[1px] border-[#D1D5DB] col-span-3"
                />
              </div>
              <div class="grid grid-cols-4">
                <p class="col-span-1">Update Using QuickBooks</p>
                <input
                  class="form-checkbox h-5 w-5 text-[#7C3AED]"
                  type="checkbox"
                  name="updateQuickBooks"
                />
              </div>
              <button
                type="button"
                onClick$={() => (isVariantOpen.value = !isVariantOpen.value)}
                class="btn btn-primary w-96"
              >
                Add Variation
              </button>
              {isVariantOpen.value && (
                <div class="grid grid-cols-4">
                  <p class="col-span-1">Add Variation</p>
                  <div class="flex flex-col gap-2 p-2 variantArray">
                    <p>Variation Name</p>
                    <input
                      type="text"
                      class="input input-md w-full border-[1px] border-[#D1D5DB]"
                      name="variations.1.variation_name"
                    />
                    <p>Variation Image</p>
                    <img
                      src=""
                      class="w-24 h-24"
                      alt=""
                      id={`variantImage-${variantSignal.value}`}
                    />
                    <input
                      type="file"
                      class="file w-full"
                      onChange$={(event: any) =>
                        handleFileChange(event, "variant")
                      }
                    />
                    <input type="hidden" name="variations.1.variation_image" />
                    <p>Variation price</p>
                    <input
                      type="text"
                      class="input input-md w-full border-[1px] border-[#D1D5DB]"
                      name="variations.1.price"
                    />
                    <p>Variation quantity</p>
                    <input
                      type="text"
                      class="input input-md w-full border-[1px] border-[#D1D5DB]"
                      name="variations.1.quantity_on_hand"
                    />
                    <hr class="border-[#D1D5DB] mt-5 pb-5" />
                  </div>
                  <div class="flex flex-row justify-end items-center p-2">
                    <button
                      type="button"
                      class="btn btn-primary"
                      onClick$={() => {
                        document
                          .querySelector(".variantArray")
                          ?.insertAdjacentHTML(
                            "beforeend",
                            `<p>Variation Name</p>
                          <input
                            type="text"
                            class="input input-md w-full border-[1px] border-[#D1D5DB]"
                            name="variations.${
                              variantSignal.value - 1
                            }.variation_name"
                          />
                          <p>Variation Image</p>
                          <img
                            src=""
                            class="w-24 h-24"
                            alt=""
                            id="variantImage-${variantSignal.value + 1}"
                          />
                          <input
                            type="file"
                            class="file w-full"
                          />
                          <input type="hidden" name="variations.${
                            variantSignal.value - 1
                          }.variation_image" />
                          <p>Variation price</p>
                          <input
                            type="text"
                            class="input input-md w-full border-[1px] border-[#D1D5DB]"
                            name="variations.${variantSignal.value - 1}.price"
                          />
                          <p>Variation quantity</p>
                          <input
                            type="text"
                            class="input input-md w-full border-[1px] border-[#D1D5DB]"
                            name="variations.${
                              variantSignal.value - 1
                            }.quantity_on_hand"
                          />

                          <hr class="border-[#D1D5DB] mt-5 pb-5" />`
                          );
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
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
