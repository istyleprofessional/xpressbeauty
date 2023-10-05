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
      err: "Boot detected",
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
      newData?.phoneNumber?.length === 12,
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
  return { status: "success", token: token ?? "" };
});

export const validatePhone = server$(async (data) => {
  const client = new (Twilio as any).Twilio(
    process?.env?.TWILIO_ACCOUNT_SID ?? "",
    process?.env?.TWILIO_AUTH_TOKEN ?? ""
  );
  const req = await client.lookups.v2.phoneNumbers(`+1${data}`).fetch();

  return { status: "success", res: JSON.stringify(req) };
});

export default component$(() => {
  const action = useRegisterForm();
  const isLoading = useSignal<boolean>(false);
  const isRecaptcha = useSignal<boolean>(false);
  const recaptchaToken = useSignal<string>("");
  const message = useSignal<string>("");
  const handleAlertClose = $(() => {
    message.value = "";
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

  useVisibleTask$(({ track }) => {
    track(() => action?.value?.status);
    if (action?.value?.status === "failed") {
      message.value = action?.value?.err
        ? action?.value?.err
        : "Something went wrong";
      isLoading.value = false;
    }
    if (action?.value?.status === "success") {
      isLoading.value = false;
      location.href = `/emailVerify/?token=${action?.value?.token ?? ""}`;
    }
  });

  const handleChange = $(async (e: any) => {
    console.log(e.target.value);
    const phone = e.target.value;
    if (phone.length !== 10) return;
    const req = await validatePhone(e.target.value);
    console.log(req);
  });

  return (
    <>
      <div class="flex flex-col md:flex-row md:bg-[url('/Registration.webp')] md:bg-contain h-full w-full bg-no-repeat lg:bg-left bg-center justify-end items-center md:pr-14">
        <div class="w-full h-96 bg-no-repeat md:hidden bg-[url('/Registration.webp')] bg-contain bg-center">
          {" "}
        </div>
        {isRecaptcha.value === true && (
          <script
            src={`https://www.google.com/recaptcha/api.js?render=${process.env.RECAPTCHA_SITE_KEY}`}
          ></script>
        )}
        <Form action={action} reloadDocument={true}>
          <div class="card w-[90%] md:w-[35rem] h-fit mb-5 mt-5 shadow-xl bg-[#F4F4F5] flex flex-col justify-center items-center gap-5 p-5">
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
            <InputField
              label="Email"
              placeholder="example@gmail.com"
              validation={action?.value?.validation?.email}
              type="text"
              identifier="email"
            />
            <InputField
              label="Phone Number (start with country code)"
              placeholder="6666666666"
              validation={action?.value?.validation?.phoneNumber}
              type="text"
              identifier="phoneNumber"
              handleOnChange={handleChange}
            />
            <InputField
              label="Password"
              placeholder="**********"
              validation={action?.value?.validation?.password}
              type="password"
              identifier="password"
            />
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
              disabled={recaptchaToken.value.length === 0}
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
