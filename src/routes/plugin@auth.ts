import { serverAuth$ } from "@builder.io/qwik-auth";
import type { Provider } from "@auth/core/providers";
import Google from "@auth/core/providers/google";
import {
  userGoogleLogin,
  userRegistration,
} from "~/express/services/user.service";
import jwt from "jsonwebtoken";
import {
  getCartByUserId,
  updateUserCart,
} from "~/express/services/cart.service";

export const { onRequest, useAuthSession, useAuthSignin, useAuthSignout } =
  serverAuth$(({ env, cookie }) => ({
    secret: env.get("PRIVATE_GOOGLE_CLIENT_SECRET") ?? "",
    trustHost: true,

    callbacks: {
      async signIn({ profile }) {
        if (profile?.name && profile?.email) {
          try {
            const { given_name, family_name, email, at_hash } = profile;
            const userObject = {
              firstName: given_name,
              lastName: family_name,
              email: email,
              password: at_hash,
            };
            const addNewUserReq = await userRegistration(userObject);
            if (addNewUserReq.err.includes("exists")) {
              const user = await userGoogleLogin(userObject);
              if (user.err) {
                console.log("user.err", user.err);
                return false;
              }
              const prevToken = cookie.get("token");
              if (prevToken?.value) {
                const decodeToken: any = jwt.verify(
                  prevToken.value,
                  env.get("VITE_JWTSECRET") ?? ""
                );
                if (decodeToken) {
                  const checkForCart: any = await getCartByUserId(
                    decodeToken.user_id ?? ""
                  );
                  if (checkForCart?.status !== "failed") {
                    const data = {
                      userId: user.result?._id ?? "",
                      products: checkForCart?.products ?? [],
                    };
                    await updateUserCart(data);
                  }
                }
              }
              const newToken = jwt.sign(
                {
                  user_id: user.result?._id ?? "",
                  isDummy: false,
                  exp: Math.floor(Date.now() / 1000) + 60 * 60,
                },
                env.get("VITE_JWTSECRET") ?? ""
              );
              cookie.set("token", newToken, { httpOnly: true, path: "/" });
              return true;
            }
            // console.log("addNewUserReq", addNewUserReq);
          } catch (e) {
            return false;
          }
          return false;
        }
        return false; //
      },
      async signOut() {
        console.log("signOut");
      },
    },
    providers: [
      Google({
        clientId: env.get("PUBLIC_GOOLGE_CLIENT_ID") ?? "",
        clientSecret: env.get("PRIVATE_GOOGLE_CLIENT_SECRET") ?? "",
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
          },
        },
      }),
    ] as Provider[],
  }));
