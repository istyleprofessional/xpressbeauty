import Cryptr from "cryptr";
import Admin from "../schemas/admin.schema";
import jwt from "jsonwebtoken";

export const login_service = async (userObject: any) => {
  const cryptr = new Cryptr(process.env.SECRET ?? "");
  try {
    const result = await Admin.findOne({ email: userObject.email.value });
    if (userObject.password.value === cryptr.decrypt(result?.password ?? "")) {
      const token = jwt.sign(
        { user_id: result?._id, role: result?.role },
        process.env.QWIK_APP_TOKEN_SECRET ?? "",
        {
          expiresIn: "2h",
        }
      );
      return { status: "success", token: token };
    } else {
      return { status: "failed" };
    }
  } catch (err) {
    return { err: err };
  }
};
