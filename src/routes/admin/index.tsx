import { component$, useStore, $ } from "@builder.io/qwik";
import { Button } from "~/components//button/button";
import { Input } from "~/components/input-field/input.field";
// import { useNavigate } from "@builder.io/qwik-city";
// import { server$ } from "@builder.io/qwik-city";
// import { login_service } from "~/express/services/user.service";
// import { connect } from "~/express/db.connection";

// const login_server = server$(async (object) => {
//   await connect();
//   const result = await login_service(object);
//   return result;
// });

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
  // const nav = useNavigate();

  const login = $(async () => {
    const data = {
      email: fields.email,
      password: fields.password,
    };
    const result = fetch("/api/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    // const login_result = await login_server(data);
    console.log(result);
    // if (login_result.status === "success") {
    //   document.cookie = `token=${login_result.token}`;
    //   nav("/admin/dashboard");
    // }
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
