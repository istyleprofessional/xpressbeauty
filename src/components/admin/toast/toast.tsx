import type { PropFunction } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import { CloseIcon } from "../icons/icons";

interface ToastProps {
  message: string;
  index: number;
  handleClose: PropFunction<(i: number) => void>;
}

export const Toast = component$((props: ToastProps) => {
  const { message, index, handleClose } = props;
  return (
    <div class="alert alert-success">
      <div>
        <span>{message}</span>
        <button
          onClick$={() => handleClose(index)}
          aria-label="Close notification"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
});
