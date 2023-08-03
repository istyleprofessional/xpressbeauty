import type { PropFunction } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";

interface AlertProps {
  status: string;
  message?: string;
  handleAlertClose: PropFunction<() => void>;
}

export const Alert = component$((props: AlertProps) => {
  const { status, message, handleAlertClose } = props;

  return (
    <>
      {status === "s" && (
        <div class="alert alert-success shadow-lg absolute bottom-0 z-10">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {message ? message : "Item has been updated successfully"}
            </span>
          </div>
        </div>
      )}
      {status === "e" && (
        <div class="alert alert-error shadow-lg absolute bottom-0 z-10">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{message ? message : "Error! Task failed."}</span>
          </div>
          <button class="btn btn-square btn-sm" onClick$={handleAlertClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </>
  );
});
