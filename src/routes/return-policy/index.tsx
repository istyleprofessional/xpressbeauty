import { component$ } from "@builder.io/qwik";

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
        <h1 class="text-4xl font-bold text-center">Return Policy</h1>
        <div class="w-fit h-fit">
          <span style="text-zinc-900 text-2xl font-normal leading-loose">
            Xpress beauty RESERVES THE RIGHT TO CANCEL AND/OR ADJUST ANY ORDERS
            PLACED DUE TO INCORRECT STOCK OR PRICING.
            <br />
            <br />
          </span>
          <span style="text-zinc-900 text-4xl font-bold leading-10">
            Cancellations
            <br />
          </span>
          <span style="text-zinc-900 text-2xl font-normal leading-loose">
            <br />
            Any cancellation of orders must be made prior to being shipped.
            Cancellations can only be made by calling customer service
            representative at +1(213)-401-4667. NO returns, exchanges, or
            cancellations on customized and/or special orders. Changes may be
            permitted on customized and/or special orders if request is made
            prior to start of production.
            <br />
            <br />
          </span>
          <span style="text-zinc-900 text-4xl font-bold leading-10">
            Returns/Exchanges
            <br />
          </span>
          <span style="text-zinc-900 text-2xl font-normal leading-loose">
            <br />
            We will accept merchandise for return and/or exchanges only within
            30 days of receipt. The merchandise must be in original condition
            along with original materials, accessories, and packaging.
            Additional fees may apply if shipments are returned damaged or
            without original packaging. Shipping charges are non-refundable.
            Customer is responsible for shipping charges incurred for any
            returns and/or exchanges. Any returns/exchanges without prior
            authorization will not be accepted. All returns/exchanges may be
            subject to inspection before approval.
            <br />
            <br />
            Please contact our customer service representative at
            +1(213)-401-4667 for return authorization. Once your authorization
            has been established, you will be given a return reference number.
            Confirm shipping arrangements with the service representative and
            re-package original merchandise as packaged on delivery. We
            recommend that insurance is purchased on all returned items because
            xpressbeauty.ca is not responsible for damages incurred during
            transit to us. Once returns are accepted, you will receive your
            refund amount and/or credits within 7 business days.
            <br />
            <br />
          </span>
          <span style="text-zinc-900 text-4xl font-bold leading-10">
            Restocking Fee
            <br />
          </span>
          <span style="text-zinc-900 text-2xl font-normal leading-loose">
            <br />
            There is a 25% restocking fee all returns.
            <br />
            <br />
          </span>
          <span style="text-zinc-900 text-4xl font-bold leading-10">
            Refunds
            <br />
          </span>
          <span style="text-zinc-900 text-2xl font-normal leading-loose">
            <br />
            Once returns are received and processed, refunds will be issued to
            the original form of payment. Credit Card refunds within 5 business
            days after receipt. Checks and Wires refunds will take up to 7
            business days.
            <br />
            <br />
          </span>
          <span style="text-zinc-900 text-4xl font-bold leading-10">
            Exclusions on Returns and Cancellations
            <br />
          </span>
          <span style="text-zinc-900 text-2xl font-normal leading-loose">
            <br />
            Xpress beauty will NOT accept any returns or exchanges for any
            opened Clippers, Trimmers, Combs, Hair Accessories, Makeup, Brushes,
            Shears, Blade, Gel/Nail Polishes, and Shampoo Units that have
            already been installed or connected for plumbing. Returns,
            exchanges, or cancellations are invalid without prior authorization.
            There are no returns, exchanges, or cancellations on customized
            and/or special orders.
            <br />
            <br />
            <br />
          </span>
          <span style="text-zinc-900 text-4xl font-bold leading-10">
            Damaged or Defective Merchandise
            <br />
          </span>
          <span style="text-zinc-900 text-2xl font-normal leading-loose">
            <br />
            When receiving products, the customer is responsible to inspect
            before signing the delivery receipt. If the product is damaged or
            the packaging is damaged, please notate that on the delivery receipt
            prior to signing and contact Xpress beauty within 48 hours. We will
            verify the information and replace the units that are damaged.
            Please do not dispose of any packaging or the product.
            <br />
            If the item is defective, please contact xpressbeauty.ca
            representative at +1(213)-401-4667 for assistance. A xpressbeauty.ca
            technician will inspect the item and either fix the cause of the
            defect or replace the part that is needed, the whole unit, or offer
            a full refund once the item has been returned within 30 days of
            receipt.
          </span>
        </div>
      </div>
    </div>
  );
});
