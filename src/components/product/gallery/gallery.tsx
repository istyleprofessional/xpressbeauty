import { component$ } from "@builder.io/qwik";

interface GalleryProps {
  product_name: string;
  imgs: string[];
}

export const Gallery = component$((props: GalleryProps) => {
  const { product_name, imgs } = props;

  return (
    <div class="w-96 h-96 self-start">
      <img
        itemProp="image"
        src={imgs[0] ?? ""}
        onError$={(e: any) => {
          e.target.src = "/placeholder.webp";
        }}
        alt={product_name}
        class="object-contain w-96 h-96"
      />
    </div>
  );
});
