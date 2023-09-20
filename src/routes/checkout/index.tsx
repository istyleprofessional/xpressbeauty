import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import { Form, routeAction$, routeLoader$ } from "@builder.io/qwik-city";
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

export const useCheckoutData = routeLoader$(async ({ cookie }) => {
  const token = cookie.get("token")?.value;
  if (!token) {
    return JSON.stringify({
      request: { status: "failed" },
    });
  }
  try {
    const verify: any = jwt.verify(token, process.env.JWTSECRET ?? "");
    if (verify.isDummy) {
      const request = await getDummyCustomer(verify?.user_id ?? "");
      if (request.status === "success") {
        return JSON.stringify({
          status: "success",
          request: request.result,
        });
      }
      return JSON.stringify({
        request: {
          status: "failed",
        },
      });
    }
    const request = await findUserByUserId(verify?.user_id ?? "");
    if (request.status === "success") {
      return JSON.stringify({
        request: request.result,
      });
    } else {
      return JSON.stringify({
        request: {
          status: "failed",
        },
      });
    }
  } catch (error) {
    return JSON.stringify({
      request: {
        status: "failed",
      },
    });
  }
});

export const useAddUser = routeAction$(async (data, requestEvent) => {
  const token = requestEvent.cookie.get("token")?.value;
  if (!token) {
    return { status: "failed" };
  }
  let user: any;
  let isDummy = false;
  try {
    const verify: any = jwt.verify(token, process.env.JWTSECRET ?? "");
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
        process.env.JWTSECRET ?? "",
        { expiresIn: "1d" }
      );
      requestEvent.cookie.set("token", newToken);
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
    const validationObject = {
      country:
        validate(newData?.generalInfo?.address?.country ?? "", "country") &&
        newData?.generalInfo?.address?.country.length > 0,
      addressLine1:
        validate(
          newData?.generalInfo?.address?.addressLine1 ?? "",
          "addressLine1"
        ) && newData?.generalInfo?.address?.addressLine1.length > 0,
      city:
        validate(newData?.generalInfo?.address?.city ?? "", "city") &&
        newData?.generalInfo?.address?.city.length > 0,
      state:
        validate(newData?.generalInfo?.address?.state ?? "", "state") &&
        newData?.generalInfo?.address?.state.length > 0,
      postalCode:
        validate(
          newData?.generalInfo?.address?.postalCode ?? "",
          "postalCode"
        ) && newData?.generalInfo?.address?.postalCode.length > 0,
      firstName:
        validate(newData?.firstName ?? "", "firstName") &&
        newData?.firstName.length > 0,
      lastName:
        validate(newData?.lastName ?? "", "lastName") &&
        newData?.lastName.length > 0,
      email:
        validate(newData?.email ?? "", "email") && newData?.email.length > 0,
      phoneNumber:
        validate(
          (newData?.phoneNumber.toString().startsWith("1")
            ? `+${newData?.phoneNumber}`
            : `+1${newData.phoneNumber}`) ?? "",
          "phoneNumber"
        ) && newData?.phoneNumber.length >= 10,
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
  const userData = JSON.parse(useCheckoutData().value);
  const info: UserModel = userData?.request;
  const action = useAddUser();
  const verifyCardRef = useSignal<Element>();
  const messageToast = useSignal<string>("");

  useVisibleTask$(({ track }) => {
    track(() => action.value);
    if (action.value?.status === "failed" && !action.value?.validation) {
      messageToast.value = "Something went wrong";
    }
    if (action.value?.status === "success") {
      location.href = `/payment`;
    }
    isLoading.value = false;
  });

  const handleSubmit = $(() => {
    location.href = `/register`;
  });

  const handleSkip = $(() => {
    verifyCardRef.value?.classList.add("hidden");
    location.href = `/payment`;
  });

  return (
    <div class="flex flex-col gap-10 p-4">
      <div
        class="w-full h-full fixed top-0 left-0 backdrop-blur-md z-50 hidden"
        ref={verifyCardRef}
      >
        <div class="card shadow-2xl p-5 w-fit h-fit fixed top-1/2 left-1/2 bg-white -translate-y-1/2 -translate-x-1/2 z-50">
          <div class="card-body">
            <div class="flex flex-col gap-3">
              <label class="label">
                Verify your email address and phone number to get 20% off
              </label>
            </div>
            <div class="card-actions justify-center">
              <button class="btn btn-primary" onClick$={handleSubmit}>
                verify
              </button>
              <button class="btn btn-ghost" onClick$={handleSkip}>
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-3 justify-center items-center">
        <Steps pageType="address" />
      </div>
      <div class="flex flex-col justify-center items-center gap-3 bg-[#F4F4F5]">
        <Form action={action} class="w-full justify-center">
          <div class="w-full p-10 flex flex-col justify-center items-center">
            <div class="flex flex-row w-full gap-5">
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
            <div class="flex flex-row w-full gap-5">
              <InputField
                label="Email Address"
                type="text"
                placeholder="Marry"
                value={info?.email ?? ""}
                identifier="email"
                validation={action?.value?.validation?.email}
                isMandatory={true}
              />
              <InputField
                label="Phone Number"
                type="text"
                placeholder="+1 1234567890"
                value={info?.phoneNumber?.replace("+", "") ?? ""}
                identifier="phoneNumber"
                validation={action?.value?.validation?.phoneNumber}
                isMandatory={true}
              />
            </div>
            <InputField
              label="Company Name ( Optional )"
              type="text"
              placeholder="Xpress"
              value={info?.generalInfo?.comapny?.name ?? ""}
              identifier="generalInfo.company.companyName"
              validation={true}
            />
            <InputField
              label="Country/ Region"
              type="text"
              placeholder="Canada"
              value={info?.generalInfo?.address?.country ?? ""}
              identifier="generalInfo.address.country"
              validation={action?.value?.validation?.country}
              isMandatory={true}
            />
            <InputField
              label="Street Address"
              type="text"
              placeholder="1234"
              value={info?.generalInfo?.address?.addressLine1 ?? ""}
              identifier="generalInfo.address.addressLine1"
              validation={action?.value?.validation?.addressLine1}
              isMandatory={true}
            />
            <InputField
              label="Town / City"
              type="text"
              placeholder="Toronto"
              value={info?.generalInfo?.address?.city ?? ""}
              identifier="generalInfo.address.city"
              validation={action?.value?.validation?.city}
              isMandatory={true}
            />
            <InputField
              label="Province"
              type="text"
              placeholder="Ontario"
              value={info?.generalInfo?.address?.state ?? ""}
              identifier="generalInfo.address.state"
              validation={action?.value?.validation?.state}
              isMandatory={true}
            />
            <InputField
              label="Postal Code"
              type="text"
              placeholder="12344"
              value={info?.generalInfo?.address?.postalCode ?? ""}
              identifier="generalInfo.address.postalCode"
              validation={action?.value?.validation?.postalCode}
              isMandatory={true}
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
            <button
              class="btn btn-primary text-base m-2"
              type="submit"
              onClick$={() => (isLoading.value = true)}
            >
              {isLoading.value && <span class="loading loading-spinner"></span>}
              Proceed Payment
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});
