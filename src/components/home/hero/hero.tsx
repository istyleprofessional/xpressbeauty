import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";

const images = ["../1.jpg", "../4.jpg", "../7.jpg"];

export const Hero = component$(() => {
  const currentIndex = useSignal(0);

  useVisibleTask$(() => {
    const interval = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % images.length;
    }, 5000);
    return () => clearInterval(interval);
  });

  return (
    <div class="relative w-full h-[20vh] md:h-[50vh] lg:h-[80vh] overflow-hidden">
      <div
        class="absolute inset-0 flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex.value * 100}%)` }}
      >
        {images.map((src, index) => (
          <Image
            key={index}
            src={src}
            class="w-full  h-[20vh] md:h-[50vh] lg:h-[80vh] object-contain shrink-0"
          />
        ))}
      </div>
      {/* Navigation Dots */}
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            class={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex.value === index ? "bg-white" : "bg-gray-500"
            }`}
            onClick$={() => (currentIndex.value = index)}
          ></button>
        ))}
      </div>
    </div>
  );
});
