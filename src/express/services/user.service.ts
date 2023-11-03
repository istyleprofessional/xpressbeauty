import User from "../schemas/users.schema";
import Cryptr from "cryptr";
import jwt from "jsonwebtoken";
import { generateUniqueInteger } from "~/utils/generateOTP";

export const cryptr = new Cryptr(import.meta.env.VITE_SECRET ?? "");

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
      stripeCustomerId: userObject.stripeCustomerId,
    });
    return { status: "success", result: result };
  } catch (err: any) {
    if (err.code === 11000) {
      return { status: "failed", err: "Email already exists" };
    }
    return { status: "failed", err: err?.message };
  }
};

export const getUserEmailById = async (id: string) => {
  try {
    const result = await User.findOne(
      { _id: id },
      {
        email: 1,
        _id: 1,
        firstName: 1,
        lastName: 1,
        phoneNumber: 1,
        EmailVerifyToken: 1,
        PhoneVerifyToken: 1,
      }
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
        import.meta.env.VITE_JWTSECRET ?? "",
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

export const emailUpdateToken = async (id: string, token: string) => {
  try {
    const result = await User.findOneAndUpdate(
      { _id: id },
      { EmailVerifyToken: token },
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

export const phoneUpdateToken = async (id: string, token: string) => {
  try {
    const result = await User.findOneAndUpdate(
      { _id: id },
      { PhoneVerifyToken: token },
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
    const userdata = await User.findOne({ _id: id });
    if (
      (data.email === userdata?.email ?? "") &&
      (data.phoneNumber === userdata?.phoneNumber ?? "")
    ) {
      const result = await User.findOneAndUpdate(
        { _id: id },
        { ...data },
        { new: true }
      );

      return { status: "success", result: result };
    } else if (
      (data.email !== userdata?.email ?? "") &&
      (data.phoneNumber !== userdata?.phoneNumber ?? "")
    ) {
      const result = await User.findOneAndUpdate(
        { _id: id },
        { ...data, isEmailVerified: false, isPhoneVerified: false },
        { new: true }
      );

      return { status: "success", result: result };
    } else if (data.email === userdata?.email ?? "") {
      const result = await User.findOneAndUpdate(
        { _id: id },
        { ...data, isPhoneVerified: false },
        { new: true }
      );

      return { status: "success", result: result };
    } else {
      const result = await User.findOneAndUpdate(
        { _id: id },
        { ...data, isEmailVerified: false },
        { new: true }
      );

      return { status: "success", result: result };
    }
  } catch (err) {
    return { status: "failed", err: err };
  }

  // try {
  //   const result = await User.findOneAndUpdate(
  //     { _id: id },
  //     { ...data },
  //     { new: true }
  //   );
  //   return { status: "success", result: result };
  // } catch (err) {
  //   return { status: "failed", err: err };
  // }
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

export const findUserByUserEmail = async (email: string) => {
  try {
    const req = await User.find({ email: email });
    if (req.length > 0) {
      return { status: "success", result: req };
    } else {
      return { status: "failed" };
    }
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const updateUserPassword = async (email: string, password: string) => {
  try {
    const encryptedString = cryptr.encrypt(password);
    const result = await User.findOneAndUpdate(
      { email: email },
      { password: encryptedString },
      { new: true }
    );
    if (result) {
      return { status: "success", result: result };
    } else {
      return { status: "failed", err: "Something went wrong" };
    }
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const updatePaymentMethod = async (
  paymentMethod: string,
  id: string
) => {
  try {
    const req = await User.findOneAndUpdate(
      { _id: id },
      {
        $push: { paymentMethod: paymentMethod },
      },
      { new: true }
    );
    if (req) {
      return { status: "success", result: req };
    } else {
      return { status: "failed", err: "Something went wrong" };
    }
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const getUsers = async (page: number) => {
  try {
    const result = await User.find({}, { password: 0 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * 20)
      .limit(20);
    const count = await User.countDocuments();
    return { status: "success", result: result, count: count };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const getAllRegisteredUsersCount = async () => {
  try {
    const result = await User.countDocuments();
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};
