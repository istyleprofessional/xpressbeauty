import { component$ } from "@builder.io/qwik";

export const Footer = component$(() => {
  return (
    <div class="bg-black flex flex-col gap-10 lg:pl-20 lg:pr-20">
      <div class="flex flex-col gap-10 lg:flex-row flex-wrap lg:gap-[20%] items-center">
        <div class="flex flex-col gap-4 p-5">
          <img alt="Logo" src="/logoX2.jpg" width="271" height="25" />
          <p class="text-white font-light text-sm">
            Copyright © 2023 XPress Beauty
            <br /> | All Rights Reserved
          </p>
        </div>
        <div class="hidden lg:flex lg:flex-row lg:flex-wrap lg:gap-40 lg:h-96 lg:items-start pt-5">
          <div class="flex flex-col gap-10">
            <h3 class="text-white font-bold text-lg">Direct Links</h3>
            <div class="flex flex-col gap-4">
              <a href="/" class="text-white font-light text-base">
                Home
              </a>
              <a href="/about-us" class="text-white font-light text-base">
                About Us
              </a>
              <a href="/contact-us" class="text-white font-light text-base">
                Contact Us
              </a>
              <a
                href="/terms-and-conditions"
                class="text-white font-light text-base"
              >
                Terms & Conditions
              </a>
              <a href="/privacy-policy" class="text-white font-light text-base">
                Privacy Policy
              </a>
              <a href="/return-policy" class="text-white font-light text-base">
                Return Policy
              </a>
              <a href="/shipping-policy" class="text-white font-light text-base">
              Shipping Policy
              </a>
            </div>
          </div>
          <div class="flex flex-col gap-10">
            <h3 class="text-white font-bold text-lg">Products</h3>
            <div class="flex flex-col gap-4">
              <a href="/products/" class="text-white font-light text-base">
                Latest
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Featured
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Popular
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Rating
              </a>
            </div>
          </div>
          <div class="flex flex-col gap-10">
            <h3 class="text-white font-bold text-lg">Categories</h3>
            <div class="flex flex-col gap-4">
              <a href="/products/" class="text-white font-light text-base">
                Hair care
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Barbering
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Textured Hair
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Men’s Grooming
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Hair Colour
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Hair Tools
              </a>
            </div>
          </div>
          <div class="flex flex-col gap-10">
            <h3 class="text-white font-bold text-lg">Follow us</h3>
            <div class="flex flex-col gap-4">
              <a
                href="https://www.facebook.com/xpressbeautypro/"
                class="text-white font-light text-base flex flex-row gap-2"
              >
                <img src="/facebook_nlogo.png" alt="facebook" class="w-6 h-full" />
                <span>Facebook</span>
              </a>
              <a
                href="https://web.whatsapp.com/send/?phone=12134014667"
                class="text-white font-light text-base flex flex-row gap-2"
              >
                <img src="/whatsapplogo.png" alt="whatsapp" class="w-6 h-full" />
                <span>What’sApp</span>
              </a>
              <a
                class="text-white font-light text-base flex flex-row gap-2"
                href="https://www.instagram.com/xpressbeauty23"
              >
                <img
                  src="/instagram_nlogo.png"
                  alt="instagram"
                  class="w-6 h-full"
                />
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>
        <div class="flex lg:hidden flex-row gap-20 flex-wrap justify-center items-start">
          <div class="flex flex-col gap-4">
            <h3 class="text-white font-bold text-base lg:text-lg">
              Direct Links
            </h3>
            <div class="flex flex-col gap-4">
              <a href="/" class="text-white font-light text-base">
                Home
              </a>
              <a href="/about-us" class="text-white font-light text-base">
                About Us
              </a>
              <a href="/contact-us" class="text-white font-light text-base">
                Contact Us
              </a>
              <a
                href="terms-and-conditions"
                class="text-white font-light text-base"
              >
                Terms & Conditions
              </a>
              <a href="/privacy-policy" class="text-white font-light text-base">
                Privacy Policy
              </a>
              <a href="/return-policy" class="text-white font-light text-base">
                Return Policy
              </a>
            </div>
          </div>
          <div class="flex flex-col gap-4">
            <h3 class="text-white font-bold text-base lg:text-lg">
              Categories
            </h3>
            <div class="flex flex-col gap-4">
              <a href="/products/" class="text-white font-light text-base">
                Hair care
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Barbering
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Textured Hair
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Men’s Grooming
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Hair Colour
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Hair Tools
              </a>
            </div>
          </div>
          <div class="flex flex-col gap-4">
            <h3 class="text-white font-bold text-base lg:text-lg">Products</h3>
            <div class="flex flex-col gap-4">
              <a href="/products/" class="text-white font-light text-base">
                Latest
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Featured
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Popular
              </a>
              <a href="/products/" class="text-white font-light text-base">
                Rating
              </a>
            </div>
          </div>
          <div class="flex flex-col gap-4">
            <h3 class="text-white font-bold text-lg">Follow us</h3>
            <div class="flex flex-col gap-4">
              <a
                href="https://www.facebook.com/xpressbeautypro/"
                class="text-white font-light text-base flex flex-row gap-2"
              >
                <img src="/Facebook.webp" alt="facebook" class="w-6 h-full" />
                <span>Facebook</span>
              </a>
              <a
                href="https://wa.me/12134014667"
                class="text-white font-light text-base flex flex-row gap-2"
              >
                <img src="/whatsapp.webp" alt="whatsapp" class="w-6 h-full" />
                <span>WhatsApp</span>
              </a>
              <a
                class="text-white font-light text-base flex flex-row gap-2"
                href="https://www.instagram.com/xpressbeauty23"
              >
                <img
                  src="/instagram (2).png"
                  alt="instagram"
                  class="w-6 h-full"
                />
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-grow border-t border-white"></div>
      <div class="flex flex-col gap-6 justify-center items-center pb-6">
        <h3 class="text-white text-lg font-light">Secure Payments</h3>
        <img
          src="/Icons_payments.webp"
          alt="payment icons"
          class="w-96 h-full"
        />
      </div>
    </div>
  );
});
