import { component$ } from "@builder.io/qwik";

interface InputFieldProps {
  label?: string;
  placeholder: string;
  validation?: boolean;
  value?: string;
  type: string;
  identifier?: string;
  isMandatory?: boolean;
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
      />
    </div>
  );
});
