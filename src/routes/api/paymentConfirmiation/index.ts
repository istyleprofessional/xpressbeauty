import type { RequestHandler } from "@builder.io/qwik-city/middleware/request-handler";
import { getDummyCustomer } from "~/express/services/dummy.user.service";
import { getUserById } from "~/express/services/user.service";
import { sendConfirmationEmail } from "~/utils/sendConfirmationEmail";

export const onPost: RequestHandler = async ({ json, parseBody, cookie }) => {
  const data: any = await parseBody();
  const isVerify = cookie.get("verified")?.value;
  if (isVerify === "false") {
    const request = await getDummyCustomer(data.userId);
    console.log("request", request);
    json(200, request);
  } else {
    const request = await getUserById(data.userId);
    if (request.status === "success") {
      const email = request?.result?.email;
      const name = `${request?.result?.firstName} ${request?.result?.lastName}`;
      const sendEmail = await sendConfirmationEmail(email ?? "", name);
      console.log("sendEmail", sendEmail);
    }
    console.log("request", request);
    json(200, request);
  }
};
