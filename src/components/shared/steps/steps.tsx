import { component$ } from "@builder.io/qwik";

export interface StepsProps {
  pageType: string;
}

export const Steps = component$((props: StepsProps) => {
  const { pageType } = props;
  // const nav = useNavigate();

  return (
    <ul class="steps pt-10 w-full lg:w-3/5">
      <li
        data-content=""
        onClick$={() => (location.href = "/cart")}
        class={`step cursor-pointer ${
          pageType === "cart" ||
          pageType === "address" ||
          pageType === "payment" ||
          pageType === "confirmation"
            ? "step-success"
            : ""
        } step text-black text-xs lg:text-base`}
      >
        My Cart
      </li>
      <li
        data-content=""
        onClick$={() => (location.href = "/checkout")}
        class={`step cursor-pointer ${
          pageType === "address" ||
          pageType === "payment" ||
          pageType === "confirmation"
            ? "step-success"
            : ""
        } step text-black text-xs lg:text-base`}
      >
        Address
      </li>
      <li
        data-content=""
        onClick$={() => (location.href = "/payment")}
        class={`step cursor-pointer ${
          pageType === "payment" || pageType === "confirmation"
            ? "step-success"
            : ""
        } step text-black text-xs lg:text-base`}
      >
        Payment
      </li>
      <li
        data-content=""
        class={`step ${
          pageType === "confirmation" ? "step-success" : ""
        } step text-black text-xs lg:text-base`}
      >
        Confirmation
      </li>
    </ul>
  );
});
