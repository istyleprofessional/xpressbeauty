import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  useNavigate,
} from "@builder.io/qwik-city";
import { Toast } from "~/components/admin/toast/toast";
import { getRequest, postRequest } from "~/utils/fetch.utils";
import { validate } from "~/utils/validate.utils";
import jwt from "jsonwebtoken";
import {
  getUserEmailById,
  getUserEmailOtp,
} from "~/express/services/user.service";
import { sendPhoneOtp } from "~/utils/sendPhoneOtp";

export const useVerifyToken = routeLoader$(async ({ url, redirect, env }) => {
  const token = url.searchParams.get("token");
  if (!token) {
    throw redirect(301, "/");
  }
  try {
    const decoded: any = jwt.verify(
      token ?? "",
      env.get("VITE_JWTSECRET") ?? ""
    );
    const request = await getUserEmailById(decoded.user_id);
    if (request?.status === "success") {
      return JSON.stringify({ user: request.result, token: token });
    } else {
      throw redirect(301, "/");
    }
  } catch (error) {
    throw redirect(301, "/");
  }
});

export const useFormAction = routeAction$(async (data, { cookie, env }) => {
  const newData = Object.values(data.otp);
  const secret_key = env.get("VITE_RECAPTCHA_SECRET_KEY") ?? "";
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
  const isValid = validate(newData.join(""), "otp");
  if (!isValid) {
    return {
      status: "failed",
      err: "Invalid data",
    };
  }
  const token = cookie.get("token")?.value;
  if (!token) {
    return {
      status: "failed",
      err: "Something went wrong",
    };
  }
  const body = {
    otp: newData.join(""),
  };
  try {
    const verify: any = jwt.verify(
      token ?? "",
      env.get("VITE_JWTSECRET") ?? ""
    );
    if (verify) {
      const request = await getUserEmailOtp(body);
      if (request.status === "success") {
        if (!request.result?.isPhoneVerified) {
          await sendPhoneOtp(
            request.result?.phoneNumber ?? "",
            request.result?.PhoneVerifyToken ?? ""
          );
          return {
            status: "success",
            token: token,
          };
        }
        return {
          status: "success",
        };
      }
      return {
        status: "failed",
        err: "Invalid OTP",
      };
    } else {
      return {
        status: "failed",
        err: "Something went wrong",
      };
    }
  } catch (error: any) {
    if (error.message === "jwt expired") {
      const decode: any = jwt.decode(token);
      const newJwtToken = jwt.sign(
        { user_id: decode.user_id, isDummy: false },
        env.get("VITE_JWTSECRET") ?? "",
        { expiresIn: "2h" }
      );
      cookie.set("token", newJwtToken, {
        httpOnly: true,
        path: "/",
      });
      const request = await getUserEmailOtp(body);
      if (request.status === "success") {
        if (!request.result?.isPhoneVerified) {
          await sendPhoneOtp(
            request.result?.phoneNumber ?? "",
            request.result?.PhoneVerifyToken ?? ""
          );
          return {
            status: "success",
            token: token,
          };
        }
        return {
          status: "success",
        };
      } else {
        return {
          status: "failed",
          err: "Invalid OTP",
        };
      }
    }
    return {
      status: "failed",
      err: "Something went wrong",
    };
  }
});

export default component$(() => {
  const isLoading = useSignal<boolean>(false);
  const errorMessage = useSignal<string>("");
  const successMessage = useSignal<string>("");
  const user: any = useVerifyToken().value;
  const jsonUser = JSON.parse(user ?? "{}");
  const inputs = useSignal<Element>();
  const recaptchaToken = useSignal<string>("");
  const action = useFormAction();
  const nav = useNavigate();

  useVisibleTask$(
    ({ track }) => {
      track(() => action.value?.status);
      isLoading.value = false;
      if (action.value?.status === "success") {
        if (action.value?.token) {
          window.location.href = "/phoneVerify/?token=" + jsonUser.token;
          return;
        }
        window.location.href = "/login";
        return;
      } else {
        (window as any).grecaptcha.ready(async () => {
          const token = await (window as any).grecaptcha.execute(
            import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "",
            { action: "submit" }
          );
          recaptchaToken.value = token;
        });
      }
    },
    { strategy: "document-idle" }
  );

  const handleInput = $((e: any) => {
    const nextInput = e.target.nextElementSibling;
    const previousInput = e.target.previousElementSibling;
    if (e.target.value.length > 0) {
      if (nextInput) {
        nextInput.focus();
      } else {
        e.target.blur();
      }
    }
    if (e.target.value.length === 0) {
      if (previousInput) {
        previousInput.focus();
      }
    }
  });

  const handleSendTokenAgain = $(async () => {
    const request = await getRequest(
      `/api/emailOtp/resend?token=${jsonUser.token}&recaptcha=${recaptchaToken.value}`
    );
    const response = await (request as Response)?.json();
    if (response.status === "success") {
      successMessage.value = "OTP sent successfully";
    }
    if (response.status === "failed") {
      errorMessage.value = response?.message ?? "Something went wrong";
    }
  });

  const handleAlertClose = $(() => {
    document.querySelector(".alert")?.classList.add("hidden");
  });

  useVisibleTask$(({ track, cleanup }) => {
    track(() => successMessage.value);
    track(() => errorMessage.value);
    const timer = setTimeout(() => {
      errorMessage.value = "";
      successMessage.value = "";
    }, 3000);
    cleanup(() => {
      clearTimeout(timer);
    });
  });

  const handleSkip = $(async () => {
    const sendPhoneOtp = await postRequest("/api/phoneOtp/send", {
      token: jsonUser.token,
    });
    const response = await sendPhoneOtp.json();
    if (response.status === "success") {
      nav("/phoneVerify/?token=" + jsonUser.token);
    }
  });

  return (
    <>
      <div class="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-12">
        <div class="relative bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
          {action?.value?.err && (
            <div class="w-full mb-10">
              <Toast
                status="e"
                handleClose={handleAlertClose}
                message={action?.value?.err}
                index={1}
              />
            </div>
          )}
          {successMessage.value && (
            <div class="w-full mb-10">
              <Toast
                status="s"
                handleClose={handleAlertClose}
                message={successMessage.value}
                index={1}
              />
            </div>
          )}
          <div class="mx-auto flex w-full max-w-md flex-col space-y-16">
            <div class="flex flex-col items-center justify-center text-center space-y-2">
              <div class="font-semibold text-3xl">
                <p>Email Verification</p>
              </div>
              <div class="flex flex-row text-sm font-medium text-gray-400">
                <p>
                  We have sent a code to your email {jsonUser?.user.email ?? ""}
                </p>
              </div>
            </div>
            <script
              src={`https://www.google.com/recaptcha/api.js?render=${
                import.meta.env.VITE_RECAPTCHA_SITE_KEY
              }`}
            ></script>
            <Form action={action}>
              <div class="flex flex-col space-y-16">
                <div
                  class="flex flex-row items-center justify-between mx-auto gap-3 w-full max-w-xs"
                  id="inputs"
                  ref={inputs}
                >
                  <input
                    class="w-full h-16 flex flex-col items-center justify-center text-center px-5
                       outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    onInput$={handleInput}
                    name="otp.0"
                  />
                  <input
                    class="w-full h-16 flex flex-col items-center justify-center text-center px-5 
                      outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    onInput$={handleInput}
                    name="otp.1"
                  />
                  <input
                    class="w-full h-16 flex flex-col items-center justify-center text-center px-5
                       outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    onInput$={handleInput}
                    name="otp.2"
                  />
                  <input
                    class="w-full h-16 flex flex-col items-center justify-center text-center px-5 
                      outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    onInput$={handleInput}
                    name="otp.3"
                  />
                  <input
                    class="w-full h-16 flex flex-col items-center justify-center text-center px-5 
                      outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    onInput$={handleInput}
                    name="otp.4"
                  />
                  <input
                    type="hidden"
                    name="recaptcha"
                    id="recaptcha"
                    value={recaptchaToken.value}
                  />
                </div>

                <div class="flex flex-col space-y-5">
                  <div>
                    <button
                      class="btn text-center w-full border
                     rounded-xl outline-none btn-primary border-none text-white shadow-sm"
                      onClick$={() => (isLoading.value = true)}
                      type="submit"
                      disabled={recaptchaToken.value.length === 0}
                    >
                      {isLoading.value && (
                        <span class="loading-spinner loading-spinner-white"></span>
                      )}
                      Verify Account
                    </button>
                  </div>

                  <div class="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                    <button
                      class="flex flex-row items-center text-blue-600 btn btn-ghost"
                      type="button"
                      onClick$={handleSendTokenAgain}
                      disabled={recaptchaToken.value.length === 0}
                    >
                      <p>Didn't recieve code?</p> Resend
                    </button>
                  </div>
                  <button
                    class="flex flex-row items-center text-blue-600 btn btn-ghost"
                    type="button"
                    onClick$={handleSkip}
                  >
                    SKIP
                  </button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
});
