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
        <h1 class="text-4xl font-bold">About Us - XpressBeauty</h1>
        <div class="text-dark-900 text-left relative w-fit  h-fit">
          <span>
            <span >
              Welcome to XpressBeauty, where beauty meets excellence. We are a Canadian-based online beauty
              store dedicated to providing top-notch hair care products and accessories to our valued customers, not
              only in Canada but also across the border in the United States.
            </span>
            <br>
            </br>
            <br>
            </br>
            <p>
              <span><b> Our Mission:  </b></span> At XpressBeauty our mission is simple yet profound - to empower individuals to embrace
              their unique beauty by offering a curated selection of high-quality hair care products. We believe that
              everyone deserves to have healthy, vibrant, and beautiful hair, and we are here to help you achieve just
              that.</p>

            <br>
            </br>


            <h1 class="text-2xl font-bold">Why Choose XpressBeauty?</h1>
            <br>
            </br>
            <ul class="list-disc">
              <li><b>Diverse Product Range:</b> Explore our extensive collection of hair care products tailored to meet
                the diverse needs of our customers, whether you're seeking moisture-rich treatments, styling
                tools, or accessories.</li>
              <br />
              <li> <b> Canadian Roots, Global Reach: </b> Based in Canada, we take pride in our Canadian heritage.
                However, our reach extends beyond borders, welcoming customers from the United States to
                experience the excellence of our products and service.</li>  <br />

              <li><b>  Expertly Curated Selection:</b> Our team of beauty enthusiasts meticulously selects each product
                to ensure they meet our high standards. We believe in offering you not just products but
                solutions that cater to your unique hair care requirements.</li>  <br />
              <li><b> Customer-Centric Approach:</b>  Your satisfaction is our priority. We are committed to providing an
                exceptional shopping experience, from easy navigation on our user-friendly website to prompt
                customer service that goes above and beyond.</li>  <br />
            </ul>

            <p>
              <span><b> Connect With Us:  </b></span> We love connecting with our community. Follow us on social media to stay updated
              on the latest trends, tips, and product launches. Your journey to beautiful and healthy hair starts here.</p>
            <br>
            </br>


            <span><b> Follow Us:  </b></span>

            <br />
            <br />

            <span> <b>Instagram:</b> <a
                class="text-bold font-light text-base  gap-2"
                href="https://www.instagram.com/xpressbeauty23"
              >
               
               @Xpressbeauty23
              </a>
              <br />
              <span><b>Facebook: </b>  <a
                href="https://www.facebook.com/xpressbeautypro/"
                class="text-bold font-light text-base  gap-2"
              >
              /xpressbeautypro
              </a> </span>

              <br />
              <br />
              Thank you for choosing XpressBeauty. We look forward to being part of your hair care journey and
              helping you achieve the gorgeous, healthy hair you deserve.</span>









          </span>
        </div>
      </div>
    </div>
  );
});
