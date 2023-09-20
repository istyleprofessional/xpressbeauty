import {
  component$,
  useStylesScoped$,
  $,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import styles from "./input.field.css?inline";

interface InputProps {
  placeHolder: string;
  type: string;
  isRequiredValidation: boolean;
  identifier?: string;
}

export const Input = component$((props: InputProps) => {
  useStylesScoped$(styles);
  const { placeHolder, type, identifier } = props;
  const dynamicType = useSignal<string>("");
  const isValid = useSignal<boolean>(true);

  useTask$(() => {
    dynamicType.value = type;
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
        type={dynamicType.value}
        placeholder={placeHolder}
        class="text-black indent-4 text-sm h-11 w-80 rounded-2xl"
        style={{
          color: `${isValid.value ? "" : "red"}`,
          outlineColor: `${isValid.value ? "" : "red"}`,
          outlineWidth: `${isValid.value ? "0px" : "3px"}`,
        }}
        name={identifier}
      />
      {placeHolder === "Password" && (
        <button
          class="absolute left-[57%]"
          onClick$={handleShowPassword}
          aria-label="Show password"
        >
          <i class="fa fa-eye"></i>
        </button>
      )}
    </div>
  );
});
