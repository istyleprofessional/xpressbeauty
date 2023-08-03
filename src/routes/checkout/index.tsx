import { component$, $, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, useNavigate } from "@builder.io/qwik-city";
import { InputField } from "~/components/shared/input-field/input-field";
import { Steps } from "~/components/shared/steps/steps";
import { getDummyCustomer } from "~/express/services/dummy.user.service";
import { findUserByBrowserId } from "~/express/services/user.service";
import { postRequest } from "~/utils/fetch.utils";

export const useCheckoutData = routeLoader$(async ({ cookie }) => {
  const browserId = cookie.get("browserId")?.value;
  const verified = cookie.get("verified")?.value;
  if (verified === "false") {
    const request = await getDummyCustomer(browserId ?? "");
    return JSON.stringify({
      request: request,
    });
  } else {
    const request = await findUserByBrowserId(browserId ?? "");
    return JSON.stringify({
      request: request,
    });
  }
});

export default component$(() => {
  const object = useStore<any>({}, { deep: true });
  const validationObject = useStore<any>({}, { deep: true });
  const nav = useNavigate();
  const userData = JSON.parse(useCheckoutData().value);
  const info = userData?.request?.generalInfo;

  useVisibleTask$(() => {
    object.value = info;
  });

  const handleInputChange = $(
    (e: any, identifier: string, isMandatory?: boolean) => {
      console.log(identifier);
      if (isMandatory) {
        if (e.target.value.length === 0) {
          validationObject[identifier] = false;
        } else {
          validationObject[identifier] = true;
        }
      }
      object[identifier] = e?.target?.value;
    }
  );

  const handleSubmit = $(async () => {
    // console.log(object.value);
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
      errorDiv.innerHTML = "";
    }
    const validationArray = Object.values(validationObject);
    console.log(validationArray);
    if (validationArray.includes(false)) {
      if (errorDiv) {
        errorDiv.innerHTML = "Please fill all the mandatory fields";
      }
      return;
    }
    console.log(object);
    if (object === undefined || Object.keys(object).length === 0) {
      if (errorDiv) {
        errorDiv.innerHTML = "Please fill all the mandatory fields";
      }
      return;
    }
    const request = await postRequest("/api/checkout", object);
    const response = await request.json();
    if (response.error) {
      if (errorDiv) {
        errorDiv.innerHTML = response.error;
      }
      return;
    } else {
      nav("/payment");
    }
  });

  return (
    <>
      <div class="flex flex-col gap-10">
        <div class="flex flex-col gap-3 justify-center items-center">
          <Steps pageType="address" />
        </div>
        <div class="flex flex-col justify-center items-center gap-3 bg-[#F4F4F5]">
          <div class="w-full p-10">
            <div class="flex flex-row w-full gap-5">
              <InputField
                label="First Name"
                type="text"
                handleInput={$((e: any) =>
                  handleInputChange(e, "firstName", true)
                )}
                placeholder="Marry"
                value={info?.firstName ?? ""}
                identifier="firstName"
                validation={true}
              />
              <InputField
                label="Last Name"
                type="text"
                handleInput={$((e: any) =>
                  handleInputChange(e, "lastName", false)
                )}
                placeholder="George"
                value={info?.lastName ?? ""}
                identifier="lastName"
                validation={true}
              />
            </div>
            <InputField
              label="Company Name ( Optional )"
              type="text"
              handleInput={$((e: any) =>
                handleInputChange(e, "companyName", false)
              )}
              placeholder="Xpress"
              value={info?.companyName ?? ""}
              identifier="companyName"
              validation={true}
            />
            <InputField
              label="Country/ Region"
              type="text"
              handleInput={$((e: any) =>
                handleInputChange(e, "country_region", true)
              )}
              placeholder="Toronto"
              value={info?.country_region ?? ""}
              identifier="country_region"
              validation={validationObject["country_region"]}
              isMandatory={true}
            />
            <InputField
              label="Street Address"
              type="text"
              handleInput={$((e: any) =>
                handleInputChange(e, "streetAddress", true)
              )}
              placeholder="1234"
              value={info?.streetAddress ?? ""}
              identifier="streetAddress"
              validation={validationObject["streetAddress"]}
              isMandatory={true}
            />
            <InputField
              label="Town / City"
              type="text"
              handleInput={$((e: any) =>
                handleInputChange(e, "town_city", true)
              )}
              placeholder="1234"
              value={info?.town_city ?? ""}
              identifier="town_city"
              validation={validationObject["town_city"]}
              isMandatory={true}
            />
            <InputField
              label="Province"
              type="text"
              handleInput={$((e: any) =>
                handleInputChange(e, "province", true)
              )}
              placeholder="Ontario"
              value={info?.province ?? ""}
              identifier="province"
              validation={validationObject["province"]}
              isMandatory={true}
            />
            <InputField
              label="Postal Code"
              type="text"
              handleInput={$((e: any) =>
                handleInputChange(e, "postalCode", true)
              )}
              placeholder="12344"
              value={info?.postalCode ?? ""}
              identifier="postalCode"
              validation={validationObject["postalCode"]}
              isMandatory={true}
            />
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text text-black text-base">Order Notes</span>
              </label>
              <textarea
                class="textarea textarea-md text-black"
                placeholder="12344"
              ></textarea>
            </div>
          </div>

          <button
            class="btn btn-primary w-[90%] text-base"
            onClick$={handleSubmit}
          >
            Proceed Payment
          </button>
          <div id="error-message" class="text-error"></div>
        </div>
      </div>
    </>
  );
});
