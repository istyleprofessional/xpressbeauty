import { component$ } from "@builder.io/qwik";
import { Card } from "~/components/admin/card/card";

export default component$(() => {
  return (
    <div class="flex flex-col">
      <div class="mt-9">
        <p class="text-lg">Total Revenue</p>
        <p class="font-semibold text-[#000000] text-lg">$ 0</p>
      </div>
      <div class="flex flex-row gap-5">
        <Card
          color={{ from: "from-[#6BAAFC]", to: "to-[#305FEC]" }}
          text={"Shipped orders"}
          number={"0"}
        />
        <Card
          color={{ from: "from-[#EF5E7A]", to: "to-[#D35385]" }}
          text={"Pending orders"}
          number={"0"}
        />
        <Card
          color={{ from: "from-[#D623FE]", to: "to-[#A530F2]" }}
          text={"New orders"}
          number={"0"}
        />
      </div>
    </div>
  );
});
