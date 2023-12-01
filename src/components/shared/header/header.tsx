import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { TruckShippingIcon } from "../icons/icons";
import CanadaImage from "~/media/canada_1.jpg?jsx";
import USAImage from "~/media/USA.jpg?jsx";
import { server$ } from "@builder.io/qwik-city";

export const checkCountry = server$(async function () {
  const country = this.cookie.get("cur")?.value ?? "";
  return country;
});

export const changeCountry = server$(async function (country: string) {
  this.cookie.set("cur", country, {
    httpOnly: true,
    path: "/",
  });
  return true;
});

export const Header = component$(() => {
  const country = useSignal<string>("");

  useVisibleTask$(async () => {
    const checkCountryReq = await checkCountry();
    if (checkCountryReq === "1") {
      country.value = "USD";
    } else {
      country.value = "CAD";
    }
  });

  return (
    <div class="bg-black navbar flex flex-col lg:flex-row justify-center gap-3 items-center  h-fit lg:h-12">
      <div class="flex flex-col lg:flex-row gap-3 lg:gap-40">
        <p class="text-white text-xs lg:text-base flex flex-row gap-1 font-normal">
          Fast Canada And USA Wide Shipping{" "}
          <span>
            {" "}
            <TruckShippingIcon />
          </span>
        </p>
      </div>
      <div class="flex w-full justify-center lg:justify-end flex-1 px-2">
        <div class="flex items-stretch">
          <button
            class="btn"
            onClick$={() =>
              (document as any)?.getElementById("my_modal_1")?.showModal()
            }
          >
            {country.value ? country.value : "Country"}
          </button>
          <dialog id="my_modal_1" class="modal">
            <div class="modal-box flex flex-col gap-5">
              <h3 class="font-bold text-lg">Choose the currency!</h3>
              <button
                class="w-full text-sm btn"
                onClick$={async () => {
                  country.value = "CAD";
                  await changeCountry("2");
                  location.reload();
                }}
              >
                <CanadaImage class="w-full h-full md:w-12 md:h-12 object-contain" />{" "}
                <p class="text-xs lg:text-md">Canada (CAD)</p>
              </button>
              <button
                class=" text-sm w-full btn"
                onClick$={async () => {
                  country.value = "USD";
                  await changeCountry("1");
                  location.reload();
                }}
              >
                <USAImage class="w-12 h-12 md:w-12 md:h-12 object-contain" />
                <p class="text-xs lg:text-md">United States of America (USD)</p>
              </button>
              <div class="modal-action">
                <form method="dialog">
                  {/* if there is a button in form, it will close the modal */}
                  <button class="btn">Close</button>
                </form>
              </div>
            </div>
          </dialog>
        </div>
      </div>
    </div>
  );
});
