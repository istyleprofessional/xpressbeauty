import jwt from "jsonwebtoken";

export const verifyTokenAdmin = (token: string) => {
  try {
    const verify: any = jwt.verify(token, import.meta.env.VITE_JWTSECRET ?? "");
    if (!verify) return false;
    if (verify.role === "a") return true;
    return false;
  } catch {
    return false;
  }
};
