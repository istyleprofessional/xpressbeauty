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
        <h1 class="text-4xl font-bold text-center">Who We are</h1>
        <div class="w-fit h-fit text-zinc-900 text-2xl font-normal leading-loose">
          Welcome to Xpress Beauty, your premier destination for top-quality
          beauty supplies and aesthetic equipment in Canada and North America.
          As a leading manufacturer and wholesale supplier, Xpress Beauty is
          committed to providing our clients with the best possible products and
          services.
          <br />
          <br />
          We specialize in creating custom salon and spa furniture to your
          specific design and needs. Our comprehensive selection includes
          high-quality lines for Skin Care, Hair Care, Manicure, Pedicure, Body
          Care, Makeup, Spa and Salon Equipment, Medical Spa Equipment, Waxes
          and Paraffin, Sterilization, Linens and Disposables.
          <br />
          At Xpress Beauty, we are more than just a supplier - we also offer
          complete step-by-step hands-on product knowledge educational courses
          and seminars to ensure you have the skills and expertise to use our
          products effectively.
          <br />
          <br />
          We take pride in being your one-stop-shop for all your salon and spa
          supplies. Our locations are Toronto, Oakville, Mississauga, Brampton,
          Milton, Richmond Hill, North York, Vaughan, Burlington, Kitchener,
          Waterloo, Barrie, Quebec, and beyond.
          <br />
          <br />
          Our success stems from our flexibility and commitment to meeting
          individual needs. We strive to ensure that every customer is
          completely satisfied with their experience. If you don't find what you
          need on our website, please text us on (213) 401-4667 or complete the
          following form to let us know, and we'll get back to you soon.
          <br />
          <br />
          Choose Xpress Beauty for all your beauty and spa needs, and experience
          the difference in quality and service.
        </div>
      </div>
    </div>
  );
});
