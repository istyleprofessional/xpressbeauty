import { component$ } from "@builder.io/qwik";

interface CardProps {
  title: string;
  icon: string;
  count: string;
}

export const Card = component$((props: CardProps) => {
  const { title, icon, count } = props;
  return (
    <div class="w-96 h-52 justify-start items-start gap-6 inline-flex">
      <div class="grow shrink basis-0 self-stretch px-6 py-4 bg-white rounded-lg shadow flex-col justify-start items-start inline-flex">
        <div class="self-stretch h-[116px] pb-4 flex-col justify-start items-start gap-4 flex">
          <div class="self-stretch justify-center items-center gap-2.5 inline-flex">
            <div class="grow shrink basis-0 text-slate-500 text-sm font-semibold font-['Inter'] leading-tight">
              {title}
            </div>
          </div>
          <div class="h-[60px] justify-start items-center gap-4 inline-flex">
            <div class="p-4 bg-violet-600 rounded-lg justify-center items-center gap-2.5 flex">
              <div class="w-12 h-12 relative bg-[#7C3AED] justify-center items-center flex rounded-md">
                <div dangerouslySetInnerHTML={icon} />
              </div>
            </div>
            <div class="flex-col justify-center items-start gap-1 inline-flex w-full">
              <div class="text-slate-500 text-4xl font-normal font-['Nunito Sans'] leading-10">
                {count}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
