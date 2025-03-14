import { component$, $, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Form, routeAction$ } from "@builder.io/qwik-city";
import { Toast } from "~/components/admin/toast/toast";
import { InputField } from "~/components/shared/input-field/input-field";
import jwt from "jsonwebtoken";
import { validate } from "~/utils/validate.utils";
import { sendContactUsEmailToClient } from "~/utils/sendContactUsEmailToClient";
import { sendContactUsEmailToAdmin } from "~/utils/sendContactUsEmailToAdmin";

export const useFormActions = routeAction$(async (data, requestEvent) => {
  const newData: any = { ...data };
  const secret_key = requestEvent.env.get("VITE_RECAPTCHA_SECRET_KEY") ?? "";
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
  const token = requestEvent.cookie.get("token")?.value;
  if (!token) {
    return {
      status: "failed",
      err: "Something went wrong",
    };
  }
  const validObject = {
    name: validate(newData?.name.replace(" ", ""), "name"),
    email: validate(newData?.email, "email"),
    clientMessage: newData?.clientMessage.length > 0,
  };
  const valid = Object.values(validObject).every((value) => value === true);
  if (!valid) {
    return {
      status: "failed",
      validation: validObject,
    };
  }
  const emailData = {
    email: newData.email,
    name: newData.name,
    clientMessage: newData.clientMessage,
  };
  try {
    const decoded: any = jwt.verify(
      token,
      requestEvent.env.get("VITE_JWTSECRET") ?? ""
    );
    if (!decoded) {
      return {
        status: "failed",
        err: "Something went wrong",
      };
    }
    const sendMailToClient = await sendContactUsEmailToClient(emailData);
    if (sendMailToClient.status === "failed") {
      return {
        status: "failed",
        err: "Something went wrong",
      };
    }
    const sendMailToAdmin = await sendContactUsEmailToAdmin(emailData);
    if (sendMailToAdmin.status === "failed") {
      return {
        status: "failed",
        err: "Something went wrong",
      };
    }
    return {
      status: "success",
    };
  } catch (err: any) {
    if (err.message === "jwt expired") {
      const decoded: any = jwt.decode(token);
      if (!decoded) {
        return {
          status: "failed",
          err: "Something went wrong",
        };
      }
      const newToken = jwt.sign(
        { user_id: decoded.user_id, isDummy: decoded.isDummy },
        requestEvent.env.get("VITE_JWTSECRET") ?? "",
        { expiresIn: "1h" }
      );
      requestEvent.cookie.set("token", newToken, {
        httpOnly: true,
        path: "/",
      });
      const sendMailToClient = await sendContactUsEmailToClient(emailData);
      if (sendMailToClient.status === "failed") {
        return {
          status: "failed",
          err: "Something went wrong",
        };
      }
      const sendMailToAdmin = await sendContactUsEmailToAdmin(emailData);
      if (sendMailToAdmin.status === "failed") {
        return {
          status: "failed",
          err: "Something went wrong",
        };
      }
      return {
        status: "success",
      };
    } else {
      return {
        status: "failed",
        err: "Something went wrong",
      };
    }
  }
});

export default component$(() => {
  const action = useFormActions();
  const isLoading = useSignal<boolean>(false);
  const isRecaptcha = useSignal<boolean>(false);
  const recaptchaToken = useSignal<string>("");
  const errorMessage = useSignal<string>("");
  const successMessage = useSignal<string>("");

  useVisibleTask$(
    () => {
      if (isRecaptcha.value === false) {
        isRecaptcha.value = true;
        setTimeout(() => {
          (window as any).grecaptcha.ready(async () => {
            const token = await (window as any).grecaptcha.execute(
              import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "",
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
    ({ track, cleanup }) => {
      track(() => errorMessage.value);
      track(() => successMessage.value);
      const timer = setTimeout(() => {
        errorMessage.value = "";
        successMessage.value = "";
      }, 5000);
      cleanup(() => clearTimeout(timer));
    },
    { strategy: "document-idle" }
  );

  const handleFormSubmit = $(() => {
    if (action.value?.status === "failed") {
      errorMessage.value = action.value?.err
        ? action.value?.err
        : "Something went wrong";
      isLoading.value = false;
    }
    if (action.value?.status === "success") {
      successMessage.value = "Message sent successfully";
      isLoading.value = false;
    }
    (window as any).grecaptcha.ready(async () => {
      const token = await (window as any).grecaptcha.execute(
        import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "",
        { action: "submit" }
      );
      recaptchaToken.value = token;
    });
  });

  const handleAlertClose = $(() => {});
  return (
    <div class="flex justify-center items-center p-5 w-full">
      <div class="flex flex-col lg:flex-row lg:gap-40 justify-center items-center">
        <div class="flex flex-col gap-5 justify-center items-center">
          <img
            class="w-56 h-56"
            src="/Mask group.jpg"
            width="224"
            height="220"
          />
          <div class="flex flex-col gap-4 pl-3">
            <div class="text-zinc-900 text-xl lg:text-5xl font-bold leading-[48px]">
              Get in touch today
            </div>
            <div class="w-96 text-zinc-600 text-md font-normal leading-7">
              Our team is here to help you. Get in touch today and let's start a
              conversation.
            </div>
            <div class="text-zinc-600 text-lg font-normal leading-7">
              {import.meta.env.VITE_EMAIL}
            </div>
          </div>
        </div>
        {isRecaptcha.value === true && (
          <script
            src={`https://www.google.com/recaptcha/api.js?render=${
              import.meta.env.VITE_RECAPTCHA_SITE_KEY
            }`}
          ></script>
        )}
        <Form
          action={action}
          reloadDocument={false}
          onSubmitCompleted$={handleFormSubmit}
          class="card w-full lg:w-[90%] md:w-[35rem] h-fit mb-5 mt-5 shadow-xl bg-[#F4F4F5] flex flex-col justify-center items-center gap-5 p-5"
        >
          {errorMessage.value && (
            <div class="w-full">
              <Toast
                status="e"
                handleClose={handleAlertClose}
                message={errorMessage.value}
                index={1}
              />
            </div>
          )}
          {successMessage.value && (
            <div class="w-full">
              <Toast
                status="s"
                handleClose={handleAlertClose}
                message={successMessage.value}
                index={1}
              />
            </div>
          )}
          <InputField
            label="Name"
            placeholder="John George"
            validation={action.value?.validation?.name ?? true}
            type="text"
            identifier="name"
          />
          <InputField
            label="Email"
            placeholder="example@gmail.com"
            validation={action.value?.validation?.email ?? true}
            type="text"
            identifier="email"
          />
          <textarea
            class=" textarea w-full h-40"
            placeholder="Message"
            name="clientMessage"
          ></textarea>
          <input type="hidden" name="recaptcha" value={recaptchaToken.value} />
          <button
            class={`btn w-full bg-black text-white text-lg`}
            type="submit"
            onClick$={() => (isLoading.value = true)}
          >
            {isLoading.value && <span class="loading loading-spinner"></span>}
            Send Message
          </button>
        </Form>
        {/* display whatsapp button here and say "Need help? Chat with us on WhatsApp" */}
        <div class="flex flex-col gap-5 justify-center items-center">
          <div class="flex flex-col gap-4 pl-3">
            <div class="text-zinc-900 text-xl lg:text-5xl font-bold leading-[48px]">
              Need help?
            </div>
            <div class="w-96 text-zinc-600 text-md font-normal leading-7">
              Chat with us on WhatsApp
            </div>
            <a
              href="https://wa.me/send?phone=12265585027&text=Hello%20Xpress%20Beauty%20I%20need%20help"
              class=" btn bg-black text-white w-40 h-12 flex justify-center items-center cursor-pointer"
            >
              Start a conversation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Xpress Beauty | Contact Us",
  links: [
    {
      rel: "canonical",
      href: "https://xpressbeauty.ca/contact-us/",
    },
  ],
  meta: [
    {
      name: "description",
      content:
        "Reach out customer support at info@xpressbeauty.ca - XpressBeauty",
    },
  ],
};
