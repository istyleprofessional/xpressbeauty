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
      <div class=" bg-pink-500 flex flex-col lg:flex-row justify-center gap-3 items-center h-12">
        {/* loop through array of 3 */}
        {Array.from({ length: 3 }).map((_, i: number) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            class="w-6 h-6 fill-pink-200"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        ))}
        <p class="text-white text-xs lg:text-base font-normal">
          Shop More & Save More{" "}
        </p>
        {Array.from({ length: 3 }).map((_, i: number) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            class="w-6 h-6 fill-pink-200"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        ))}
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
