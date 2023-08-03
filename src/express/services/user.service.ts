import User from "../schemas/users.schema";
import Cryptr from "cryptr";
import jwt from "jsonwebtoken";

export const cryptr = new Cryptr(process.env.SECRET ?? "");

export const userRegistration = async (userObject: any) => {
  try {
    const result = await User.create(userObject);
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const findUserByBrowserId = async (browserId: string) => {
  try {
    const result = await User.findOne(
      { browserId: browserId },
      { password: 0 }
    );
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const userLogin = async (userObject: any) => {
  try {
    const result = await User.findOne({ email: userObject.email });
    if (userObject.password === cryptr.decrypt(result?.password ?? "")) {
      const token = jwt.sign(
        { user_id: result?._id },
        process.env.QWIK_APP_TOKEN_SECRET ?? "",
        {
          expiresIn: "2h",
        }
      );
      delete result?.password;
      return { status: "success", result: result, token: token };
    } else {
      return { status: "failed" };
    }
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const checkUserEmailToken = async (token: string) => {
  console.log(token);
  try {
    const result = await User.findOneAndUpdate(
      { EmailVerifyToken: token },
      { isEmailVerified: true, EmailVerifyToken: null },
      { new: true }
    );
    if (result) {
      return { status: "success", result: result };
    } else {
      return { status: "failed" };
    }
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const getUserById = async (userId: string) => {
  try {
    const result = await User.findOne({ _id: userId }, { password: 0 });
    if (result) {
      return { status: "success", result: result };
    } else {
      return { status: "failed" };
    }
  } catch (err) {
    return { status: "failed", err: err };
  }
};
