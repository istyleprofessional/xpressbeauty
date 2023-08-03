import { component$ } from "@builder.io/qwik";

export interface StepsProps {
  pageType: string;
}

export const Steps = component$((props: StepsProps) => {
  const { pageType } = props;
  // const nav = useNavigate();

  return (
    <ul class="steps pt-10 w-3/5">
      <li
        data-content=""
        // onClick$={() => nav("/cart")}
        class={`step ${
          pageType === "cart" ||
          pageType === "address" ||
          pageType === "payment" ||
          pageType === "confirmation"
            ? "step-success"
            : ""
        } step-accent text-black`}
      >
        My Cart
      </li>
      <li
        data-content=""
        // onClick$={() => nav("/checkout")}
        class={`step ${
          pageType === "address" ||
          pageType === "payment" ||
          pageType === "confirmation"
            ? "step-success"
            : ""
        } step-accent text-black`}
      >
        Address
      </li>
      <li
        data-content=""
        // onClick$={() => nav("/payment")}
        class={`step ${
          pageType === "payment" || pageType === "confirmation"
            ? "step-success"
            : ""
        } step-accent text-black`}
      >
        Payment
      </li>
      <li
        data-content=""
        class={`step ${
          pageType === "confirmation" ? "step-success" : ""
        } step-accent text-black`}
      >
        Confirmation
      </li>
    </ul>
  );
});
