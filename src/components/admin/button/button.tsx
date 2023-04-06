import type { PropFunction } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";

interface ButtonProps {
  placeHolder: string;
  callBack: PropFunction<() => void>;
}

export const Button = component$((props: ButtonProps) => {
  const { placeHolder, callBack } = props;

  return (
    <button
      onClick$={callBack}
      class="btn w-80 h-11 bg-[#20DF7F] rounded-2xl font-light"
      style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.3)" }}
    >
      {placeHolder}
    </button>
  );
});
