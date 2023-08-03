import { component$, useSignal, $, useStore } from "@builder.io/qwik";
import { InputField } from "~/components/shared/input-field/input-field";
import { postRequest } from "~/utils/fetch.utils";
import { validate } from "~/utils/validate.utils";
import { useNavigate } from "@builder.io/qwik-city";
import { Toast } from "~/components/admin/toast/toast";

export default component$(() => {
  const nav = useNavigate();
  const password = useSignal<string>("");
  const email = useSignal<string>("");
  const phone = useSignal<string>("");
  const firstName = useSignal<string>("");
  const lastName = useSignal<string>("");
  const confirmPassword = useSignal<string>("");
  const isLoading = useSignal<boolean>(false);
  const message = useSignal<string>("");
  const validation = useStore<any>(
    {
      email: true,
      password: true,
      confirmPassword: true,
      lastName: true,
      firstName: true,
      phone: true,
    },
    { deep: true }
  );

  const handleSubmitClick = $(async () => {
    isLoading.value = true;
    const isValidEmail = validate(email.value, "Email");
    const isValidPassword = validate(password.value, "Password");
    const isValidPhone = validate(phone.value, "Phone");
    const isValidFirstName = validate(firstName.value, "Name");
    const isValidLastName = validate(lastName.value, "Name");

    if (!isValidFirstName) {
      validation.firstName = false;
      isLoading.value = false;
      return;
    } else {
      validation.firstName = true;
    }
    if (!isValidLastName) {
      validation.lastName = false;
      isLoading.value = false;
      return;
    } else {
      validation.lastName = true;
    }
    if (!isValidPhone) {
      validation.phone = false;
      isLoading.value = false;
      return;
    } else {
      validation.phone = true;
    }
    if (!isValidEmail) {
      validation.email = false;
      isLoading.value = false;
      return;
    } else {
      validation.email = true;
    }
    if (!isValidPassword) {
      validation.password = false;
      isLoading.value = false;
      return;
    } else {
      validation.password = true;
    }
    if (password.value !== confirmPassword.value) {
      validation.confirmPassword = false;
      isLoading.value = false;
      return;
    } else {
      validation.confirmPassword = true;
    }
    const data = {
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
      firstName: firstName.value,
      lastName: lastName.value,
      phone: phone.value,
    };
    const request = await postRequest("/api/user-register", data);
    const response = await request.json();
    // debugger;
    if (response.status === "success") {
      isLoading.value = false;
      nav("/");
    } else {
      isLoading.value = false;
      if (response.err.code === 11000) {
        message.value = "Email already exists";
        return;
      }
      message.value = response.err.message;
    }
  });

  const handleInput = $((e: any, identifier: string) => {
    if (identifier === "email") {
      email.value = e.target.value;
    }
    if (identifier === "password") {
      password.value = e.target.value;
    }
    if (identifier === "confirmPassword") {
      confirmPassword.value = e.target.value;
    }
    if (identifier === "firstName") {
      firstName.value = e.target.value;
    }
    if (identifier === "lastName") {
      lastName.value = e.target.value;
    }
    if (identifier === "phone") {
      phone.value = e.target.value;
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
          class="card w-[35rem] h-fit shadow-xl bg-[#F4F4F5] flex flex-col justify-center
       items-center gap-5 p-5"
        >
          {message.value && (
            <div class="w-96">
              <Toast
                status="e"
                handleClose={handleAlertClose}
                message={message.value}
                index={1}
              />
            </div>
          )}
          <div class="flex flex-col gap-6">
            <h1 class="text-black text-lg font-bold">
              Sign up now and receive 20% off on your order
            </h1>
            <p class="text-black font-light text-base">
              If you don't yet have an online account on xpressbeauty.ca ,
              Create one now to shop online, access special promotions, register
              for education and events, leave product reviews as well as view
              and track all orders.
            </p>
          </div>
          <div class="flex flex-row gap-5">
            <InputField
              label="First Name"
              placeholder="John"
              validation={validation.firstName}
              type="text"
              value={firstName.value}
              identifier="firstName"
              handleInput={handleInput}
            />
            <InputField
              label="Last Name"
              placeholder="Doe"
              validation={validation.lastName}
              type="text"
              value={lastName.value}
              identifier="lastName"
              handleInput={handleInput}
            />
          </div>
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
            label="Phone Number"
            placeholder="1234567890"
            validation={validation.phone}
            type="text"
            value={phone.value}
            identifier="phone"
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
          <InputField
            label="Confirm Password"
            placeholder="**********"
            validation={validation.confirmPassword}
            type="password"
            value={confirmPassword.value}
            identifier="confirmPassword"
            handleInput={handleInput}
          />
          <button
            class={`btn w-full bg-black text-white text-lg ${
              isLoading.value ? "opacity-50 disabled loading" : ""
            }`}
            onClick$={handleSubmitClick}
          >
            Sign up
          </button>
        </div>
      </div>
    </>
  );
});
