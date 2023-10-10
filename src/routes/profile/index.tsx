import {
  component$,
  useContext,
  $,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  useNavigate,
  server$,
} from "@builder.io/qwik-city";
import { UserContext } from "~/context/user.context";
import { generateUniqueInteger } from "~/utils/generateOTP";

import { InputField } from "~/components/shared/input-field/input-field";
import jwt from "jsonwebtoken";
import {
  getUserEmailById,
  updateExistingUser,
} from "~/express/services/user.service";
import { validate } from "~/utils/validate.utils";
import { Toast } from "~/components/admin/toast/toast";
import { sendVerficationMail } from "~/utils/sendVerficationMail";

export const useUpdateProfile = routeAction$(async (data, requestEvent) => {
  const formData: any = data;
  const token = requestEvent.cookie.get("token")?.value;
  if (!token) {
    throw requestEvent.redirect(301, "/login");
  }
  const validationObject = {
    firstName:
      formData?.firstName !== "" && validate(formData?.firstName ?? "", "name"),
    lastName:
      formData?.lastName !== "" && validate(formData?.lastName ?? "", "name"),
    email: formData?.email !== "" && validate(formData?.email ?? "", "email"),
    phoneNumber:
      formData?.phoneNumber !== "" &&
      validate(formData?.phoneNumber ?? "", "phone"),
    country:
      formData?.generalInfo?.address?.country !== "" &&
      validate(formData?.generalInfo?.address?.country ?? "", "country"),
    addressLine1:
      formData?.generalInfo?.address?.addressLine1 !== "" &&
      validate(formData?.generalInfo?.address?.addressLine1 ?? "", "address"),
    city:
      formData?.generalInfo?.address?.city !== "" &&
      validate(formData?.generalInfo?.address?.city ?? "", "city"),
    state:
      formData?.generalInfo?.address?.state !== "" &&
      validate(formData?.generalInfo?.address?.state ?? "", "state"),
    postalCode:
      formData?.generalInfo?.address?.postalCode !== "" &&
      validate(formData?.generalInfo?.address?.postalCode ?? "", "postalCode"),
  };
  const isValid = Object.values(validationObject).every(
    (item) => item === true
  );

  if (!isValid) {
    return {
      status: "failed",
      message: "Please enter valid details",
      validationObject: validationObject,
    };
  }
  try {
    const verified = jwt.verify(token, process.env.JWTSECRET ?? "");
    if (!verified) {
      throw requestEvent.redirect(301, "/login");
    }
    const updateReq = await updateExistingUser(data, formData?.id ?? "");
    if (updateReq?.status === "failed") {
      return { status: "failed", message: JSON.stringify(updateReq.err) };
    }
    return {
      status: "success",
      message: "User updated successfully",
      user: JSON.stringify(updateReq),
    };
  } catch (error: any) {
    if (error.message === "jwt expired") {
      throw requestEvent.redirect(301, "/login");
    }
  }
});

const getTheToken = server$(async function () {
  const token = this.cookie.get("token")?.value;
  //console.log(cookieValue);
  if (!token) {
    return { status: "failed" };
  }
  try {
    const decoded: any = jwt.verify(token ?? "", process.env.JWTSECRET ?? "");
    if (decoded) {
      const request = await getUserEmailById(decoded.user_id);
      const EmailVerifyToken = generateUniqueInteger();
      // const saveNewUser = await updateEmailVerficationCode(request?.result?.id ?? "" ,EmailVerifyToken );
      if (request?.status === "success") {
        sendVerficationMail(
          request?.result?.email ?? "",
          `${request?.result?.firstName ?? ""} ${
            request?.result?.lastName ?? ""
          }`,
          token ?? "",
          EmailVerifyToken ?? ""
        );
        return { status: "success", token: token };
        // return JSON.stringify({ user: request.result, token: token });
      } else {
        return { status: "failed" };
      }
    }
  } catch (error) {
    return { status: "failed" };
  }
  return { status: "success", token: token ?? "" };
});

export default component$(() => {
  const { user }: any = useContext(UserContext);
  const action = useUpdateProfile();
  const toast = useSignal<HTMLElement>();
  // const token = useSignal<string>("")
  const nav = useNavigate();
  const placesPredictions = useSignal<any[]>([]);
  const country = useSignal<string>("");
  const addressLine1 = useSignal<string>("");
  const city = useSignal<string>("");
  const state = useSignal<string>("");
  const postalCode = useSignal<string>("");

  const handleAlertClose = $(() => {
    toast.value?.remove();
  });
  useVisibleTask$(({ track }) => {
    track(() => action.value?.user);
    if (action.value?.user) {
      const updatedUser = JSON.parse(action.value?.user);
      user.isEmailVerified = updatedUser.result.isEmailVerified;
      user.isPhoneVerified = updatedUser.result.isPhoneVerified;
    }
  });

  // const useCheckoutData = server$(async ({ cookie ,redirect }) => {
  //   const token = cookie.get("token")?.value;
  //   const nav = useNavigate();
  //   if (!token) {
  //     throw redirect(301, "/");
  //   }
  //   try {
  //     const decoded: any = jwt.verify(token ?? "", process.env.JWTSECRET ?? "");
  //     const request = await getUserEmailById(decoded.user_id);
  //     if (request?.status === "success") {
  //       sendVerficationMail(
  //         user?.email ?? "",
  //         `${user?.firstName ?? ""} ${user?.lastName ?? ""}`,
  //         token ?? "",
  //         user?.EmailVerifyToken ?? ""
  //       );
  //       await nav(`/emailVerify/?token=${token ?? ""}`);
  //       console.log("hello");
  //       // return JSON.stringify({ user: request.result, token: token });
  //     } else {
  //       throw redirect(301, "/login");
  //     }
  //   } catch (error) {
  //     throw redirect(301, "/");
  //   }

  //   return { status: "success", token: token ?? "" };

  // });

  const handleStreetAddressChange = $(async (e: any) => {
    const input = e.target.value;
    const url = "/api/places/?input=" + input;
    const req = await fetch(url);
    const data = await req.json();
    placesPredictions.value = data.predictions;
  });

  return (
    <>
      <div class="gird">
        <Form action={action}>
          <div class="px-9 gap-4">
            <div>
              <span class="font-bold"></span>Personal Information{" "}
              <img class="inline" src="/pencil-alt.png"></img>
            </div>
            <div class="mt-6 border-b-2">
              <div class="grid grid-flow-row-dense gap-3 p-6 md:grid-cols-4">
                <div class="md:pt-6">
                  <span>
                    First Name <span class=" text-error">*</span>
                  </span>
                </div>
                <div>
                  <InputField
                    type="text"
                    placeholder="Marry"
                    value={user?.firstName ?? ""}
                    identifier="firstName"
                    validation={
                      action?.value?.validationObject?.firstName ?? true
                    }
                  />
                </div>
              </div>
              <div class="grid grid-flow-row-dense gap-3 p-6 md:grid-cols-4">
                <div class="md:pt-6">
                  <span>
                    Last Name <span class=" text-error">*</span>
                  </span>
                </div>
                <div>
                  <InputField
                    type="text"
                    placeholder="George"
                    value={user?.lastName ?? ""}
                    identifier="lastName"
                    validation={
                      action?.value?.validationObject?.lastName ?? true
                    }
                  />
                </div>
              </div>
              <div class="grid grid-flow-row-dense gap-3 p-6 md:grid-cols-4">
                <div class="md:pt-6">
                  <span>
                    Email Address <span class=" text-error">*</span>
                  </span>
                </div>
                <div class="inline">
                  {user?.isEmailVerified ? (
                    <h1 style="color:green"> Email Verified</h1>
                  ) : (
                    <button
                      onClick$={async () => {
                        const res = await getTheToken();
                        if (res?.status === "success") {
                          await nav(`/emailVerify/?token=${res.token ?? ""}`);
                        }
                      }}
                      class="btn normal-case btn-sm btn-warning"
                    >
                      Verify Email
                    </button>
                  )}
                  <InputField
                    type="email"
                    value={user?.email ?? ""}
                    placeholder="example@gmail.com"
                    identifier="email"
                    validation={action?.value?.validationObject?.email ?? true}
                  />
                </div>
              </div>
              <div class="grid grid-flow-row-dense gap-3 p-6 md:grid-cols-4">
                <div class="md:pt-6">
                  <span>
                    Phone Number <span class=" text-error">*</span>
                  </span>
                </div>
                <div>
                  {user?.isPhoneVerified ? (
                    <h1 style="color:green">Phone Number Verified</h1>
                  ) : (
                    <button
                      onClick$={async () => {
                        const res = await getTheToken();
                        if (res?.status === "success") {
                          await nav(`/phoneVerify/?token=${res.token ?? ""}`);
                        }
                      }}
                      class="btn normal-case btn-sm btn-warning"
                    >
                      Verify Phone
                    </button>
                  )}
                  <InputField
                    type="text"
                    value={user?.phoneNumber ?? ""}
                    placeholder="2222222222"
                    identifier="phoneNumber"
                    validation={
                      action?.value?.validationObject?.phoneNumber ?? true
                    }
                  />
                </div>
              </div>
              <div class="grid grid-flow-row-dense gap-3 p-6 md:grid-cols-4">
                <div class="md:pt-6">
                  <span>Company Name ( Optional )</span>
                </div>
                <div>
                  <InputField
                    type="text"
                    value={user?.generalInfo?.company?.name ?? ""}
                    placeholder="Xpress"
                    identifier="generalInfo.comapny.name"
                    validation={true}
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="px-9 gap-4 mt-12">
            <div>
              <span class="font-bold"></span>Shipping Information{" "}
              <img class="inline" src="/pencil-alt.png"></img>
            </div>
            <div class="mt-6">
              <div class="grid grid-flow-row-dense gap-3 p-6 md:grid-cols-4">
                <div class="md:pt-6">
                  <span>
                    Street Address <span class=" text-error">*</span>
                  </span>
                </div>
                <div class="w-full relative">
                  <InputField
                    type="text"
                    placeholder="1234"
                    identifier="generalInfo.address.addressLine1"
                    value={
                      addressLine1.value ||
                      user?.generalInfo?.address?.addressLine1
                    }
                    validation={
                      action?.value?.validationObject?.addressLine1 ?? true
                    }
                    handleOnChange={handleStreetAddressChange}
                  />
                  {placesPredictions.value?.length > 0 && (
                    <ul class="menu bg-base-200 w-fit absolute rounded-box p-0 [&_li>*]:rounded-none">
                      {placesPredictions.value.map(
                        (item: any, index: number) => (
                          <li key={index}>
                            <button
                              class="btn btn-ghost normal-case"
                              type="button"
                              onClick$={async () => {
                                console.log(item);
                                const data = await fetch(
                                  "/api/places/details?place_id=" +
                                    item.place_id
                                );
                                const result = await data.json();
                                const addressResult = result.result;
                                country.value =
                                  addressResult.address_components.find(
                                    (comp: any) => {
                                      return comp.types.includes("country");
                                    }
                                  )?.long_name;
                                state.value =
                                  addressResult.address_components.find(
                                    (comp: any) => {
                                      return comp.types.includes(
                                        "administrative_area_level_1"
                                      );
                                    }
                                  )?.long_name;
                                city.value =
                                  addressResult.address_components.find(
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
                                      return comp.types.includes(
                                        "street_number"
                                      );
                                    }
                                  )?.long_name +
                                  " " +
                                  addressResult.address_components.find(
                                    (comp: any) => {
                                      return comp.types.includes("route");
                                    }
                                  )?.long_name;
                                placesPredictions.value = [];
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
              </div>
              <div class="grid grid-flow-row-dense gap-3 p-6 md:grid-cols-4">
                <div class="md:pt-6">
                  <span>
                    Country / Region <span class=" text-error">*</span>
                  </span>
                </div>
                <div>
                  <InputField
                    type="text"
                    placeholder="Canada"
                    identifier="generalInfo.address.country"
                    value={country.value || user?.generalInfo?.address?.country}
                    validation={
                      action?.value?.validationObject?.country ?? true
                    }
                    disabled={true}
                  />
                </div>
              </div>

              <div class="grid grid-flow-row-dense gap-3 p-6 md:grid-cols-4">
                <div class="md:pt-6">
                  <span>
                    Town / City <span class=" text-error">*</span>
                  </span>
                </div>
                <div>
                  <InputField
                    type="text"
                    placeholder="Toronto"
                    identifier="generalInfo.address.city"
                    value={city.value || user?.generalInfo?.address?.city}
                    validation={action?.value?.validationObject?.city ?? true}
                    disabled={true}
                  />
                </div>
              </div>
              <div class="grid grid-flow-row-dense gap-3 p-6 md:grid-cols-4">
                <div class="md:pt-6">
                  <span>
                    Province <span class=" text-error">*</span>
                  </span>
                </div>
                <div>
                  <InputField
                    type="text"
                    placeholder="Ontario"
                    identifier="generalInfo.address.state"
                    value={state.value || user?.generalInfo?.address?.state}
                    validation={action?.value?.validationObject?.state ?? true}
                    disabled={true}
                  />
                </div>
              </div>
              <div class="grid grid-flow-row-dense gap-3 p-6 md:grid-cols-4">
                <div class="md:pt-6">
                  <span>
                    Postal Code <span class=" text-error">*</span>
                  </span>
                </div>
                <div>
                  {" "}
                  <InputField
                    type="text"
                    placeholder="12344"
                    identifier="generalInfo.address.postalCode"
                    value={
                      postalCode.value || user?.generalInfo?.address?.postalCode
                    }
                    validation={
                      action?.value?.validationObject?.postalCode ?? true
                    }
                    disabled={true}
                  />
                </div>
              </div>
              <input type="hidden" name="id" value={user?._id ?? ""} />
              <div class="grid md:grid-cols-4 gap-3 p-6">
                <div>
                  <button class="btn btn-primary" type="submit">
                    {action.isRunning && (
                      <span class="loading loading-spinner"></span>
                    )}
                    Save
                  </button>
                </div>

                {action?.value?.status && (
                  <div class="flex flex-col items-center gap-3 bg-[#F4F4F5]">
                    <div ref={toast} class="w-full">
                      <Toast
                        status={action.value.status === "success" ? "s" : "e"}
                        handleClose={handleAlertClose}
                        message={(action?.value?.message as string) ?? ""}
                        index={1}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Form>
      </div>
    </>
  );
});
