import { component$, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { Steps } from "~/components/shared/steps/steps";
import { getDummyCustomer } from "~/express/services/dummy.user.service";
import { getOrderByOrderNumberService } from "~/express/services/order.service";
import { findUserByUserId } from "~/express/services/user.service";
import { refreshToken } from "~/utils/refreshToken";
import { verifyTokenUtil } from "~/utils/verifyTokenUtil";

export interface SuccessProps {
  dataForSurvey: any;
}

export const useLoaderSuccess = routeLoader$(async ({ params, cookie }) => {
  const orderId = params.args.split("/")[0];
  const token = cookie.get("token")?.value;
  if (!token) {
    return null;
  }
  let verifiedToken: any;
  const verifyToken = verifyTokenUtil(token);
  if (verifyToken.status === "error") {
    if (verifyToken.error === "expired") {
      verifiedToken = refreshToken(token);
      cookie.set("token", verifiedToken, { httpOnly: true, path: "/" });
    } else {
      return null;
    }
  }
  verifiedToken = verifyToken.data;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const deliveryDateInFormat = `${deliveryDate.getFullYear()}-${
    deliveryDate.getMonth() + 1
  }-${deliveryDate.getDate()}`;

  const getOrderById = await getOrderByOrderNumberService(orderId ?? "");
  if (!getOrderById.request) {
    return null;
  }
  let user: any;

  if (verifiedToken?.isDummy) {
    const dummy = await getDummyCustomer(verifiedToken?.user_id);
    if (dummy.status === "failed") {
      return null;
    }
    user = dummy.result;
    return {
      dataForSurvey: {
        email: user?.email,
        order_id: orderId,
        country:
          getOrderById.request?.shippingAddress.country === "Canada"
            ? "CA"
            : "US",
        delivery_date: deliveryDateInFormat,
      },
    };
  } else {
    const real = await findUserByUserId(verifiedToken?.user_id);
    if (real.status === "failed") {
      return null;
    }
    user = real.result;
    return {
      dataForSurvey: {
        email: user?.email,
        order_id: orderId,
        country:
          getOrderById.request?.shippingAddress.country === "Canada"
            ? "CA"
            : "US",
        delivery_date: deliveryDateInFormat,
      },
    };
  }
});

export default component$(() => {
  const data = useLoaderSuccess().value;
  const scriptToLoad = `
  window.renderOptIn = function() {
    window.gapi.load('surveyoptin', function() {
      window.gapi.surveyoptin.render(
        {
          // REQUIRED
          "merchant_id": "5086882223",
          "order_id": "${data?.dataForSurvey?.order_id}",
          "email": "${data?.dataForSurvey?.email}",
          "delivery_country": "${data?.dataForSurvey?.country}",
          "estimated_delivery_date": "${data?.dataForSurvey?.delivery_date}",
        });
    });
  }`;

  useVisibleTask$(({ track }) => {
    track(() => data?.dataForSurvey?.order_id);
    if (!data?.dataForSurvey?.order_id) {
      location.href = "/";
    }
  });

  return (
    <div class="flex flex-col justify-center items-center gap-10 mb-10">
      <Steps pageType="confirmation" />

      <div class="bg-[url('/Vector.svg')]">
        <svg
          width="263"
          height="264"
          viewBox="0 0 263 264"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M131.5 0.75L160.875 23.25L197.125 18.25L210.875 52.625L245.25 66.375L240.25 102.625L262.75 132L240.25 161.375L245.25 197.625L210.875 211.375L197.125 245.75L160.875 240.75L131.5 263.25L102.125 240.75L65.875 245.75L52.125 211.375L17.75 197.625L22.75 161.375L0.25 132L22.75 102.625L17.75 66.375L52.125 52.625L65.875 18.25L102.125 23.25L131.5 0.75Z"
            fill="#18181B"
          />
          <path
            d="M197.75 73.25L112.75 158.25L77.75 123.25L60.25 140.75L112.75 193.25L215.25 90.75L197.75 73.25Z"
            fill="#FAFAFA"
          />
        </svg>
      </div>

      <h1 class="text-3xl font-semibold text-center">
        Thank you for your order!
      </h1>
      <p class="text-sm font-light text-center">
        Your order has been placed and will be processed shortly.
      </p>
      <script
        src="https://apis.google.com/js/platform.js?onload=renderOptIn"
        async
        defer
      ></script>
      <script dangerouslySetInnerHTML={scriptToLoad} />
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const data = resolveValue(useLoaderSuccess);
  const successScript = `
  gtag('event', 'conversion', {
      'send_to': 'AW-11167601664/EaRpCMn-5f0YEICokM0p',
      'transaction_id': '${data?.dataForSurvey?.order_id}',
`;
  return {
    scripts: [
      {
        script: successScript,
        key: "gtag",
      },
      {
        src: "/gtag.js",
        async: true,
      },
      {
        src: "/ads.js",
        async: true,
      },
    ],
    title: "Xpress Beauty | Thank you for your order!",
    links: [
      {
        rel: "canonical",
        href: "https://xpressbeauty.ca/payment/success",
      },
    ],
    meta: [
      {
        name: "description",
        content: "Thank you for your order - XpressBeauty",
      },
    ],
  };
};
