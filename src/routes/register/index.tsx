import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import { InputField } from "~/components/shared/input-field/input-field";
import { Toast } from "~/components/admin/toast/toast";
import { Form, routeAction$, server$ } from "@builder.io/qwik-city";
import { generateUniqueInteger } from "~/utils/generateOTP";
import { userRegistration } from "~/express/services/user.service";
import { connect } from "~/express/db.connection";
import jwt from "jsonwebtoken";
import { sendVerficationMail } from "~/utils/sendVerficationMail";
import { validate } from "~/utils/validate.utils";
import Twilio from "twilio";

export const useRegisterForm = routeAction$(async (data, requestEvent) => {
  await connect();
  const newData: any = { ...data };
  const secret_key = process.env.RECAPTCHA_SECRET_KEY ?? "";
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${newData.recaptcha}`;
  const recaptcha = await fetch(url, { method: "post" });
  const recaptchaText = await recaptcha.text();
  const google_response = JSON.parse(recaptchaText);
  if (!google_response.success) {
    return {
      status: "failed",
      err: "Bot detected",
    };
  }
  newData.phoneNumber = newData?.phoneNumber?.toString()?.startsWith("1")
    ? `+${newData?.phoneNumber}`
    : `+1${newData?.phoneNumber}`;
  const validationObject = {
    email: validate(newData?.email, "email"),
    password:
      validate(newData?.password, "password") && newData?.password?.length >= 8,
    confirmPassword: newData?.confirmPassword === newData?.password,
    lastName: validate(newData?.lastName, "lastName"),
    firstName: validate(newData?.firstName, "firstName"),
    phoneNumber:
      validate(newData?.phoneNumber, "phoneNumber") &&
      newData?.phoneNumber?.length === 12 &&
      newData.isPhoneValid === "true",
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
  newData.EmailVerifyToken = generateUniqueInteger();
  const saveNewUser = await userRegistration(newData);
  if (saveNewUser.status === "failed") {
    return {
      status: "failed",
      err: saveNewUser.err,
    };
  }
  const token = jwt.sign(
    { user_id: saveNewUser?.result?._id, isDummy: false },
    process?.env?.JWTSECRET ?? "",
    { expiresIn: "2h" }
  );
  requestEvent.cookie.set("token", token, {
    httpOnly: true,
    path: "/",
    secure: true,
  });
  sendVerficationMail(
    newData?.email ?? "",
    `${data?.firstName ?? ""} ${data?.lastName ?? ""}`,
    token ?? "",
    newData?.EmailVerifyToken ?? ""
  );
  throw requestEvent.redirect(301, `/emailVerify/?token=${token}`);
});

export const validatePhone = server$(async (data) => {
  const client = new (Twilio as any).Twilio(
    process?.env?.TWILIO_ACCOUNT_SID ?? "",
    process?.env?.TWILIO_AUTH_TOKEN ?? ""
  );
  const req = await client.lookups.v2.phoneNumbers(`${data}`).fetch();

  return { status: "success", res: JSON.stringify(req) };
});

export default component$(() => {
  const action = useRegisterForm();
  const isLoading = useSignal<boolean>(false);
  const isRecaptcha = useSignal<boolean>(false);
  const recaptchaToken = useSignal<string>("");
  const message = useSignal<string>("");
  const passwordValidation = useSignal<boolean>(true);

  const handleAlertClose = $(() => {
    document.querySelector(".alert")?.classList.add("hidden");
  });
  const isPhoneValid = useSignal<boolean>(false);

  useVisibleTask$(
    () => {
      if (isRecaptcha.value === false) {
        isRecaptcha.value = true;
        setTimeout(() => {
          (window as any).grecaptcha?.ready(async () => {
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

  useVisibleTask$(
    ({ track }) => {
      track(() => action.value?.status);
      if (action.value?.status === "success") {
        isLoading.value = false;
        location.href = "/emailVerify/?token=" + action.value?.token;
      }
    },
    { strategy: "document-idle" }
  );

  const handleChange = $(async (e: any) => {
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
    ({ track }) => {
      track(() => action.isRunning);
      (window as any).grecaptcha?.ready(async () => {
        const token = await (window as any).grecaptcha.execute(
          process.env.RECAPTCHA_SITE_KEY ?? "",
          { action: "submit" }
        );
        recaptchaToken.value = token;
      });
    },
    { strategy: "document-idle" }
  );

  return (
    <>
      <div class="p-2 flex flex-col md:flex-row md:bg-[url('/Registration.webp')] md:bg-contain h-full w-full bg-no-repeat lg:bg-left bg-center justify-end items-center md:pr-14">
        <div class="w-full h-96 bg-no-repeat md:hidden bg-[url('/Registration.webp')] bg-contain bg-center">
          {" "}
        </div>
        {isRecaptcha.value === true && (
          <script
            src={`https://www.google.com/recaptcha/api.js?render=${process.env.RECAPTCHA_SITE_KEY}`}
          ></script>
        )}
        <Form action={action} reloadDocument={false}>
          <div class="card w-full md:w-[35rem] h-fit mb-5 mt-5 shadow-xl bg-[#F4F4F5] flex flex-col justify-center items-center gap-5 p-5">
            {action?.value?.status === "failed" && (
              <div class="w-full">
                <Toast
                  status="e"
                  handleClose={handleAlertClose}
                  message={action?.value?.err ?? ""}
                  index={1}
                />
              </div>
            )}
            <div class="flex flex-col gap-6 justify-center items-center p-5">
              <h1 class="text-black text-lg font-bold">
                Sign up now and receive 20% off on your order
              </h1>
              <p class="text-black font-light text-base">
                If you don't yet have an online account on xpressbeauty.ca ,
                Create one now to shop online, access special promotions,
                register for education and events, leave product reviews as well
                as view and track all orders.
              </p>
            </div>
            <div class="flex flex-row gap-5">
              <InputField
                label="First Name"
                placeholder="John"
                validation={action?.value?.validation?.firstName}
                type="text"
                identifier="firstName"
              />
              <InputField
                label="Last Name"
                placeholder="Doe"
                validation={action?.value?.validation?.lastName}
                type="text"
                identifier="lastName"
              />
            </div>
            <div class="flex flex-col gap-1 w-full justify-start">
              <InputField
                label="Email"
                placeholder="example@gmail.com"
                validation={action?.value?.validation?.email}
                type="text"
                identifier="email"
              />
              <p class="text-black text-sm font-light">
                We will send you a confirmation email to verify your email
                address.
              </p>
            </div>

            <div class="flex flex-col gap-1 justify-start">
              {message.value !== "" && (
                <p class="text-error text-sm font-light">{message.value}</p>
              )}
              <InputField
                label="Phone Number"
                placeholder="1234567891"
                validation={action?.value?.validation?.phoneNumber}
                type="text"
                identifier="phoneNumber"
                handleOnChange={handleChange}
              />
              <input
                type="hidden"
                name="isPhoneValid"
                id="isPhoneValid"
                value={isPhoneValid.value.toString()}
              />
              <p class="text-black text-sm font-light">
                We will send you a confirmation text to verify your phone
                number. Please make sure you enter a USA or Canada phone number
                without the country code.
              </p>
            </div>
            <div class="flex flex-col">
              <p class="text-black text-sm font-light">
                Password must be at least 8 characters long and contain at least
                one uppercase letter, one lowercase letter, one number and one
                special character.
              </p>
              <InputField
                label="Password"
                placeholder="**********"
                validation={
                  passwordValidation.value ??
                  action?.value?.validation?.password
                }
                type="password"
                identifier="password"
                handleOnChange={$((e: any) => {
                  const value = e.target.value;
                  if (value.length < 8) {
                    passwordValidation.value = true;
                    return;
                  }
                  const validation = validate(value, "password");
                  passwordValidation.value = validation ?? true;
                })}
              />
            </div>
            <InputField
              label="Confirm Password"
              placeholder="**********"
              validation={action?.value?.validation?.confirmPassword}
              type="password"
              identifier="confirmPassword"
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
              disabled={!isRecaptcha.value}
            >
              {isLoading.value && <span class="loading loading-spinner"></span>}
              Sign up
            </button>
          </div>
        </Form>
      </div>
    </>
  );
});
