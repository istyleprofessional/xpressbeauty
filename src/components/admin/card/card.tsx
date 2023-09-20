import { component$ } from "@builder.io/qwik";

export const Card = component$(() => {
  return (
    <div class="w-[304px] h-[116px] pb-4 flex-col justify-start items-start gap-4 inline-flex">
      <div class="self-stretch justify-center items-center gap-2.5 inline-flex">
        <div class="grow shrink basis-0 text-slate-500 text-sm font-semibold font-['Inter'] leading-tight">
          Shipped Orders
        </div>
        <div class="w-[89px] pl-3 pr-1.5 rounded border border-slate-300 justify-center items-center gap-4 flex">
          <div class="text-slate-500 text-xs font-normal font-['Nunito Sans'] leading-[18px]">
            30 Days
          </div>
          <div class="w-2.5 h-1.5 relative"></div>
        </div>
      </div>
      <div class="h-[60px] justify-start items-center gap-4 inline-flex">
        <div class="p-4 bg-violet-600 rounded-lg justify-center items-center gap-2.5 flex">
          <div class="w-6 h-6 relative"></div>
        </div>
        <div class="flex-col justify-center items-start gap-1 inline-flex">
          <div class="text-slate-500 text-4xl font-normal font-['Nunito Sans'] leading-10">
            6,000
          </div>
        </div>
      </div>
    </div>
  );
});
