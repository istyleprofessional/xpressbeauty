import {
  component$,
  useStylesScoped$,
  $,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { validate } from "~/utils/validate.utils";
import styles from "./input.field.css?inline";

interface InputProps {
  placeHolder: string;
  type: string;
  isRequiredValidation: boolean;
  value: any;
}

export const Input = component$((props: InputProps) => {
  useStylesScoped$(styles);
  const { placeHolder, type, isRequiredValidation, value } = props;
  const dynamicType = useSignal<string>("");
  const isValid = useSignal<boolean>(true);

  useTask$(() => {
    dynamicType.value = type;
  });

  const handleValidation = $((e: any) => {
    console.log(e.target.value);
    value.value = e.target.value;
    if (isRequiredValidation) {
      const result = validate(e.target.value, placeHolder);
      isValid.value = result ?? false;
    }
  });

  const handleShowPassword = $(() => {
    if (dynamicType.value === "text") {
      dynamicType.value = "password";
    } else {
      dynamicType.value = "text";
    }
  });

  return (
    <div class="flex flex-row justify-center items-center">
      <input
        value={value.value}
        type={dynamicType.value}
        placeholder={placeHolder}
        onInput$={handleValidation}
        class="bg-[#224957] indent-4 font-light text-sm h-11 w-80 rounded-2xl"
        style={{
          color: `${isValid.value ? "white" : "red"}`,
          outlineColor: `${isValid.value ? "" : "red"}`,
          outlineWidth: `${isValid.value ? "0px" : "3px"}`,
        }}
      />
      {placeHolder === "Password" && (
        <button class="absolute left-[57%]" onClick$={handleShowPassword}>
          <i class="fa fa-eye"></i>
        </button>
      )}
    </div>
  );
});
