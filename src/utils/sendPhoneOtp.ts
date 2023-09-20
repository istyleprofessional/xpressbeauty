import Twilio from "twilio";

export const sendPhoneOtp = async (phoneNumber: string, otp: string) => {
  try {
    const client = new (Twilio as any).Twilio(
      process?.env?.TWILIO_ACCOUNT_SID ?? "",
      process?.env?.TWILIO_AUTH_TOKEN ?? ""
    );
    const result = await client.messages.create({
      body: `Xpressbeauty verification code is: ${otp}`,
      from: "+12134014667",
      to: `+${phoneNumber}`,
    });
    if (result) {
      return { status: "success", result: result };
    } else {
      return { status: "failed" };
    }
  } catch (err) {
    return { status: "failed", err: err };
  }
};
