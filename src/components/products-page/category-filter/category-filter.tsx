import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";

export interface CategoryFilterProps {
    category: any;
    filterCategoriessArray: any;
    main: string;
}

export const CategoryFilter = component$((props: CategoryFilterProps) => {
    const { category, filterCategoriessArray, main } = props;
    const isChecked = useSignal(false);

    useVisibleTask$(() => {
        const prevFilter = localStorage.getItem('filterCategories') ?? '[]'
        filterCategoriessArray.value = JSON.parse(prevFilter)
        const filter = localStorage.getItem('filter') ?? 'Tools';
        if (filter === "Tools") {
            isChecked.value = true;
        }
    });

    const handleCategoryCheckBoxChange = $((event: any, name: string, mainName: string) => {
        const value = event.target.checked;
        if (value) {
            filterCategoriessArray.value.push(`${mainName},${name}`)
            localStorage.setItem('filterCategories', JSON.stringify(filterCategoriessArray.value))
            window.location.href = '?page=1'
        } else {
            filterCategoriessArray.value = filterCategoriessArray.value.filter((category: any) => category !== `${mainName},${name}`)
            localStorage.setItem('filterCategories', JSON.stringify(filterCategoriessArray.value))
            window.location.href = '?page=1'
        }
    });

    return (

        <div class="flex flex-row gap-2">
            <input type="checkbox" checked={filterCategoriessArray.value.includes(`${main},${category}`) ? true : false} class="checkbox checkbox-primary checkbox-sm" onChange$={(e) => handleCategoryCheckBoxChange(e, category, main)} />
            <p class="text-black text-sm font-semibold">{category}</p>
        </div>
    )
});