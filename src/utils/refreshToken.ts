import jwt from "jsonwebtoken";

export const refreshToken = (token: string) => {
  const decoded: any = jwt.decode(token ?? "");
  const newToken = jwt.sign(
    { user_id: decoded.user_id, isDummy: decoded.isDummy },
    import.meta.env.VITE_JWTSECRET ?? "",
    {
      expiresIn: "2h",
    }
  );
  return newToken;
};
