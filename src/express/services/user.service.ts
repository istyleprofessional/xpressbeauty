import User from "../schemas/users.schema";
import Cryptr from "cryptr";
import jwt from "jsonwebtoken";
import { generateUniqueInteger } from "~/utils/generateOTP";

export const cryptr = new Cryptr(process.env.SECRET ?? "");

export const userRegistration = async (userObject: any) => {
  const phoneVerifyToken = generateUniqueInteger();
  const encryptedString = cryptr.encrypt(userObject.password);
  try {
    const result: any = await User.create({
      email: userObject.email,
      password: encryptedString,
      firstName: userObject.firstName,
      lastName: userObject.lastName,
      phoneNumber: userObject.phoneNumber,
      EmailVerifyToken: userObject.EmailVerifyToken,
      PhoneVerifyToken: phoneVerifyToken,
    });
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const getUserEmailById = async (id: string) => {
  try {
    const result = await User.findOne(
      { _id: id },
      { email: 1, _id: 1, firstName: 1, lastName: 1, phoneNumber: 1 }
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

export const updatePhoneVerficationCode = async (
  id: string,
  newToken: string
) => {
  try {
    const request = await User.findOneAndUpdate(
      { _id: id },
      { PhoneVerifyToken: newToken },
      { new: true }
    );
    if (request) {
      return { status: "success", result: request };
    } else {
      return { status: "failed", err: "Something went wrong" };
    }
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const findUserByUserId = async (id: string) => {
  try {
    const result = await User.findOne({ _id: id }, { password: 0 });
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
        process.env.JWTSECRET ?? "",
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

export const updateEmailVerficationCode = async (
  id: string,
  newToken: string
) => {
  try {
    const request = await User.findOneAndUpdate(
      { _id: id },
      { EmailVerifyToken: newToken },
      { new: true }
    );
    if (request) {
      return { status: "success", result: request };
    } else {
      return { status: "failed" };
    }
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const checkUserEmailToken = async (token: string) => {
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

export const getUserEmailOtp = async (data: any) => {
  try {
    const result = await User.findOneAndUpdate(
      { EmailVerifyToken: data.otp },
      { EmailVerifyToken: null, isEmailVerified: true },
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

export const updateExistingUser = async (data: any, id: string) => {
  try {
    const result = await User.findOneAndUpdate(
      { _id: id },
      { ...data },
      { new: true }
    );
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const getUserPhoneOtp = async (data: any) => {
  try {
    const result = await User.findOneAndUpdate(
      { PhoneVerifyToken: data.otp },
      { PhoneVerifyToken: null, isPhoneVerified: true },
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
