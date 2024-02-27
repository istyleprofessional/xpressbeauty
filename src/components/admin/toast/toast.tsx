import type { QRL } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import { CloseIcon } from "../../shared/icons/icons";

interface ToastProps {
  message: string;
  index: number;
  handleClose: QRL<(i: number) => void>;
  status?: string;
}

export const Toast = component$((props: ToastProps) => {
  const { message, index, handleClose, status } = props;
  return (
    <>
      {status === "s" && (
        <div class="alert alert-success flex justify-between">
          <span>{message}</span>
          <button
            type="button"
            onClick$={() => handleClose(index)}
            aria-label="Close notification"
          >
            <CloseIcon />
          </button>
        </div>
      )}
      {status === "e" && (
        <div class="alert alert-error flex justify-between">
          <span>{message}</span>
          <button
            onClick$={() => handleClose(index)}
            aria-label="Close notification"
            class="ml-auto"
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
      )}
    </>
  );
});
