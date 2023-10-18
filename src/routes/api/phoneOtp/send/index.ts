import type { RequestHandler } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { getUserById } from "~/express/services/user.service";
import { sendPhoneOtp } from "~/utils/sendPhoneOtp";

export const onPost: RequestHandler = async ({
  cookie,
  json,
  parseBody,
  env,
}) => {
  const body = await parseBody();
  const token = (body as any).token;
  const secret = env.get("VITE_JWTSECRET") || "";
  try {
    const verify = jwt.verify(token, secret);
    if (verify) {
      const user = await getUserById((verify as any).user_id);
      if (!user) {
        json(200, { status: "failed", message: "User not found" });
        return;
      }
      const sendPhoneOtpReq = await sendPhoneOtp(
        user.result?.phoneNumber ?? "",
        user.result?.PhoneVerifyToken ?? ""
      );
      if (sendPhoneOtpReq.status === "success") {
        json(200, { status: "success", message: "OTP sent successfully" });
        return;
      } else {
        json(200, { status: "failed", message: "OTP sending failed" });
        return;
      }
    } else {
      json(200, { status: "failed", message: "Invalid token" });
      return;
    }
  } catch (error: any) {
    if (error.message === "jwt expired") {
      const decoded = jwt.decode(token);
      const newToken = jwt.sign({ ...(decoded as any) }, secret, {
        expiresIn: "1h",
      });
      cookie.set("token", newToken, {
        httpOnly: true,
        path: "/",
      });
      const user = await getUserById((decoded as any).id);
      if (!user) {
        json(200, { status: "failed", message: "User not found" });
        return;
      }
      const sendPhoneOtpReq = await sendPhoneOtp(
        user.result?.phoneNumber ?? "",
        user.result?.PhoneVerifyToken ?? ""
      );
      if (sendPhoneOtpReq.status === "success") {
        json(200, { status: "success", message: "OTP sent successfully" });
        return;
      } else {
        json(200, { status: "failed", message: "OTP sending failed" });
        return;
      }
    }
  }
  json(200, { status: "failed", message: "Something went wrong" });
};
