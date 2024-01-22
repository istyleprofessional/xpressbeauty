import {
  component$,
  useSignal,
  useVisibleTask$,
  $,
  useContext,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Form, routeAction$ } from "@builder.io/qwik-city";
import { InputField } from "~/components/shared/input-field/input-field";
import { Steps } from "~/components/shared/steps/steps";
import jwt from "jsonwebtoken";
import {
  findUserByUserId,
  updateExistingUser,
} from "~/express/services/user.service";
import type { UserModel } from "~/models/user.model";
import {
  addDummyCustomer,
  getDummyCustomer,
  update_dummy_user,
} from "~/express/services/dummy.user.service";
import { validate } from "~/utils/validate.utils";
import { validatePhone } from "../register";
import { UserContext } from "~/context/user.context";

export const useAddUser = routeAction$(async (data: any, requestEvent) => {
  const secretKey = requestEvent.env.get("PRIVATE_CLOUDFLARE_SECRET_KEY") ?? "";
  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const formData = new FormData();
  formData.append("secret", secretKey);
  formData.append("response", data["cf-turnstile-response"]);
  const req = await fetch(url, {
    method: "POST",
    body: formData,
  });
  const result = await req.json();
  if (!result.success) {
    return { status: "failed" };
  }
  const token = requestEvent.cookie.get("token")?.value;
  if (!token) {
    return { status: "failed" };
  }
  let user: any;
  let isDummy = false;
  try {
    const verify: any = jwt.verify(
      token,
      requestEvent.env.get("VITE_JWTSECRET") ?? ""
    );
    if (verify.isDummy) {
      isDummy = true;
      user = await getDummyCustomer(verify?.user_id ?? "");

      if (user.status !== "success") {
        data.phoneNumber = data.phoneNumber.toString().startsWith("1")
          ? `+${data.phoneNumber}`
          : `+1${data.phoneNumber}`;

        user = await addDummyCustomer(verify?.user_id ?? "", data);
        if (user.status !== "success") {
          return { status: "failed" };
        }
      }
    } else {
      user = await findUserByUserId(verify?.user_id ?? "");
      if (user.status !== "success") {
        return { status: "failed" };
      }
    }
  } catch (error: any) {
    if (error.message === "jwt expired") {
      const decoded: any = jwt.decode(token);
      const newToken = jwt.sign(
        { user_id: decoded.user_id, isDummy: decoded.isDummy },
        requestEvent.env.get("VITE_JWTSECRET") ?? "",
        { expiresIn: "1d" }
      );
      requestEvent.cookie.set("token", newToken, { httpOnly: true, path: "/" });
      if (decoded.isDummy) {
        isDummy = true;
        user = await getDummyCustomer(decoded?.user_id ?? "");
        if (user.status !== "success") {
          return { status: "failed" };
        }
      } else {
        user = await findUserByUserId(decoded?.user_id ?? "");
        if (user.status !== "success") {
          return { status: "failed" };
        }
      }
    }
  }
  if (user.status === "success") {
    const newData: any = data;
    if (newData.same === "on") {
      newData.billing = newData.generalInfo;
      newData.billing.firstName = newData.firstName;
      newData.billing.lastName = newData.lastName;
      newData.billing.email = newData.email;
      newData.billing.phoneNumber = newData.phoneNumber;
    }
    // check if state is valid and not includes undefined or null or purto rico or virgin islands or hawaii
    const validationObject = {
      country: (newData?.generalInfo?.address?.country?.length ?? 0) > 0,
      addressLine1:
        (newData?.generalInfo?.address?.addressLine1?.length ?? 0) > 0,
      city: (newData?.generalInfo?.address?.city?.length ?? 0) > 0,
      state:
        (newData?.generalInfo?.address?.state?.length ?? 0) > 0 &&
        !(
          newData?.generalInfo?.address?.city?.includes("undefined") ||
          newData?.generalInfo?.address?.city?.includes("null") ||
          newData?.generalInfo?.address?.city?.includes("Puerto Rico") ||
          newData?.generalInfo?.address?.city?.includes("Virgin Islands") ||
          newData?.generalInfo?.address?.city?.includes("Hawaii")
        ),
      postalCode: (newData?.generalInfo?.address?.postalCode?.length ?? 0) > 0,
      firstName:
        validate(newData?.firstName?.trim() ?? "", "firstName") &&
        newData?.firstName.length > 0,
      lastName:
        validate(newData?.lastName?.trim() ?? "", "lastName") &&
        newData?.lastName.length > 0,
      email:
        validate(newData?.email?.trim() ?? "", "email") &&
        newData?.email.length > 0,
      phoneNumber:
        validate(
          (newData?.phoneNumber.toString().startsWith("1")
            ? `+${newData?.phoneNumber?.trim()}`
            : `+1${newData.phoneNumber?.trim()}`) ?? "",
          "phoneNumber"
        ) && newData?.phoneNumber.length >= 10,
      billingCountry: (newData?.billing?.address?.country?.length ?? 0) > 0,
      billingAddressLine1:
        (newData?.billing?.address?.addressLine1?.length ?? 0) > 0,
      billingCity: (newData?.billing?.address?.city?.length ?? 0) > 0,
      billingState: (newData?.billing?.address?.state?.length ?? 0) > 0,
      billingPostalCode:
        (newData?.billing?.address?.postalCode?.length ?? 0) > 0,
      billingFirstName:
        validate(newData?.billing?.firstName?.trim() ?? "", "firstName") &&
        newData?.billing?.firstName.length > 0,
      billingLastName:
        validate(newData?.billing?.lastName?.trim() ?? "", "lastName") &&
        newData?.billing?.lastName.length > 0,
      billingEmail:
        validate(newData?.billing?.email?.trim() ?? "", "email") &&
        newData?.billing?.email.length > 0,
      billingPhoneNumber:
        validate(
          (newData?.billing?.phoneNumber.toString().startsWith("1")
            ? `+${newData?.billing?.phoneNumber?.trim()}`
            : `+1${newData?.billing?.phoneNumber?.trim()}`) ?? "",
          "phoneNumber"
        ) && newData?.billing?.phoneNumber.length >= 10,
    };
    const isValid = Object.values(validationObject).every((item) => item);
    newData.phoneNumber = newData.phoneNumber.toString().startsWith("1")
      ? `+${newData.phoneNumber}`
      : `+1${newData.phoneNumber}`;
    if (isValid) {
      if (isDummy) {
        user.result = await update_dummy_user(
          newData,
          user?.result?._id.toString()
        );
      } else {
        user.result = await updateExistingUser(
          newData,
          user?.result?._id.toString()
        );
      }
      return { status: "success", isDummy: isDummy, token: token };
    }
    return { status: "failed", validation: validationObject };
  }
  return { status: "falied" };
});

export default component$(() => {
  const isLoading = useSignal(false);
  const userData: any = useContext(UserContext);
  const info: UserModel = userData ?? {};
  const action = useAddUser();
  const messageToast = useSignal<string>("");
  const placesShipPredictions = useSignal<any[]>([]);
  const placesBillPredictions = useSignal<any[]>([]);
  const country = useSignal<string>("");
  const addressLine1 = useSignal<string>("");
  const city = useSignal<string>("");
  const state = useSignal<string>("");
  const postalCode = useSignal<string>("");
  const isPhoneValid = useSignal<boolean>(false);
  const message = useSignal<string>("");
  const shortCountryCode = useSignal<string>("");
  const shortStateCode = useSignal<string>("");
  const showBillingAddress = useSignal<boolean>(true);
  const countryBill = useSignal<string>("");
  const addressLine1Bill = useSignal<string>("");
  const cityBill = useSignal<string>("");
  const stateBill = useSignal<string>("");
  const postalCodeBill = useSignal<string>("");
  const captchaToken = useSignal<string>("");

  useVisibleTask$(({ track }) => {
    track(() => action.value);
    console.log(action.value);
    // check if validation object has any false value
    if (
      action.value?.status === "failed" &&
      Object.values(action.value?.validation ?? {}).reduce((a, b) => a || b)
    ) {
      messageToast.value =
        "Please fill all the required fields and Make sure you have entered a valid information";
    }
    if (action.value?.status === "success") {
      location.href = `/payment`;
    }
    isLoading.value = false;
  });

  useVisibleTask$(({ track, cleanup }) => {
    track(() => messageToast.value);
    if (messageToast.value !== "") {
      const time = setTimeout(() => {
        messageToast.value = "";
      }, 3000);
      cleanup(() => {
        clearTimeout(time);
      });
    }
  });

  useVisibleTask$(() => {
    country.value = info?.generalInfo?.address?.country ?? "";
    addressLine1.value = info?.generalInfo?.address?.addressLine1 ?? "";
    city.value = info?.generalInfo?.address?.city ?? "";
    state.value = info?.generalInfo?.address?.state ?? "";
    postalCode.value = info?.generalInfo?.address?.postalCode ?? "";
  });

  const handlePlacesFetch = $(async (e: any, source?: string) => {
    const input = e.target.value;
    const url = "/api/places/?input=" + input;

    const req = await fetch(url);
    const data = await req.json();
    if (source === "billing") {
      placesBillPredictions.value = data.predictions;
      return;
    }
    placesShipPredictions.value = data.predictions;
  });

  const handlePhoneChange = $(async (e: any) => {
    isPhoneValid.value = false;
    let phone = e.target.value;
    if (phone.startsWith("1")) phone = e.target.value.slice(1);
    if (phone.startsWith("+1")) phone = e.target.value.slice(2);

    if (phone.length !== 10) {
      message.value = "";
      return;
    }
    const req = await validatePhone(e.target.value);
    const result = JSON.parse(req?.res ?? "");
    if (!(result.countryCode == "US" || result.countryCode == "CA")) {
      isPhoneValid.value = false;
      message.value = "Please enter a valid USA or Canada phone number";
      return;
    }
    message.value = "";
    isPhoneValid.value = true;
  });

  useVisibleTask$(
    () => {
      if (typeof window === "undefined") return;
      console.log("onloadTurnstileCallback");
      (window as any).onloadTurnstileCallback = function () {
        // get token from turnstile

        this.turnstile.render("#example-container", {
          sitekey: import.meta.env.PUBLIC_CLOUDFLARE_SITE_KEY,
          callback: (token: string) => {
            if (token) {
              captchaToken.value = token;
            }
          },
        });
      };
    },
    { strategy: "document-ready" }
  );

  return (
    <div class="flex flex-col gap-10 p-4">
      {messageToast.value !== "" && (
        <div role="alert" class="alert alert-error sticky top-0 z-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{messageToast.value}</span>
        </div>
      )}
      <div class="flex flex-col gap-3 justify-center items-center">
        <Steps pageType="address" />
      </div>
      <div class="flex flex-col justify-center items-center gap-3 bg-[#F4F4F5]">
        <Form action={action} class="w-full justify-center">
          <div class="w-full p-10 flex flex-col justify-center items-center">
            <h1 class="text-2xl font-bold p-2">Shipping Details</h1>
            <p class="text-base font-light p-2 text-center">
              {" "}
              We are not shipping to Puerto Rico, Virgin Islands and Hawaii.
            </p>
            <div class="flex flex-col lg:flex-row w-full lg:gap-5">
              <InputField
                label="First Name"
                type="text"
                placeholder="Marry"
                value={info?.firstName ?? ""}
                identifier="firstName"
                validation={action?.value?.validation?.firstName}
                isMandatory={true}
              />
              <InputField
                label="Last Name"
                type="text"
                placeholder="George"
                value={info?.lastName ?? ""}
                identifier="lastName"
                validation={action?.value?.validation?.lastName}
                isMandatory={true}
              />
            </div>
            <div class="flex flex-col lg:flex-row w-full lg:gap-5">
              <InputField
                label="Email Address"
                type="text"
                placeholder="xxxxxx@xxxx.xxx"
                value={info?.email ?? ""}
                identifier="email"
                validation={action?.value?.validation?.email}
                isMandatory={true}
              />
              <div class="flex flex-col w-full justify-start">
                {message.value !== "" && (
                  <p class="text-error text-sm font-light">{message.value}</p>
                )}
                <InputField
                  label="Phone Number"
                  type="text"
                  placeholder="1234567890"
                  value={info?.phoneNumber?.replace("+", "") ?? ""}
                  identifier="phoneNumber"
                  validation={action?.value?.validation?.phoneNumber}
                  isMandatory={true}
                  handleOnChange={handlePhoneChange}
                />
              </div>
            </div>
            <InputField
              label="Company Name ( Optional )"
              type="text"
              placeholder="Xpress"
              value={info?.generalInfo?.comapny?.name ?? ""}
              identifier="generalInfo.company.companyName"
              validation={true}
            />
            <div class=" w-full relative">
              <InputField
                label="Street Address"
                type="text"
                placeholder="1234"
                value={addressLine1.value}
                identifier="generalInfo.address.addressLine1"
                validation={action?.value?.validation?.addressLine1}
                isMandatory={true}
                source="shipping"
                handleOnChange={handlePlacesFetch}
              />
              {placesShipPredictions.value?.length > 0 && (
                <ul class="menu bg-base-200 w-fit absolute rounded-box">
                  {placesShipPredictions.value.map(
                    (item: any, index: number) => (
                      <li key={index}>
                        <button
                          class="btn btn-ghost normal-case"
                          type="button"
                          onClick$={async () => {
                            const data = await fetch(
                              "/api/places/details?place_id=" + item.place_id
                            );
                            const result = await data.json();
                            const addressResult = result.result;
                            country.value =
                              addressResult.address_components.find(
                                (comp: any) => {
                                  return comp.types.includes("country");
                                }
                              )?.long_name;
                            state.value = addressResult.address_components.find(
                              (comp: any) => {
                                return comp.types.includes(
                                  "administrative_area_level_1"
                                );
                              }
                            )?.long_name;
                            shortCountryCode.value =
                              addressResult.address_components.find(
                                (comp: any) => {
                                  return comp.types.includes("country");
                                }
                              )?.short_name;
                            shortStateCode.value =
                              addressResult.address_components.find(
                                (comp: any) => {
                                  return comp.types.includes(
                                    "administrative_area_level_1"
                                  );
                                }
                              )?.short_name;
                            city.value = addressResult.address_components.find(
                              (comp: any) => {
                                return comp.types.includes("locality");
                              }
                            )?.long_name;
                            postalCode.value =
                              addressResult.address_components.find(
                                (comp: any) => {
                                  return comp.types.includes("postal_code");
                                }
                              )?.long_name;
                            addressLine1.value =
                              addressResult.address_components.find(
                                (comp: any) => {
                                  return comp.types.includes("street_number");
                                }
                              )?.long_name +
                              " " +
                              addressResult.address_components.find(
                                (comp: any) => {
                                  return comp.types.includes("route");
                                }
                              )?.long_name;
                            placesShipPredictions.value = [];
                          }}
                        >
                          {item.description}
                        </button>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
            <input
              class="hidden"
              name="generalInfo.address.shortCountryCode"
              value={shortCountryCode.value}
            />
            <input
              class="hidden"
              name="generalInfo.address.shortStateCode"
              value={shortStateCode.value}
            />
            <InputField
              label="Town / City"
              type="text"
              placeholder="Toronto"
              value={city.value}
              identifier="generalInfo.address.city"
              validation={action?.value?.validation?.city}
              isMandatory={true}
              // disabled={true}
            />
            <InputField
              label="Province"
              type="text"
              placeholder="Ontario"
              value={state.value}
              identifier="generalInfo.address.state"
              validation={action?.value?.validation?.state}
              isMandatory={true}
              // disabled={true}
            />
            <InputField
              label="Postal Code"
              type="text"
              placeholder="12344"
              value={postalCode.value}
              identifier="generalInfo.address.postalCode"
              validation={action?.value?.validation?.postalCode}
              isMandatory={true}
              // disabled={true}
            />
            <InputField
              label="Country/ Region"
              type="text"
              placeholder="Canada"
              value={country.value}
              identifier="generalInfo.address.country"
              validation={action?.value?.validation?.country}
              isMandatory={true}
              // disabled={true}
            />
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text text-black text-base">Order Notes</span>
              </label>
              <textarea
                class="textarea textarea-md text-black"
                name="orderNotes"
                placeholder="12344"
              ></textarea>
            </div>
          </div>
          <div class="form-control w-96 p-3">
            <label class="label cursor-pointer">
              <span class="label-text text-black text-base">
                Billing Address same as Shipping Address
              </span>
              <input
                type="checkbox"
                checked={true}
                class="checkbox"
                name="same"
                onChange$={(e: any) => {
                  showBillingAddress.value = e.target.checked;
                }}
              />
            </label>
          </div>
          <div class="divider"></div>
          {!showBillingAddress.value && (
            <div class="w-full p-10 flex flex-col justify-center items-center">
              <h1 class="text-2xl font-bold p-2">Billing Details</h1>
              <div class="flex flex-col lg:flex-row w-full lg:gap-5">
                <InputField
                  label="First Name"
                  type="text"
                  placeholder="Marry"
                  value={info?.firstName ?? ""}
                  identifier="billing.firstName"
                  validation={action?.value?.validation?.billingFirstName}
                  isMandatory={true}
                />
                <InputField
                  label="Last Name"
                  type="text"
                  placeholder="George"
                  value={info?.lastName ?? ""}
                  identifier="billing.lastName"
                  validation={action?.value?.validation?.billingLastName}
                  isMandatory={true}
                />
              </div>
              <div class="flex flex-col lg:flex-row w-full lg:gap-5">
                <InputField
                  label="Email Address"
                  type="text"
                  placeholder="xxxxxx@xxxx.xxx"
                  value={info?.email ?? ""}
                  identifier="billing.email"
                  validation={action?.value?.validation?.billingEmail}
                  isMandatory={true}
                />
                <div class="flex flex-col w-full justify-start">
                  {message.value !== "" && (
                    <p class="text-error text-sm font-light">{message.value}</p>
                  )}
                  <InputField
                    label="Phone Number"
                    type="text"
                    placeholder="1234567890"
                    value={info?.phoneNumber?.replace("+", "") ?? ""}
                    identifier="billing.phoneNumber"
                    validation={action?.value?.validation?.billingPhoneNumber}
                    isMandatory={true}
                    handleOnChange={handlePhoneChange}
                  />
                </div>
              </div>
              <div class=" w-full relative">
                <InputField
                  label="Street Address"
                  type="text"
                  placeholder="1234"
                  value={addressLine1Bill.value}
                  identifier="billing.address.addressLine1"
                  validation={action?.value?.validation?.billingAddressLine1}
                  isMandatory={true}
                  source="billing"
                  handleOnChange={handlePlacesFetch}
                />
                {placesBillPredictions.value?.length > 0 && (
                  <ul class="menu bg-base-200 w-fit absolute rounded-box">
                    {placesBillPredictions.value.map(
                      (item: any, index: number) => (
                        <li key={index}>
                          <button
                            class="btn btn-ghost normal-case"
                            type="button"
                            onClick$={async () => {
                              const data = await fetch(
                                "/api/places/details?place_id=" + item.place_id
                              );
                              const result = await data.json();
                              const addressResult = result.result;
                              countryBill.value =
                                addressResult.address_components.find(
                                  (comp: any) => {
                                    return comp.types.includes("country");
                                  }
                                )?.long_name;
                              stateBill.value =
                                addressResult.address_components.find(
                                  (comp: any) => {
                                    return comp.types.includes(
                                      "administrative_area_level_1"
                                    );
                                  }
                                )?.long_name;
                              cityBill.value =
                                addressResult.address_components.find(
                                  (comp: any) => {
                                    return comp.types.includes("locality");
                                  }
                                )?.long_name;
                              postalCodeBill.value =
                                addressResult.address_components.find(
                                  (comp: any) => {
                                    return comp.types.includes("postal_code");
                                  }
                                )?.long_name;
                              addressLine1Bill.value =
                                addressResult.address_components.find(
                                  (comp: any) => {
                                    return comp.types.includes("street_number");
                                  }
                                )?.long_name +
                                " " +
                                addressResult.address_components.find(
                                  (comp: any) => {
                                    return comp.types.includes("route");
                                  }
                                )?.long_name;
                              placesBillPredictions.value = [];
                            }}
                          >
                            {item.description}
                          </button>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>
              <InputField
                label="Town / City"
                type="text"
                placeholder="Toronto"
                value={cityBill.value}
                identifier="billing.address.city"
                validation={action?.value?.validation?.billingCity}
                isMandatory={true}
                // disabled={true}
              />
              <InputField
                label="Province"
                type="text"
                placeholder="Ontario"
                value={stateBill.value}
                identifier="billing.address.state"
                validation={action?.value?.validation?.billingState}
                isMandatory={true}
                // disabled={true}
              />
              <InputField
                label="Postal Code"
                type="text"
                placeholder="12344"
                value={postalCodeBill.value}
                identifier="billing.address.postalCode"
                validation={action?.value?.validation?.billingPostalCode}
                isMandatory={true}
                // disabled={true}
              />
              <InputField
                label="Country/ Region"
                type="text"
                placeholder="Canada"
                value={countryBill.value}
                identifier="billing.address.country"
                validation={action?.value?.validation?.billingCountry}
                isMandatory={true}
                // disabled={true}
              />
            </div>
          )}
          <div class="flex flex-col gap-2 w-full justify-center items-center">
            <button
              class="btn bg-black text-white text-base m-2"
              type="submit"
              disabled={isLoading.value || !captchaToken.value}
              onClick$={() => (isLoading.value = true)}
            >
              {isLoading.value && <span class="loading loading-spinner"></span>}
              Proceed Payment
            </button>
            <div id="example-container"></div>
          </div>
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Xpress Beauty | Checkout",
  links: [
    {
      rel: "canonical",
      href: "https://xpressbeauty.ca/checkout/",
    },
  ],
  meta: [
    {
      name: "description",
      content: "Checkout - XpressBeauty",
    },
  ],
};
