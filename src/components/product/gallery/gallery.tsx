import { component$, useSignal } from "@builder.io/qwik";

interface GalleryProps {
  product_name: string;
  imgs: string[];
}

export const Gallery = component$((props: GalleryProps) => {
  const { product_name, imgs } = props;
  const currentImage = useSignal<string>(imgs[0]);

  return (
    <div class="flex flex-col gap-3 justify-center items-center w-full">
      <div class="w-full h-full self-start">
        <img
          itemProp="image"
          src={imgs[0].includes('http') ? imgs[0] : imgs[0].replace(".", "")}
          onError$={(e: any) => {
            e.target.src = "/placeholder.webp";
          }}
          id="product-image"
          alt={product_name}
          class="object-contain w-96 h-96"
        />
      </div>
      <div class="w-full h-full flex flex-row flex-wrap justify-center items-center">
        {imgs.length > 1 && imgs.map((img: string, i: number) => (
          <img
            key={i}
            itemProp="image"
            src={img.includes('http') ? img : img.replace(".", "")}
            onError$={(e: any) => {
              e.target.src = "/placeholder.webp";
            }}
            alt={product_name}
            onClick$={() => {
              const imgs = document.getElementById("product-image");
              if (imgs) {
                imgs.setAttribute("src", img.includes('http') ? img : img.replace(".", ""));
              }
              currentImage.value = img;
            }}
            class={`object-contain w-16 h-16 lg:w-24 lg:h-24 m-1 cursor-pointer hover:opacity-50 transition duration-300 ease-in-out ${currentImage.value === img ? 'opacity-100' : 'opacity-50'}`}
          />

        ))}
      </div>
    </div>
  );
});
