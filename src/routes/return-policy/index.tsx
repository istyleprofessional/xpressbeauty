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
          Return Policy for XpressBeauty - Serving Canadian and American
          Customers
        </h1>
        <div class="text-dark-900 text-left relative w-fit  h-fit">
          <span>
            <span>
              At XpressBeauty we strive to provide you with the best beauty
              products and exceptional customer service. We understand that
              sometimes a product may not meet your expectations or may arrive
              in less than perfect condition. In such cases, we have implemented
              the following return policy to ensure a smooth and satisfactory
              experience for our valued American customers.
            </span>
            <br></br>
            <br></br>
            <p>
              <span>
                <b> 1. Return Eligibility: </b>
              </span>
              <span>
                Returns are accepted within 30 days from the date of purchase.
              </span>
              <br />
              <br />
              <span>
                The product must be unused, in its original packaging, and in
                the same condition as received.
              </span>
              <br />
              <br />
              <span>All original tags and labels must be intact.</span>
              <br />
              <br />
            </p>

            <br></br>

            <p>
              <span>
                <b> 2. Return Process: </b>
              </span>
              <span>
                To initiate a return, please contact our customer service team
                at [info@xpressbeauty.ca] with your order number, the item(s)
                you wish to return, and the reason for the return.
              </span>
              <br />
              <br />
              <span>
                Our customer service team will provide you with a Return
                Authorization (RA) number and detailed instructions on how to
                proceed. You will also be provided a return address depending on
                your location.
              </span>
              <br />
              <br />
            </p>
            <br></br>

            <p>
              <span>
                <b> 3. Return Shipping: </b>
              </span>
              <span>
                Customers are responsible for the cost of return shipping.
              </span>
              <br />
              <br />
              <span>
                We recommend using a trackable and insured shipping method to
                ensure the safe return of the product.
              </span>
              <br />
              <br />
              <span>
                Please clearly mark the RA number on the outside of the package.
              </span>
              <br />
              <br />
            </p>
            <br></br>

            <p>
              <span>
                <b> 4. Refund or Exchange: </b>
              </span>
              <span>
                Upon receiving the returned item(s), our team will inspect the
                product(s) to ensure they meet the return eligibility criteria.
              </span>
              <br />
              <br />
              <span>
                Refunds will be processed to the original method of payment
                within 5 business days.
              </span>
              <br />
              <br />
              <span>
                If you prefer an exchange, please indicate the replacement
                item(s) you would like in your return request. We will do our
                best to accommodate based on product availability.
              </span>
              <br />
              <br />
              <span>
                Unfortunately, due to transportation delays, your refund may
                require an additional approximate 3-5 days to process. Thank you
                for your patience and understanding.
              </span>
              <br />
              <br />
            </p>
            <br></br>

            <p>
              <span>
                <b> 5. Exceptions: </b>
              </span>
              <span>
                We do not accept returns on opened or used beauty products due
                to hygiene and safety reasons.
              </span>
              <br />
              <br />
              <span>
                Final sale items are not eligible for return or exchange.
              </span>
              <br />
              <br />
            </p>
            <br></br>

            <p>
              <span>
                <b> 6. Damaged or Defective Products: </b>
              </span>
              <span>
                If you receive a damaged or defective product, please contact us
                immediately with photos of the damaged item and its packaging.
                We will provide instructions on how to proceed.
              </span>
              <br />
              <br />
            </p>
            <br></br>

            <p>
              <span>
                <b> 7. Cancellations: </b>
              </span>
              <span>
                Orders cannot be canceled once they have been shipped. If you
                wish to cancel an order, please contact us as soon as possible,
                and we will do our best to assist you.
              </span>
              <br />
              <br />
            </p>
            <br></br>

            <p>
              <span>
                <b> 8. Contact Information: </b>
              </span>
              <span>Customer Service Email: [info@xpressbeauty.ca]</span>
              <br />
              <br />
            </p>
            <br></br>

            <p>
              <span>
                Thank you for choosing XpressBeauty. We appreciate your business
                and are committed to ensuring your satisfaction with our
                products and services. If you have any questions or concerns,
                please do not hesitate to contact our customer service team.
              </span>
              <br />
              <br />
            </p>
          </span>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Xpress Beauty | Return Policy",
  links: [
    {
      rel: "canonical",
      href: "https://xpressbeauty.ca/return-policy/",
    },
  ],
  meta: [
    {
      name: "description",
      content: "Return Policy - XpressBeauty",
    },
  ],
};
