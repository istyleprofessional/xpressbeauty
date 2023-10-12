import type { RequestHandler } from "@builder.io/qwik-city";
import { generateUniqueInteger } from "~/utils/generateOTP";
import { sendVerficationMail } from "~/utils/sendVerficationMail";
import jwt from "jsonwebtoken";
import {
  getUserEmailById,
  updateEmailVerficationCode,
} from "~/express/services/user.service";

export const onGet: RequestHandler = async ({ url, json, cookie }) => {
  const recaptchaToken = url.searchParams.get("recaptcha");
  if (!recaptchaToken) {
    json(200, { status: "failed", message: "Something went wrong" });
    return;
  }
  const secret_key = process.env.RECAPTCHA_SECRET_KEY ?? "";
  const googleUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${recaptchaToken}`;
  const recaptcha = await fetch(googleUrl, { method: "post" });
  const recaptchaText = await recaptcha.text();
  const google_response = JSON.parse(recaptchaText);
  if (!google_response.success) {
    json(200, { status: "failed", message: "Boot detected" });
    return;
  }
  const token = url.searchParams.get("token");
  if (!token) {
    json(200, { status: "failed", message: "Something went wrong" });
    return;
  }
  try {
    const verify: any = jwt.verify(token ?? "", process.env.JWTSECRET ?? "");
    if (verify) {
      const newToken = generateUniqueInteger();
      const request: any = await getUserEmailById(verify.user_id ?? "");
      await updateEmailVerficationCode(request.result._id, newToken);
      await sendVerficationMail(
        request?.result?.email ?? "",
        `${request?.result?.firstName} ${request?.result?.lastName}`,
        token ?? "",
        newToken
      );
      json(200, { status: "success", token: token });
      return;
    } else {
      json(200, { status: "failed", message: "Something went wrong" });
      return;
    }
  } catch (error: any) {
    if (error.message === "jwt expired") {
      const decoded: any = jwt.decode(token ?? "");
      const newJwtToken = jwt.sign(
        { user_id: decoded.user_id, isDummy: false },
        process.env.JWTSECRET ?? "",
        { expiresIn: "2h" }
      );
      cookie.set("token", newJwtToken, {
        httpOnly: true,
        secure: true,
      });
      const newToken = generateUniqueInteger();
      const request: any = await getUserEmailById(decoded.user_id ?? "");
      await updateEmailVerficationCode(request.result._id, newToken);
      await sendVerficationMail(
        request?.result?.email ?? "",
        `${request?.result?.firstName} ${request?.result?.lastName}`,
        newJwtToken ?? "",
        newToken
      );
      json(200, { status: "success", token: newJwtToken });
      return;
    } else {
      json(200, { status: "failed", message: "Something went wrong" });
      return;
    }
  }
};
