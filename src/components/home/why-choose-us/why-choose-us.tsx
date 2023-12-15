import { component$ } from "@builder.io/qwik";
import MySavingImage from "~/media/31.png?jsx";

export const WhyChooseUs = component$(() => {
  return (
    <>
      <h2 class="text-base text-center lg:text-4xl font-bold text-black">
        WHY CHOOSE XPRESS BEAUTY FOR YOUR SALON NEEDS?
      </h2>
      <div
        class="flex flex-col justify-center items-center gap-20 pt-5 bg-contain"
        style="background-image: url(/Dash-lines.webp); background-repeat:no-repeat; background-position-y: center; background-position-x: center;"
      >
        <div class="flex justify-center items-center flex-col w-80 lg:w-[35%] gap-3">
          <MySavingImage
            class="lg:w-42 w-24 h-24 lg:h-42 object-contain rounded-full"
            alt="award section"
          />
          <h2 class="font-bold text-base text-center lg:text-3xl text-black">
            Direct-to-You Savings!
          </h2>
          <p class="lg:text-2xl text-sm font-light text-center text-black">
            By cutting out the middleman, we've streamlined our process to bring
            you top-notch products at unbeatable prices. This translates
            directly into lower prices for you without compromising on the
            quality of our products
          </p>
        </div>

        <div class="flex flex-col lg:flex-row gap-16 justify-center items-start">
          <div class="flex justify-center items-center flex-col lg:w-[35%] gap-3 1">
            <img
              src="/support.webp"
              class="lg:w-42 w-24 h-24 lg:h-42 object-contain"
              alt="customer support section"
            />
            <h2 class="font-bold text-base text-center lg:text-3xl text-black">
              CUSTOMER SERVICE
            </h2>
            <p class="lg:text-2xl text-sm font-light text-center text-black">
              Keeping our customers happy is our #1 priority. That’s why we
              offer ongoing support with real agents on standby to assist you.
              Plus, support by phone and email or WhatsApp during normal
              business hours.
            </p>
          </div>
          <div class="flex justify-center items-center flex-col lg:w-[35%] gap-3 2">
            <img
              src="/truck.webp"
              class="lg:w-42 w-24 lg:h-42 h-24 object-contain"
              alt="shipping section"
            />
            <h2 class="font-bold text-base text-center lg:text-3xl text-black">
              FAST USA AND CANADA WIDE SHIPPING
            </h2>
            <p class="text-sm lg:text-2xl font-light text-center text-black">
              To ensure you receive your products as quickly and reliably as
              possible, we ship via UPS and Canpar. Once your order is placed,
              you will receive an email from us with your tracking number.
            </p>
          </div>
          <div class="flex justify-center items-center flex-col lg:w-[35%] gap-3 3">
            <img
              src="/secure.webp"
              class="lg:w-42 w-24 h-24 lg:h-42 object-contain"
              alt="secure payment section"
            />
            <h2 class="font-bold text-base text-center lg:text-3xl text-black">
              SECURE PAYMENTS
            </h2>
            <p class="lg:text-2xl text-sm font-light text-center text-black">
              We take your personal information very seriously. That’s why we
              use a very secure third party payment data encryption, and we
              never store your payment details.
            </p>
          </div>
        </div>
        <div class="flex justify-center items-center flex-col w-80 lg:w-[35%] gap-3">
          <img
            src="/award.webp"
            class="lg:w-42 w-24 h-24 lg:h-42 object-contain"
            alt="award section"
          />
          <h2 class="font-bold text-base text-center lg:text-3xl text-black">
            100% SATISFACTION GUARANTEE
          </h2>
          <p class="lg:text-2xl text-sm font-light text-center text-black">
            We stand behind the quality of our products and your satisfaction is
            our top priority. Return your product within 30 days of receiving it
            for any reason. Some restrictions apply.
          </p>
        </div>
      </div>
    </>
  );
});
