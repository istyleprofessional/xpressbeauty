import { component$ } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  useLocation,
} from "@builder.io/qwik-city";
import { Toast } from "~/components/admin/toast/toast";
import { InputField } from "~/components/shared/input-field/input-field";
import {
  getBrandById,
  updateBrandsById,
} from "~/express/services/brand.service";

export const useGetBrandById = routeLoader$(async ({ params }) => {
  const id = params.id;
  const getBrand = await getBrandById(id);
  return JSON.stringify(getBrand);
});

export const useUpdateAction = routeAction$(async (data: any) => {
  const validateObject = {
    name: data?.name?.length > 0,
  };
  const isValid = Object.values(validateObject).every((item) => item === true);
  if (!isValid) {
    return {
      status: "failed",
      err: "Invalid data",
      validation: validateObject,
    };
  }
  const updateReq = await updateBrandsById(data);
  if (updateReq.status === "failed") {
    return {
      status: "failed",
      err: updateReq.err,
    };
  }
  return {
    status: "success",
  };
});

export default component$(() => {
  const data = JSON.parse(useGetBrandById().value ?? "{}");
  const loc = useLocation();
  const id = loc.params.id;
  const action = useUpdateAction();

  const handleAlertClose = () => {
    document.querySelector(".alert")?.classList.add("hidden");
  };

  return (
    <div>
      <div class="flex flex-col w-full h-full bg-[#F9FAFB]">
        <h1 class="text-2xl font-bold p-2">Edit {data?.result?.name}</h1>
      </div>
      <Form action={action} reloadDocument={false}>
        <button type="submit" class="btn text-white w-56 bg-[#7C3AED]">
          {" "}
          Save{" "}
        </button>
        <InputField
          label="Name"
          placeholder="Name"
          validation={(action?.value?.validation as any)?.name}
          type="text"
          identifier="name"
          value={data?.result?.name}
        />
        <input type="hidden" name="id" value={id} />
      </Form>
      {action.value?.status === "success" && (
        <Toast
          message="Brand Name Updated Successfully"
          index={1}
          handleClose={handleAlertClose}
          status="s"
        />
      )}
    </div>
  );
});
