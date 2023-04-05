import { component$, useStore, $ } from "@builder.io/qwik";
import { Button } from "~/components//button/button";
import { Input } from "~/components/input-field/input.field";
import { postRequest } from "~/utils/fetch.utils";

export default component$(() => {
  const fields = useStore<any>(
    {
      email: {
        value: "",
      },
      password: {
        value: "",
      },
    },
    { deep: true }
  );

  const login = $(async () => {
    const data = {
      email: fields.email,
      password: fields.password,
    };
    const result = await postRequest("/api/admin/login", data);
    const resultJson = await result.json();
    if (resultJson?.status === "success") {
      document.cookie = `token=${resultJson?.token}`;
      window.location.href = "dashboard";
    }
  });

  return (
    <div class="bg-[#E5E5E5] w-full h-screen flex justify-center items-center">
      <div class="w-80 flex flex-col justify-center items-center">
        <h1 class="text-4xl antialiased font-medium text-[#224957] mb-12">
          Sign in
        </h1>
        <div class="flex flex-col gap-7 mb-12">
          <Input
            placeHolder="Email"
            type="text"
            isRequiredValidation={true}
            value={fields.email}
          />
          <Input
            placeHolder="Password"
            type="password"
            isRequiredValidation={true}
            value={fields.password}
          />
        </div>
        <Button placeHolder="Login" callBack={login} />
      </div>
    </div>
  );
});
