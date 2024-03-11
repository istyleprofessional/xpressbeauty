import { component$ } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { Pagination } from "~/components/shared/pagination/pagination";
import { connect } from "~/express/db.connection";
import brandSchema from "~/express/schemas/brand.schema";

export const useBrands = routeLoader$(async ({ url }) => {
  await connect();
  const page = url.searchParams.get("page") || "1";
  const alphabet = url.searchParams.get("alphabet");
  if (alphabet) {
    const brands = await brandSchema
      .find({ name: { $regex: `^${alphabet}`, $options: "i" } })
      .skip((parseInt(page) - 1) * 20)
      .limit(20)
      .sort({ name: 1 });
    const total = await brandSchema.countDocuments({
      name: { $regex: `^${alphabet}`, $options: "i" },
    });
    return JSON.stringify({ brands: brands, total: total });
  }
  const brands = await brandSchema
    .find({})
    .skip((parseInt(page) - 1) * 20)
    .limit(20)
    .sort({ name: 1 });
  const total = await brandSchema.countDocuments();
  return JSON.stringify({ brands: brands, total: total });
});

export default component$(() => {
  const brands = useBrands().value;
  const loc = useLocation();
  const page = loc.url.searchParams.get("page") || "1";

  return (
    <div class="flex flex-col gap-3 p-3 justify-center items-center">
      <div class="p-2">
        <h1 class="text-3xl font-bold text-center">Brands</h1>
      </div>
      {/** alphaptic characters for easy navigation */}
      <div class="flex flex-wrap gap-3 justify-center">
        {Array.from(Array(26).keys()).map((index) => {
          return (
            <a
              key={index}
              href={`/brands?alphabet=${String.fromCharCode(index + 65)}`}
              class="text-lg font-bold"
            >
              {String.fromCharCode(index + 65)}
            </a>
          );
        })}
      </div>
      {JSON.parse(brands).brands.length === 0 && (
        <div class="flex flex-col items-center justify-center gap-3 p-3 bg-white rounded-lg shadow-lg">
          <h2 class="text-lg font-bold">No Brands Found</h2>
        </div>
      )}
      <div class="flex flex-wrap gap-3 justify-center">
        {JSON.parse(brands).brands.map(async (brand: any, index: number) => {
          return (
            <a
              key={index}
              class="flex flex-col items-center justify-center gap-3 p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-300 ease-in-out cursor-pointer w-44 h-44"
              href={`/products/filterBrands/${brand.name}`}
            >
              <h2 class="text-sm font-bold">{brand.name}</h2>
            </a>
          );
        })}
      </div>
      <Pagination
        page={page}
        perPage={20}
        totalProductsNo={JSON.parse(brands).total}
      />
    </div>
  );
});
