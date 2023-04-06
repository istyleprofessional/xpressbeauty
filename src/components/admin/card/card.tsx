import { component$ } from "@builder.io/qwik";

export const Card = component$((props: any) => {
  const { color, text, number } = props;
  return (
    <div
      class={`card w-96 h-36 bg-gradient-to-r ${color.from} ${color.to} text-primary-content mt-9`}
    >
      <div class="card-body">
        <h2 class="card-title font-bold font-[Poppins]">{text}</h2>
        <p class="font-semibold font-[Poppins] text-6xl text-right">{number}</p>
      </div>
    </div>
  );
});
