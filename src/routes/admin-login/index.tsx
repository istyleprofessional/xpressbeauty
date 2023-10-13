import { component$, $, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Form, routeAction$ } from "@builder.io/qwik-city";
import { Input } from "~/components/admin/input-field/input.field";
import { Toast } from "~/components/admin/toast/toast";
import { login_service } from "~/express/services/admin.service";

export const useAdminLoginAction = routeAction$(async (data, requestEvenet) => {
  const formData: any = { ...data };
  const result = await login_service(formData);
  requestEvenet.cookie.delete("token");
  requestEvenet.cookie.set("token", result.token ?? "", {
    httpOnly: true,
    path: "/",
  });
  if (result.status === "success") {
    throw requestEvenet.redirect(301, "/admin");
  } else {
    console.log(result.err);
    return { status: "error", message: result.err ?? "something went wrong" };
  }
});

export default component$(() => {
  const action = useAdminLoginAction();
  const message = useSignal<string>("");
  const handleAlertClose = $(() => {
    message.value = "";
  });
  const isLoading = useSignal<boolean>(false);

  useVisibleTask$(({ track }) => {
    track(() => action?.value?.message);
    message.value = action.value?.message ?? "";
  });

  return (
    <div class="bg-[#ffffff] w-full h-screen flex justify-center items-center flex-col gap-1">
      <div class="w-52 h-52">
        <img
          src="/new logo 1.jpg"
          alt="logo"
          class="w-full h-full object-contain"
        />
      </div>
      <div class="w-80 flex flex-col justify-center items-center gap-2">
        {message.value && (
          <div class="w-full">
            <Toast
              status="e"
              handleClose={handleAlertClose}
              message={message.value}
              index={1}
            />
          </div>
        )}
        <Form action={action}>
          <div class="card flex justify-center items-center bg-[#F9FAFB]">
            <div class="card-body flex flex-col gap-7 mb-12 items-center">
              <h2 class="text-xl mb-4 text-[#6B7280] text-center font-semibold card-title">
                Welcome back ! 👋
              </h2>
              <div class="flex flex-col gap-2">
                <label class="text-[#6B7280] text-sm mb-2">Email</label>
                <Input
                  placeHolder="Email"
                  type="text"
                  isRequiredValidation={true}
                  identifier="email"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-[#6B7280] text-sm mb-2">Password</label>
                <Input
                  placeHolder="Password"
                  type="password"
                  isRequiredValidation={true}
                  identifier="password"
                />
              </div>

              <button
                type="submit"
                class="btn w-full bg-[#7C3AED] text-white"
                onClick$={() => (isLoading.value = true)}
              >
                {isLoading.value && <span class="loading-spinner"></span>}
                Sign In
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
});
