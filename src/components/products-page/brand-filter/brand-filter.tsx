import type { QwikChangeEvent } from "@builder.io/qwik";
import { component$, $, useVisibleTask$ } from "@builder.io/qwik";

export interface BrandFilterProps {
    brandName: string;
    filterBrandsArray: any;
}

export const BrandFilter = component$((props: BrandFilterProps) => {
    const { brandName, filterBrandsArray } = props;

    useVisibleTask$(() => {
        const prevFilter = localStorage.getItem('filterBrands') ?? '[]'
        filterBrandsArray.value = JSON.parse(prevFilter)
    });

    const handleBrandCheckBoxChange = $((e: QwikChangeEvent<HTMLInputElement>, brandName: string) => {
        const value = e.target.checked;
        if (value) {
            filterBrandsArray.value.push(brandName)
            localStorage.setItem('filterBrands', JSON.stringify(filterBrandsArray.value))
            window.location.href = '?page=1'
        } else {
            filterBrandsArray.value = filterBrandsArray.value.filter((brand: any) => brand !== brandName)
            localStorage.setItem('filterBrands', JSON.stringify(filterBrandsArray.value))
            window.location.href = '?page=1'
        }
    });

    return (
        <div class="flex flex-row gap-2">
            <input type="checkbox" checked={filterBrandsArray.value.includes(brandName) ? true : false} class="checkbox checkbox-primary checkbox-sm" onChange$={(e: QwikChangeEvent<HTMLInputElement>) => handleBrandCheckBoxChange(e, brandName)} />
            <p class="text-black text-sm font-semibold">{brandName}</p>
        </div>

    )
});