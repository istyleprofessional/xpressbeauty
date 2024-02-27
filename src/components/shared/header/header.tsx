import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { TruckShippingIcon } from "../icons/icons";
import CanadaImage from "~/media/canada_1.jpg?jsx";
import USAImage from "~/media/USA.jpg?jsx";
import { server$ } from "@builder.io/qwik-city";

export const changeCountry = server$(async function (country: string) {
  this.cookie.set("cur", country, {
    httpOnly: true,
    path: "/",
  });
  return true;
});

interface HeaderProps {
  countryProp?: string;
}

export const Header = component$((props: HeaderProps) => {
  const { countryProp } = props;
  const country = useSignal<string>("");

  useVisibleTask$(
    () => {
      if (countryProp === "1") country.value = "USD";
      if (countryProp === "2") country.value = "CAD";
    },
    { strategy: "document-idle" }
  );

  return (
    <div class="flex flex-col">
      <div class="  flex flex-row gap-3 justify-center items-center h-12">
        <p class=" text-md lg:text-lg font-bold">Shop More & Save More On</p>{" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-6 h-6"
        >
          <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 1 1 6 0h3a.75.75 0 0 0 .75-.75V15Z" />
          <path d="M8.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM15.75 6.75a.75.75 0 0 0-.75.75v11.25c0 .087.015.17.042.248a3 3 0 0 1 5.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 0 0-3.732-10.104 1.837 1.837 0 0 0-1.47-.725H15.75Z" />
          <path d="M19.5 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
        </svg>
      </div>

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
                  class="w-full text-sm btn btn-ghost flex flex-row gap-2 items-center"
                  onClick$={async () => {
                    country.value = "CAD";
                    await changeCountry("2");
                    location.reload();
                  }}
                >
                  <CanadaImage class="w-12 h-12 md:w-12 md:h-12 object-contain" />{" "}
                  <p class="text-xs lg:text-md">Canada (CAD)</p>
                </button>
                <button
                  class=" text-sm w-full btn flex flex-row gap-2 items-center"
                  onClick$={async () => {
                    country.value = "USD";
                    await changeCountry("1");
                    location.reload();
                  }}
                >
                  <USAImage class="w-12 h-12 md:w-12 md:h-12 object-contain" />
                  <p class="text-xs lg:text-md">
                    United States of America (USD)
                  </p>
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
    </div>
  );
});
