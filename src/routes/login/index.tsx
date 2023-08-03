import { component$, useSignal, $, useStore } from "@builder.io/qwik";
import { Toast } from "~/components/admin/toast/toast";
import { InputField } from "~/components/shared/input-field/input-field";
import { postRequest } from "~/utils/fetch.utils";
import { validate } from "~/utils/validate.utils";

export default component$(() => {
  const password = useSignal<string>("");
  const email = useSignal<string>("");
  const isLoading = useSignal<boolean>(false);
  const message = useSignal<string>("");
  const validation = useStore<any>(
    {
      email: true,
      password: true,
    },
    { deep: true }
  );

  const handleSubmitClick = $(async () => {
    isLoading.value = true;
    const isValidEmail = validate(email.value, "Email");
    const isValidPassword = validate(password.value, "Password");
    if (!isValidEmail || !isValidPassword) {
      if (!isValidEmail) {
        validation.email = false;
      } else {
        validation.email = true;
      }
      if (!isValidPassword) {
        validation.password = false;
      } else {
        validation.password = true;
      }
      return;
    }
    const data = {
      email: email.value,
      password: password.value,
    };
    const request = await postRequest("/api/login", data);
    const response = await request.json();
    if (response.status === "success") {
      isLoading.value = false;
      location.href = "/";
    } else {
      isLoading.value = false;
      message.value = "Invalid Credentials";
    }
  });

  const handleInput = $((e: any, identifier: string) => {
    if (identifier === "email") {
      email.value = e.target.value;
    } else if (identifier === "password") {
      password.value = e.target.value;
    }
  });

  const handleAlertClose = $(() => {
    message.value = "";
  });

  return (
    <>
      <div
        class="flex bg-[url('/Registration.webp')] h-screen w-full bg-no-repeat lg:bg-left bg-center overscroll-y-none 
    justify-end items-center pr-14 overflow-hidden no-scrollbar"
      >
        <div
          class="card w-[35rem] h-[25rem] shadow-xl bg-[#F4F4F5] flex flex-col justify-center
       items-center gap-5 p-5"
        >
          <InputField
            label="Email"
            placeholder="example@gmail.com"
            validation={validation.email}
            type="text"
            value={email.value}
            identifier="email"
            handleInput={handleInput}
          />
          <InputField
            label="Password"
            placeholder="**********"
            validation={validation.password}
            type="password"
            value={password.value}
            identifier="password"
            handleInput={handleInput}
          />
          <button
            class={`btn w-full bg-black text-white text-lg ${
              isLoading.value ? "opacity-50 cursor-not-allowed loading" : ""
            }`}
            onClick$={handleSubmitClick}
          >
            Sign In
          </button>
          <button class="btn btn-ghost text-black">Forget Password ?</button>
        </div>
      </div>
      {message.value && (
        <div class="w-96 absolute bottom-0 left-0">
          <Toast
            status="e"
            handleClose={handleAlertClose}
            message={message.value}
            index={1}
          />
        </div>
      )}
    </>
  );
});
