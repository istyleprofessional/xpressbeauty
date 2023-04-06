import { component$ } from "@builder.io/qwik";

export const Toast = component$((props: any) => {
  const { message } = props;
  return (
    <div class="alert alert-success">
      <div>
        <span>{message}</span>
      </div>
    </div>
  );
});
