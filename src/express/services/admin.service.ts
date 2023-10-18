import Cryptr from "cryptr";
import Admin from "../schemas/admin.schema";
import jwt from "jsonwebtoken";

export const login_service = async (userObject: any) => {
  const cryptr = new Cryptr(import.meta.env.VITE_SECRET ?? "");
  try {
    const result = await Admin.findOne({ email: userObject.email });
    if (!result) {
      return { status: "failed", err: "User not found" };
    }
    if (userObject.password === cryptr.decrypt(result?.password ?? "")) {
      const token = jwt.sign(
        { user_id: result?._id, role: result?.role },
        import.meta.env.VITE_JWTSECRET ?? "",
        {
          expiresIn: "2h",
        }
      );
      return { status: "success", token: token };
    } else {
      return { status: "failed" };
    }
  } catch (err: any) {
    return { status: "failed", err: err.message };
  }
};
