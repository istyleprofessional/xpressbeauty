import jwt from "jsonwebtoken";

export const verifyTokenAdmin = (token: string) => {
  let isAuthorized = false;
  jwt.verify(
    token,
    process.env.QWIK_APP_TOKEN_SECRET ?? "",
    async (err: any, decoded: any) => {
      if (err) {
        isAuthorized = false;
      }
      const jsonDecoded = JSON.parse(JSON.stringify(decoded));
      if (jsonDecoded?.role === "a") {
        isAuthorized = true;
      }
    }
  );
  return isAuthorized;
};
