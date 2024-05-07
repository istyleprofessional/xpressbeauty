import { component$, $, useSignal } from "@builder.io/qwik";

interface ExtraImgsProps {
  product_name: string;
}

export const ExtraImgs = component$((props: ExtraImgsProps) => {
  const { product_name } = props;

  const isHidden = useSignal(true);
  const s1Signal = useSignal(`/ps.jpg`);
  const s2Signal = useSignal(`/ps.jpg`);
  const s3Signal = useSignal(`/ps.jpg`);
  const s4Signal = useSignal(`/ps.jpg`);

  const toogleVisability = $(() => {
    isHidden.value = !isHidden.value;
  });

  const handleFileChange = $(async (event: any, slotId: any) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    formData.append(
      "name",
      `${product_name
        ?.replace(/ /g, "-")
        .replace(/[^a-zA-Z0-9\s]/g, "")}-${slotId}/${file.name
        .split(".")[0]
        .replace(/[^a-zA-Z0-9\s]/g, "")}.webp`
    );
    const uploadReq = await fetch("/api/admin/product/upload", {
      method: "POST",
      body: formData,
    });
    const uploadRes = await uploadReq.json();
    if (uploadRes.message !== 200) {
      return;
    }

    const urlVal = `https://xpressbeauty.s3.ca-central-1.amazonaws.com/products-images-2/${product_name
      .replace(/ /g, "-")
      .replace(/[^a-zA-Z0-9\s]/g, "")}-${slotId}/${file.name
      .split(".")[0]
      .replace(/[^a-zA-Z0-9\s]/g, "")}.webp`;

    if (slotId == "s1") s1Signal.value = urlVal;
    if (slotId == "s2") s2Signal.value = urlVal;
    if (slotId == "s3") s3Signal.value = urlVal;
    if (slotId == "s4") s4Signal.value = urlVal;
  });

  return (
    <>
      <div
        class={`flex w-1/3 flex-row items-center justify-center gap-3 rounded-md bg-slate-50 p-4 shadow-md  ${
          isHidden.value ? "hidden" : "visible"
        } `}
      >
        <div>
          <img
            src={s1Signal.value}
            class="h-24 w-24 cursor-pointer rounded-sm"
            width={24}
            height={24}
            alt=""
            onClick$={() => {
              document.getElementById("s1")?.click();
            }}
          />
          <input
            type="file"
            id="s1"
            class="file-input file-input-bordered file-input-sm hidden  w-full max-w-xs"
            onChange$={(e) => {
              handleFileChange(e, "s1");
            }}
          />
          <input type="hidden" name="s1Img" value={s1Signal.value} />
        </div>

        <div>
          <img
            src={s2Signal.value}
            class="h-24 w-24 cursor-pointer rounded-sm"
            width={24}
            height={24}
            alt=""
            onClick$={() => {
              document.getElementById("s2")?.click();
            }}
          />
          <input
            type="file"
            id="s2"
            class="file-input file-input-bordered file-input-sm hidden w-full max-w-xs"
            onChange$={(e) => {
              handleFileChange(e, "s2");
            }}
          />
          <input type="hidden" name="s2Img" value={s2Signal.value} />
        </div>

        <div>
          <img
            src={s3Signal.value}
            class="h-24 w-24 cursor-pointer rounded-sm"
            width={24}
            height={24}
            alt=""
            onClick$={() => {
              document.getElementById("s3")?.click();
            }}
          />
          <input
            type="file"
            id="s3"
            class="file-input file-input-bordered file-input-sm hidden w-full max-w-xs"
            onChange$={(e) => {
              handleFileChange(e, "s3");
            }}
          />
          <input type="hidden" name="s3Img" value={s3Signal.value} />
        </div>

        <div>
          <img
            src={s4Signal.value}
            class="h-24 w-24 cursor-pointer rounded-sm"
            width={24}
            height={24}
            alt=""
            onClick$={() => {
              document.getElementById("s4")?.click();
            }}
          />
          <input
            type="file"
            id="s4"
            class="file-input file-input-bordered file-input-sm hidden w-full max-w-xs"
            onChange$={(e) => {
              handleFileChange(e, "s4");
            }}
          />
          <input type="hidden" name="s4Img" value={s4Signal.value} />
        </div>
      </div>

      <button
        class="btn btn-square btn-primary w-fit p-2"
        type="button"
        onClick$={toogleVisability}
      >
        Add More Images
      </button>
    </>
  );
});
