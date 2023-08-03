import type { PropFunction } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import { CloseIcon } from "../../shared/icons/icons";

interface ToastProps {
  message: string;
  index: number;
  handleClose: PropFunction<(i: number) => void>;
  status?: string;
}

export const Toast = component$((props: ToastProps) => {
  const { message, index, handleClose, status } = props;
  return (
    <>
      {status === "s" && (
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
      )}
      {status === "e" && (
        <div class="alert alert-error">
          <div class="flex flex-row gap-10 w-full">
            <span>{message}</span>
            <button
              onClick$={() => handleClose(index)}
              aria-label="Close notification"
              class="m-auto"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
});
