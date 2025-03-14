import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import { Form, routeAction$ } from "@builder.io/qwik-city";
import { Toast } from "~/components/admin/toast/toast";
import { InputField } from "~/components/shared/input-field/input-field";
import { validate } from "~/utils/validate.utils";
import jwt from "jsonwebtoken";
import { sendForgetPasswordEmail } from "~/utils/forgetPassword";
import { findUserByUserEmail } from "~/express/services/user.service";

export const useAction = routeAction$(async (data, { env }) => {
  const form: any = data;
  const secret_key = env.get("VITE_RECAPTCHA_SECRET_KEY") ?? "";
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${form.recaptcha}`;
  const recaptcha = await fetch(url, { method: "post" });
  const recaptchaText = await recaptcha.text();
  const google_response = JSON.parse(recaptchaText);
  if (!google_response.success) {
    return {
      status: "failed",
      err: "Bot detected",
    };
  }
  const validationObject = {
    email: validate(form.email, "email") && form.email.length > 0,
  };
  const isValid = Object.values(validationObject).every(
    (item) => item === true
  );
  if (!isValid) {
    return {
      status: "failed",
      err: "Invalid data",
      validation: validationObject,
    };
  }

  try {
    const checkUserByEmail = await findUserByUserEmail(form.email);
    if (checkUserByEmail.status === "success") {
      const tokenToSend = jwt.sign(
        { email: form.email },
        env.get("VITE_JWTSECRET") ?? "",
        { expiresIn: "1h" }
      );
      await sendForgetPasswordEmail(form.email, tokenToSend);
    }
    return {
      status: "success",
    };
  } catch (error) {
    return {
      status: "failed",
    };
  }
});

export default component$(() => {
  const isLoading = useSignal<boolean>(false);
  const message = useSignal<string>("");
  const action = useAction();
  const recaptchaToken = useSignal<string>("");
  const confirmationMessage = useSignal<string>("");

  useVisibleTask$(
    ({ track }) => {
      track(() => action.value?.status);
      (window as any).grecaptcha.ready(async () => {
        const token = await (window as any).grecaptcha.execute(
          import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "",
          { action: "submit" }
        );
        recaptchaToken.value = token;
      });
    },
    { strategy: "document-ready" }
  );

  useVisibleTask$(
    ({ track }) => {
      track(() => action.value?.status);
      if (action.value?.status === "success") {
        confirmationMessage.value =
          "We have sent email if exists in our database";
      } else {
        message.value = action.value?.err ?? "";
      }
      isLoading.value = false;
    },
    { strategy: "document-idle" }
  );

  const handleAlertClose = $(() => {
    message.value = "";
  });

  useVisibleTask$(({ track, cleanup }) => {
    track(() => message.value);
    track(() => confirmationMessage.value);
    const timer = setTimeout(() => {
      message.value = "";
      confirmationMessage.value = "";
    }, 3000);
    cleanup(() => clearTimeout(timer));
  });

  return (
    <>
      <div class="flex flex-col md:flex-row md:bg-[url('/Registration.webp')] md:bg-contain h-screen w-full bg-no-repeat lg:bg-left bg-center justify-end items-center md:pr-14">
        <div class="w-full h-96 bg-no-repeat md:hidden bg-[url('/Registration.webp')] bg-contain bg-center">
          {" "}
        </div>
        <script
          src={`https://www.google.com/recaptcha/api.js?render=${
            import.meta.env.VITE_RECAPTCHA_SITE_KEY
          }`}
        ></script>
        <Form action={action} reloadDocument={false}>
          <div class="card w-[90%] md:w-[35rem] h-fit m-6 shadow-xl bg-[#F4F4F5] flex flex-col justify-center items-center gap-5 p-5">
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
            {confirmationMessage.value && (
              <div class="w-full">
                <Toast
                  status="s"
                  handleClose={handleAlertClose}
                  message={confirmationMessage.value}
                  index={1}
                />
              </div>
            )}
            <h1 class="text-2xl font-bold">Forget Password</h1>
            <p class="text-base text-gray-500">
              Enter your email to get a password reset link if we find your
              email
            </p>
            <InputField
              label="Email"
              placeholder="example@gmail.com"
              validation={action?.value?.validation?.email}
              type="email"
              identifier="email"
            />
            <input
              type="hidden"
              name="recaptcha"
              id="recaptcha"
              value={recaptchaToken.value}
            />
            <button
              class={`btn w-full bg-black text-white text-lg`}
              type="submit"
              disabled={recaptchaToken.value.length === 0 || isLoading.value}
              onClick$={() => {
                isLoading.value = true;
              }}
            >
              {isLoading.value && (
                <span class="loading loading-spinner-white"></span>
              )}
              Send Email
            </button>
          </div>
        </Form>
      </div>
    </>
  );
});
