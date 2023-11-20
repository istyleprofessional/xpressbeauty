import jwt from "jsonwebtoken";

export const verifyTokenUtil = (token: string) => {
  try {
    const verify: any = jwt.verify(token, import.meta.env.VITE_JWTSECRET ?? "");
    if (!verify) return { status: "error", error: "Invalid token" };
    return { status: "success", data: verify };
  } catch (e: any) {
    if (e.message === "jwt expired")
      return { status: "error", error: "expired" };
    return { status: "error", error: "Invalid token" };
  }
};
