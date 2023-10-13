import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import { Form, routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import { Toast } from "~/components/admin/toast/toast";
import { getRequest } from "~/utils/fetch.utils";
import { validate } from "~/utils/validate.utils";
import jwt from "jsonwebtoken";
import {
  getUserEmailById,
  getUserPhoneOtp,
} from "~/express/services/user.service";

export const useVerifyToken = routeLoader$(async ({ url, redirect }) => {
  const token = url.searchParams.get("token");
  if (!token) {
    throw redirect(301, "/");
  }
  try {
    const decoded: any = jwt.verify(token ?? "", process.env.JWTSECRET ?? "");
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

export const useFormAction = routeAction$(async (data, requestEvent) => {
  const newData = Object.values(data.otp);
  const secret_key = process.env.RECAPTCHA_SECRET_KEY ?? "";
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
  const token = requestEvent.cookie.get("token")?.value;
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
    const verify: any = jwt.verify(token ?? "", process.env.JWTSECRET ?? "");
    if (verify) {
      const request = await getUserPhoneOtp(body);
      if (request.status === "success") {
        return {
          status: "success",
        };
      } else {
        return {
          status: "failed",
          err: "Invalid OTP",
        };
      }
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
        process.env.JWTSECRET ?? "",
        { expiresIn: "2h" }
      );
      requestEvent.cookie.set("token", newJwtToken, {
        httpOnly: true,
        path: "/",
      });
      const request = await getUserPhoneOtp(body);
      if (request.status === "success") {
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
  const user = useVerifyToken().value;
  const jsonUser = JSON.parse(user ?? "{}");
  const phone = useSignal<string>("");
  const inputs = useSignal<Element>();
  const action = useFormAction();
  const isRecaptcha = useSignal<boolean>(false);
  const recaptchaToken = useSignal<string>("");

  useVisibleTask$(async () => {
    const trailingCharsIntactCount = 4;
    phone.value =
      new Array(
        jsonUser?.user?.phoneNumber.length - trailingCharsIntactCount + 1
      ).join("x") +
      jsonUser?.user?.phoneNumber.slice(-trailingCharsIntactCount);
  });

  const handleAlertClose = $(() => {
    errorMessage.value = "";
    successMessage.value = "";
  });

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
      `/api/phoneOtp/resend?token=${jsonUser.token}&recaptcha=${recaptchaToken.value}`
    );
    const response = await (request as Response)?.json();
    if (response.status === "success") {
      successMessage.value = "OTP sent successfully";
    }
    if (response.status === "failed") {
      errorMessage.value = response.message ?? "Something went wrong";
    }
  });

  useVisibleTask$(({ track, cleanup }) => {
    track(() => successMessage.value);
    track(() => errorMessage.value);
    const timer = setTimeout(() => {
      errorMessage.value = "";
      successMessage.value = "";
    }, 2000);
    cleanup(() => {
      clearTimeout(timer);
    });
  });

  const handleOtpSubmit = $(() => {
    if (action?.value?.status === "success") {
      isLoading.value = false;
      setTimeout(() => {
        window.location.href = `/login/`;
      }, 1000);
    } else {
      (window as any).grecaptcha.ready(async () => {
        const token = await (window as any).grecaptcha.execute(
          process.env.RECAPTCHA_SITE_KEY ?? "",
          { action: "submit" }
        );
        recaptchaToken.value = token;
      });
      isLoading.value = false;
      errorMessage.value = action?.value?.err ?? "Something went wrong";
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

  const handleSkip = $(() => {
    window.location.href = `/login/`;
  });

  return (
    <>
      <div class="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-12">
        <div class="relative bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
          {errorMessage.value && (
            <div class="w-full mb-10">
              <Toast
                status="e"
                handleClose={handleAlertClose}
                message={errorMessage.value}
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
                <p>Phone Verification</p>
              </div>
              <div class="flex flex-row text-sm font-medium text-gray-400">
                <p>We have sent a code to your phone {phone.value}</p>
              </div>
            </div>
            {isRecaptcha.value === true && (
              <script
                src={`https://www.google.com/recaptcha/api.js?render=${process.env.RECAPTCHA_SITE_KEY}`}
              ></script>
            )}
            <Form action={action} onSubmit$={handleOtpSubmit}>
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
                      class="flex flex-row items-center text-blue-600 btn btn-ghost text-black"
                      onClick$={handleSendTokenAgain}
                      type="button"
                      disabled={recaptchaToken.value.length === 0}
                    >
                      <p>Didn't recieve code?</p> Resend
                    </button>
                  </div>
                  <button
                    class="flex flex-row items-center text-blue-600 btn btn-ghost text-black"
                    onClick$={handleSkip}
                    type="button"
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
