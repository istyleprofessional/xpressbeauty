import Order from "../schemas/order.schema";

export const createOrder = async (data: any) => {
  try {
    console.log("order", data);
    const request = await Order.create({
      shippingAddress: data.shippingAddress,
      shippingName: data.shippingName,
      totalQuantity: data.totalQuantity,
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod,
      orderStatus: data.orderStatus,
      paymentId: data.paymentId,
      totalPrice: data.totalPrice,
      products: data.products,
      userId: data.userId,
      order_number: data.order_number,
      paypalObj: data.paypalObj,
      currency: data.currency,
      totalInfo: data.totalInfo,
    });
    return { status: "success", request: request };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};

export const getMyOrdersService = async (userId: string) => {
  try {
    const request = await Order.find({ userId: userId });
    return { status: "success", request: request };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};

export const getOrderByOrderIdService = async (orderId: string) => {
  try {
    const request = await Order.findOne({ _id: orderId });
    return { status: "success", request: request };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};

export const getOrderByOrderNumberService = async (orderNumber: string) => {
  try {
    const request = await Order.findOne({ order_number: orderNumber });
    return { status: "success", request: request };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};

export const getOrdersService = async (page: number) => {
  try {
    const request = await Order.aggregate([
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
      {
        $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
      },
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
          "dummyUser.email": 1,
          "dummyUser.firstName": 1,
          "dummyUser.lastName": 1,
          "dummyUser.phoneNumber": 1,
          shippingAddress: 1,
          totalPrice: 1,
          createdAt: 1,
          orderStatus: 1,
          order_number: 1,
          products: 1,
        },
      },
    ])
      .sort({ createdAt: -1 })
      .skip((page - 1) * 20)
      .limit(20);
    const count = await Order.countDocuments();
    return { status: "success", request: request, total: count };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const request = await Order.findOneAndUpdate(
      { _id: orderId },
      { orderStatus: status },
      { new: true }
    );
    return { status: "success", request: request };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};

export const getAllShippedOrdersCount = async () => {
  try {
    const request = await Order.countDocuments({ orderStatus: "Shipped" });
    return { status: "success", request: request };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};
// for current month
export const getAllItemsNumberInAllShippedOrders = async () => {
  try {
    const request = await Order.aggregate([
      {
        $match: {
          orderStatus: "Shipped",
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalQuantity" },
        },
      },
    ]);
    return { status: "success", request: request[0].total };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};

export const getAllPendingOrdersCount = async () => {
  try {
    const request = await Order.countDocuments({ orderStatus: "Pending" });
    return { status: "success", request: request };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};

export const getTotalRevenue = async () => {
  // return revenue of each month by calculating total price of each order in that month using createdAt field
  try {
    const request = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ["Refund", "Return"] },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalPrice" },
          count: { $sum: "$totalQuantity" },
        },
      },
    ]);
    console.log(request);
    return { status: "success", request: request };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};
