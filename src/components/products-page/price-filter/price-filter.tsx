import { component$, useSignal, $ } from "@builder.io/qwik";


export const PriceFilter = component$(() => {
    const isChecked = useSignal(false);

    const handlePricesCheckBoxChange = $((event: any, value: string) => {
        console.log(event.target.checked, value)
    });

    return (
        <>
            <div class="flex flex-row gap-2">
                <input type="checkbox" checked={isChecked.value} class="checkbox checkbox-primary checkbox-sm" onChange$={(e: any) => handlePricesCheckBoxChange(e, '>-$25')} />
                <p class="text-black text-sm font-semibold">{'> $25'}</p>
            </div>
            <div class="flex flex-row gap-2">
                <input type="checkbox" checked={isChecked.value} class="checkbox checkbox-primary checkbox-sm" onChange$={(e: any) => handlePricesCheckBoxChange(e, '$25-$50')} />
                <p class="text-black text-sm font-semibold">{'$25 - $50'}</p>
            </div>
            <div class="flex flex-row gap-2">
                <input type="checkbox" checked={isChecked.value} class="checkbox checkbox-primary checkbox-sm" onChange$={(e: any) => handlePricesCheckBoxChange(e, '$50-$100')} />
                <p class="text-black text-sm font-semibold">{'$50 - $100'}</p>
            </div>
            <div class="flex flex-row gap-2">
                <input type="checkbox" checked={isChecked.value} class="checkbox checkbox-primary checkbox-sm" onChange$={(e: any) => handlePricesCheckBoxChange(e, '$100-$500')} />
                <p class="text-black text-sm font-semibold">{'$100 - $500'}</p>
            </div>
            <div class="flex flex-row gap-2">
                <input type="checkbox" checked={isChecked.value} class="checkbox checkbox-primary checkbox-sm" onChange$={(e: any) => handlePricesCheckBoxChange(e, '<-$500')} />
                <p class="text-black text-sm font-semibold">{'< $500'}</p>
            </div>
        </>
    )
});