import { component$ } from "@builder.io/qwik";

interface AlertProps {
  status: string;
}

export const Alert = component$((props: AlertProps) => {
  const { status } = props;

  return (
    <>
      {status === "s" && (
        <div class="alert alert-success shadow-lg absolute top-0 z-10">
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
            <span>Item has been updated successfully</span>
          </div>
        </div>
      )}
      {status === "e" && (
        <div class="alert alert-error shadow-lg absolute top-0 z-10">
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
            <span>Error! Task failed.</span>
          </div>
        </div>
      )}
    </>
  );
});
