import { component$, useContext, $, useSignal } from "@builder.io/qwik";
import { UserContext } from "~/context/user.context";
import { Form, routeAction$ } from "@builder.io/qwik-city";
import { InputField } from "~/components/shared/input-field/input-field";
import jwt from "jsonwebtoken";
import { updateExistingUser } from "~/express/services/user.service";
import { validate } from "~/utils/validate.utils";
import { Toast } from "~/components/admin/toast/toast";

export const useUpdateProfile = routeAction$(async (data, requestEvent) => {
  const formData: any = data;
  const token = requestEvent.cookie.get("token")?.value;
  if (!token) {
    throw requestEvent.redirect(301, "/login");
  }
  const validationObject = {
    firstName: validate(formData?.firstName ?? "", "name"),
    lastName: validate(formData?.lastName ?? "", "name"),
    email: validate(formData?.email ?? "", "email"),
    phoneNumber: validate(formData?.phoneNumber ?? "", "phone"),
    country: validate(formData?.generalInfo?.address?.country ?? "", "country"),
    addressLine1: validate(
      formData?.generalInfo?.address?.addressLine1 ?? "",
      "address"
    ),
    city: validate(formData?.generalInfo?.address?.city ?? "", "city"),
    state: validate(formData?.generalInfo?.address?.state ?? "", "state"),
    postalCode: validate(
      formData?.generalInfo?.address?.postalCode ?? "",
      "postalCode"
    ),
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
    if (updateReq.status === "failed") {
      return { status: "failed", message: updateReq.err };
    }
    return { status: "success", message: "User updated successfully" };
  } catch (error: any) {
    if (error.message === "jwt expired") {
      throw requestEvent.redirect(301, "/login");
    }
  }
});

export default component$(() => {
  const { user }: any = useContext(UserContext);
  const action = useUpdateProfile();
  const toast = useSignal<HTMLElement>();

  const handleAlertClose = $(() => {
    toast.value?.remove();
  });

  return (
    <>
      <div class="flex flex-col gap-10 p-4">
        <div class="flex flex-col justify-center items-center gap-3 bg-[#F4F4F5]">
          {action?.value?.status && (
            <div ref={toast} class="w-full">
              <Toast
                status="s"
                handleClose={handleAlertClose}
                message={(action?.value?.message as string) ?? ""}
                index={1}
              />
            </div>
          )}

          <Form action={action}>
            <div class="w-full p-10">
              <div class="flex flex-row w-full gap-5">
                <InputField
                  label="First Name"
                  type="text"
                  placeholder="Marry"
                  value={user?.firstName ?? ""}
                  identifier="firstName"
                  validation={
                    action?.value?.validationObject?.firstName ?? true
                  }
                  isMandatory={true}
                />
                <InputField
                  label="Last Name"
                  type="text"
                  placeholder="George"
                  value={user?.lastName ?? ""}
                  identifier="lastName"
                  validation={action?.value?.validationObject?.lastName ?? true}
                  isMandatory={true}
                />
              </div>
              <div class="flex flex-row w-full gap-5">
                <InputField
                  label="Email"
                  type="text"
                  value={user?.email ?? ""}
                  placeholder="example@gmail.com"
                  identifier="email"
                  validation={action?.value?.validationObject?.email ?? true}
                  isMandatory={true}
                />
                <InputField
                  label="Phone Number"
                  type="text"
                  value={user?.phoneNumber ?? ""}
                  placeholder="2222222222"
                  identifier="phoneNumber"
                  validation={
                    action?.value?.validationObject?.phoneNumber ?? true
                  }
                  isMandatory={true}
                />
              </div>
              <InputField
                label="Company Name ( Optional )"
                type="text"
                value={user?.generalInfo?.company?.name ?? ""}
                placeholder="Xpress"
                identifier="generalInfo.comapny.name"
                validation={true}
              />
              <InputField
                label="Country/ Region"
                type="text"
                placeholder="Canada"
                identifier="generalInfo.address.country"
                value={user?.generalInfo?.address?.country ?? ""}
                validation={action?.value?.validationObject?.country ?? true}
                isMandatory={true}
              />
              <InputField
                label="Street Address"
                type="text"
                placeholder="1234"
                identifier="generalInfo.address.addressLine1"
                value={user?.generalInfo?.address?.addressLine1 ?? ""}
                validation={
                  action?.value?.validationObject?.addressLine1 ?? true
                }
                isMandatory={true}
              />
              <InputField
                label="Town / City"
                type="text"
                placeholder="Toronto"
                identifier="generalInfo.address.city"
                value={user?.generalInfo?.address?.city ?? ""}
                validation={action?.value?.validationObject?.city ?? true}
                isMandatory={true}
              />
              <InputField
                label="Province"
                type="text"
                placeholder="Ontario"
                identifier="generalInfo.address.state"
                value={user?.generalInfo?.address?.state ?? ""}
                validation={action?.value?.validationObject?.state ?? true}
                isMandatory={true}
              />
              <InputField
                label="Postal Code"
                type="text"
                placeholder="12344"
                identifier="generalInfo.address.postalCode"
                value={user?.generalInfo?.address?.postalCode ?? ""}
                validation={action?.value?.validationObject?.postalCode ?? true}
                isMandatory={true}
              />
              <input type="hidden" name="id" value={user?._id ?? ""} />
            </div>

            <button
              class="btn btn-primary w-full text-base m-2"
              type="submit"
              // onClick$={() => (isLoading.value = true)}
            >
              {action.isRunning && (
                <span class="loading loading-spinner"></span>
              )}
              Save
            </button>
          </Form>
        </div>
      </div>
    </>
  );
});
