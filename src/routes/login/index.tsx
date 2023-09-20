import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import { Form, routeAction$ } from "@builder.io/qwik-city";
import { Toast } from "~/components/admin/toast/toast";
import { InputField } from "~/components/shared/input-field/input-field";
import { userLogin } from "~/express/services/user.service";
import { validate } from "~/utils/validate.utils";
import jwt from "jsonwebtoken";

export const useAction = routeAction$(async (data, requestEvent) => {
  const secret_key = process.env.RECAPTCHA_SECRET_KEY ?? "";
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${data.recaptcha}`;
  const recaptcha = await fetch(url, { method: "post" });
  const recaptchaText = await recaptcha.text();
  const google_response = JSON.parse(recaptchaText);
  if (!google_response.success) {
    return {
      status: "failed",
      err: "Boot detected",
    };
  }
  const newData: any = { ...data };
  const validationObject = {
    email: validate(newData.email, "email") && newData.email.length > 0,
    password:
      validate(newData.password, "password") && newData.password.length > 0,
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
  const verifyUser = await userLogin(data);
  if (verifyUser.err) {
    return {
      status: "failed",
      err: "Invalid Credentials",
    };
  }
  if (verifyUser.status === "success") {
    const token = jwt.sign(
      { user_id: verifyUser?.result?._id, isDummy: false },
      process.env.JWTSECRET ?? "",
      { expiresIn: "2h" }
    );
    requestEvent.cookie.set("token", token, {
      httpOnly: true,
      path: "/",
      secure: true,
    });
    return {
      status: "success",
    };
  } else {
    return {
      status: "failed",
      err: "Invalid Credentials",
    };
  }
});

export default component$(() => {
  const isLoading = useSignal<boolean>(false);
  const message = useSignal<string>("");
  const action = useAction();
  const isRecaptcha = useSignal<boolean>(false);
  const recaptchaToken = useSignal<string>("");

  useVisibleTask$(({ track }) => {
    track(() => action.value?.status);
    if (action.value?.status === "success") {
      window.location.href = "/";
    } else {
      message.value = action.value?.err ?? "";
    }
  });

  useVisibleTask$(
    () => {
      if (isRecaptcha.value === false) {
        isRecaptcha.value = true;
        setTimeout(() => {
          (window as any).grecaptcha.ready(async () => {
            const token = await (window as any).grecaptcha.execute(
              process.env.RECAPTCHA_SITE_KEY ?? "",
              { action: "submit" }
            );
            recaptchaToken.value = token;
          });
        }, 1000);
      }
    },
    { strategy: "document-idle" }
  );

  const handleAlertClose = $(() => {
    message.value = "";
  });

  useVisibleTask$(({ track, cleanup }) => {
    track(() => message.value);
    const timer = setTimeout(() => {
      message.value = "";
    }, 3000);
    cleanup(() => clearTimeout(timer));
  });

  return (
    <>
      <div class="flex flex-col md:flex-row md:bg-[url('/Registration.webp')] md:bg-contain h-screen w-full bg-no-repeat lg:bg-left bg-center justify-end items-center md:pr-14">
        <div class="w-full h-96 bg-no-repeat md:hidden bg-[url('/Registration.webp')] bg-contain bg-center">
          {" "}
        </div>
        {isRecaptcha.value === true && (
          <script
            src={`https://www.google.com/recaptcha/api.js?render=${process.env.RECAPTCHA_SITE_KEY}`}
          ></script>
        )}
        <Form action={action} reloadDocument={true}>
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

            <InputField
              label="Email"
              placeholder="example@gmail.com"
              validation={action?.value?.validation?.email}
              type="text"
              identifier="email"
            />
            <InputField
              label="Password"
              placeholder="**********"
              validation={action?.value?.validation?.password}
              type="password"
              identifier="password"
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
              disabled={recaptchaToken.value.length === 0}
            >
              {isLoading.value && (
                <span class="loading-spinner loading-spinner-white"></span>
              )}
              Sign In
            </button>

            <div class="flex flex-col">
              <button
                class="btn btn-ghost text-black"
                disabled={recaptchaToken.value.length === 0}
              >
                Forget Password ?
              </button>
              <a
                class={`btn btn-ghost text-black ${
                  recaptchaToken.value.length === 0 ? "pointer-events-none" : ""
                }`}
                href="/register"
              >
                Don't have an account? Register Now
              </a>
            </div>
          </div>
        </Form>
      </div>
    </>
  );
});
