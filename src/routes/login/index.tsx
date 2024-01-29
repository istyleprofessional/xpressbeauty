import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Form, routeAction$ } from "@builder.io/qwik-city";
import { Toast } from "~/components/admin/toast/toast";
import { InputField } from "~/components/shared/input-field/input-field";
import { userLogin } from "~/express/services/user.service";
import { validate } from "~/utils/validate.utils";
import jwt from "jsonwebtoken";
import {
  getCartByUserId,
  updateUserCart,
} from "~/express/services/cart.service";
import { useAuthSignin } from "../plugin@auth";

export const useAction = routeAction$(async (data, requestEvent) => {
  const secret_key = requestEvent.env.get("VITE_RECAPTCHA_SECRET_KEY") ?? "";
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${data.recaptcha}`;
  const recaptcha = await fetch(url, { method: "post" });
  const recaptchaText = await recaptcha.text();
  const google_response = JSON.parse(recaptchaText);
  if (!google_response.success) {
    return {
      status: "failed",
      err: "Bot detected",
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
    const prevToken = requestEvent.cookie.get("token");
    if (prevToken?.value) {
      const decodeToken: any = jwt.verify(
        prevToken.value,
        requestEvent.env.get("VITE_JWTSECRET") ?? ""
      );
      if (decodeToken) {
        const checkForCart: any = await getCartByUserId(
          decodeToken.user_id ?? ""
        );
        if (checkForCart?.status !== "failed") {
          const data = {
            userId: verifyUser?.result?._id ?? "",
            products: checkForCart?.products ?? [],
          };
          await updateUserCart(data);
        }
      }
    }
    const token = jwt.sign(
      { user_id: verifyUser?.result?._id, isDummy: false },
      requestEvent.env.get("VITE_JWTSECRET") ?? "",
      { expiresIn: "2h" }
    );
    requestEvent.cookie.set("token", token, {
      httpOnly: true,
      path: "/",
    });
    return { status: "success" };
    // throw requestEvent.redirect(301, "/");
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
  const recaptchaToken = useSignal<string>("");
  const signIn = useAuthSignin();

  useVisibleTask$(
    ({ track }) => {
      track(() => action.value?.status);
      if (action.value?.status === "success") {
        const prevUrl = localStorage.getItem("prev");
        location.href = prevUrl ?? "/";
      } else {
        message.value = action.value?.err ?? "";
      }
      isLoading.value = false;
    },
    { strategy: "document-idle" }
  );

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
        <script
          src={`https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY
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
              onClick$={() => {
                isLoading.value = true;
              }}
            >
              {isLoading.value && (
                <span class="loading loading-spinner-white"></span>
              )}
              Sign In
            </button>

            <div class="flex flex-col">
              <button
                class="btn btn-ghost text-black"
                type="button"
                disabled={recaptchaToken.value.length === 0 || isLoading.value}
                onClick$={() => {
                  window.location.href = "/forget-password";
                }}
              >
                Forget Password ?
              </button>
              <a
                class={`btn btn-ghost text-black ${recaptchaToken.value.length === 0 ? "pointer-events-none" : ""
                  }`}
                href="/register"
              >
                Don't have an account? Register Now
              </a>
            </div>
            <div class="flex items-center justify-center dark:bg-gray-800">
              <button onClick$={() => signIn.submit({ providerId: 'google', options: { callbackUrl: 'http://localhost:5173/api/auth/callback/google' } })} type="button" class="px-4 py-2 border flex gap-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150">
                <img class="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
                <span>Login with Google</span>
              </button>
            </div>
          </div>

        </Form>

      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Xpress Beauty | Login Page",
  links: [
    {
      rel: "canonical",
      href: "https://xpressbeauty.ca/login",
    },
  ],
  meta: [
    {
      name: "description",
      content: "Sign in to your account - XpressBeauty",
    },
  ],
};
