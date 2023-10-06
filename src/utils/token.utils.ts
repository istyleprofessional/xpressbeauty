import jwt from "jsonwebtoken";

export const verifyTokenAdmin = (token: string) => {
  try {
    const verify: any = jwt.verify(token, process.env.JWTSECRET ?? "");
    if (!verify) return false;
    if (verify.role === "a") return true;
    return false;
  } catch {
    return false;
  }
};
