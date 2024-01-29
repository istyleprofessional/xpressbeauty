import { cart } from "../schemas/cart.schema";

export const updateUserCart = async (data: any) => {
  try {
    const result = await cart.findOne({ userId: data.userId });
    if (result) {
      result.products.push(...data.products);
      const massageData = result.products.reduce((acc: any, curr: any) => {
        const found = acc.find((item: any) => item.id === curr.id);
        if (found) {
          found.quantity += curr.quantity;
          return acc;
        } else {
          acc.push(curr);
          return acc;
        }
      }, []);
      result.products = massageData;
      result.totalQuantity = result.products.reduce(
        (acc: any, curr: any) => acc + curr.quantity,
        0
      );
      result.currency = data.currency;
      await result.save();
      return result;
    } else {
      const result = await cart.create({
        userId: data.userId,
        products: data.products,
        totalQuantity: data.totalQuantity,
        currency: data.currency,
      });
      return result;
    }
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const getCartByUserId = async (userId: string) => {
  try {
    const result = await cart.findOne({ userId: userId });
    return result;
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const deleteProductCart = async (product: any) => {
  try {
    const result = await cart.findOneAndUpdate(
      { userId: product.userId },
      {
        $pull: { products: { id: product.id } },
        $inc: { totalQuantity: -product.quantity },
      },
      { new: true, upsert: true }
    );
    if (result.products.length === 0) {
      await cart.deleteOne({ userId: product.userId });
    }
    return result;
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const deleteCart = async (userId: string) => {
  try {
    const request = await cart.deleteOne({ userId: userId });
    return request;
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const handleDecIncVariationProducts = async (data: any) => {
  try {
    const filter = {
      userId: data.userId,
      "products.id": data.product.id, // Search for the product with the given _id inside the products array
    };
    const update = {
      [`products.$.quantity`]: data.product.quantity,
      totalQuantity: data.totalQuantity,
      currency: data.product.currency,
      [`products.$.price`]: data.product.price,
      [`products.$.currency`]: data.product.currency,
    };
    const result = await cart.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    });
    return result;
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const getCartsPerPageService = async (page: number) => {
  try {
    const request = await cart
      .aggregate([
        {
          $addFields: {
            userIdObj: { $toObjectId: "$userId" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userIdObj",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "dummyusers",
            localField: "userIdObj",
            foreignField: "_id",
            as: "dummyUser",
          },
        },
        {
          $unwind: { path: "$dummyUser", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            "user.email": 1,
            "user.firstName": 1,
            "user.lastName": 1,
            "user.phoneNumber": 1,
            "user.generalInfo": 1,
            "user.isEmailVerified": 1,
            "user.isPhoneNumberVerified": 1,
            "dummyUser.phoneNumber": 1,
            "dummyUser.generalInfo": 1,
            "dummyUser.email": 1,
            "dummyUser.firstName": 1,
            "dummyUser.lastName": 1,
            products: 1,
            createdAt: 1,
            updatedAt: 1,
            totalQuantity: 1,
          },
        },
      ])
      .sort({ createdAt: -1 })
      .skip((page - 1) * 20)
      .limit(20);
    const count = await cart.countDocuments();
    return { status: "success", result: request, total: count };
  } catch (err: any) {
    return { status: "failed", err: err.message };
  }
};
