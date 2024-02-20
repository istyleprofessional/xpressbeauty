import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="flex flex-col gap-10 justify-center items-center p-5 w-full">
      <div class="w-full h-2/3 flex justify-center">
        <img
          alt="about-us"
          src="/about-us.png"
          class="object-contain"
          width="813"
          height="556"
        />
      </div>
      <div class="flex flex-col gap-5 p-5 justify-start items-start md:w-1/2">
        <h1 class="text-4xl font-bold">
          Fast Shipping Information - XpressBeauty
        </h1>
        <div class="text-dark-900 text-left relative w-fit  h-fit">
          <span>
            <span>
              At XpressBeauty, we understand the excitement of receiving your
              hair care essentials promptly. That's why we're committed to
              providing fast and reliable shipping for our valued American
              customers.
            </span>
            <br></br>
            <br></br>
            <p>
              <span>
                <b> Standard Shipping (3-5 Business Days): </b>
              </span>{" "}
              Our standard shipping option ensures your order reaches you within
              3-5 business days from the date of dispatch.
            </p>

            <br></br>

            <p>
              <span>
                <b> Order Tracking: </b>
              </span>
              Once your order is on its way, you will receive a confirmation
              email with a tracking number. Use this number to monitor your
              package's journey and anticipate its arrival.
            </p>
            <br></br>

            <p>
              <span>
                <b> Processing Time Estimates: </b>
              </span>
              Processing time may be up to 14 days.
            </p>
            <br></br>

            <p>
              <span>
                <b> Delivery Time Estimates: </b>
              </span>
              While shipping times may vary, we do our best to provide accurate
              delivery estimates. If you have a specific event or date in mind,
              please let us know during the checkout notes process, and we'll
              make every effort to ensure your order arrives on time.
            </p>
            <br></br>

            <p>
              <span>
                <b> Shipping to the U.S. : </b>
              </span>
              We proudly serve our American customers with the same dedication
              to quality and speed. Experience the convenience of receiving your
              favorite hair care products directly to your doorstep.
            </p>
            <br></br>

            <p>
              <span>
                <b> Questions or Concerns? </b>
              </span>{" "}
              If you have any questions about our shipping process or need
              assistance, our customer service team is here to help. Contact us
              at{" "}
              <a
                href="mailto:info@xpressbeauty.ca"
                class="text-xs lg:text-base font-normal"
              >
                <b>info@xpressbeauty.ca</b>
              </a>{" "}
              for prompt and friendly assistance.
            </p>
            <br></br>
            <span>
              Thank you for choosing XpressBeauty. We look forward to delivering
              your hair care essentials swiftly and ensuring a seamless shopping
              experience.
            </span>
          </span>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Xpress Beauty | Shipping Policy",
  links: [
    {
      rel: "canonical",
      href: "https://xpressbeauty.ca/shipping-policy/",
    },
  ],
  meta: [
    {
      name: "description",
      content: "Shipping Policy - XpressBeauty",
    },
  ],
};
