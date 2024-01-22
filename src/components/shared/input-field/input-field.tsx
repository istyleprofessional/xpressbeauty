import type { PropFunction } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";

interface InputFieldProps {
  label?: string;
  placeholder: string;
  validation?: boolean;
  value?: string;
  type: string;
  identifier?: string;
  isMandatory?: boolean;
  handleOnChange?: PropFunction<(e: any, source?: string) => void>;
  disabled?: boolean;
  source?: string;
}

export const InputField = component$((props: InputFieldProps) => {
  const {
    label,
    placeholder,
    validation,
    type,
    value,
    identifier,
    isMandatory,
    handleOnChange,
    disabled,
    source,
  } = props;

  return (
    <div class="form-control w-full">
      <label class="label">
        <span class="label-text text-black text-base">
          {label} <span class=" text-error">{isMandatory ? "*" : ""}</span>
        </span>
      </label>

      <input
        type={type}
        value={value}
        name={identifier}
        placeholder={placeholder}
        class={`input input-bordered w-full text-black ${
          validation === false ? "input-error" : ""
        }`}
        style={{ color: "black" }}
        onInput$={(e) => handleOnChange?.(e, source ?? "") ?? null}
        autoComplete={disabled ? "off" : "on"}
        // disabled={disabled}
        readOnly={disabled}
      />
    </div>
  );
});
