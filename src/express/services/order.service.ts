import Order from "../schemas/order.schema";

export const createOrder = async (data: any) => {
  try {
    const request = await Order.create({
      notes: data.notes,
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
      payment_intent: data.payment_intent,
      paid: data.paid,
    });
    return { status: "success", request: request };
  } catch (error: any) {
    console.log("order error", error);
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

export const getOrdersService = async (page: number, search?: string) => {
  try {
    const query: any = {};

    if (search) {
      query["$or"] = [];
      query["$or"].push({ "user.email": { $regex: search, $options: "i" } });
      query["$or"].push({
        "user.firstName": { $regex: search, $options: "i" },
      });
      query["$or"].push({ "user.lastName": { $regex: search, $options: "i" } });
      query["$or"].push({
        "user.phoneNumber": { $regex: search, $options: "i" },
      });
      query["$or"].push({
        "dummyUser.email": { $regex: search, $options: "i" },
      });
      query["$or"].push({
        "dummyUser.firstName": { $regex: search, $options: "i" },
      });
      query["$or"].push({
        "dummyUser.lastName": { $regex: search, $options: "i" },
      });
      query["$or"].push({
        "dummyUser.phoneNumber": { $regex: search, $options: "i" },
      });
      query["$or"].push({ order_number: { $regex: search, $options: "i" } });
      query["$or"].push({ orderStatus: { $regex: search, $options: "i" } });
    }
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
        $lookup: {
          from: "dummyusers",
          localField: "userIdObj",
          foreignField: "_id",
          as: "dummyUser",
        },
      },
      {
        $match: query,
      },
      {
        $unwind: { path: "$dummyUser", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
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
          notes: 1,
          shippingAddress: 1,
          currency: 1,
          payment_intent: 1,
          totalInfo: 1,
          totalPrice: 1,
          createdAt: 1,
          orderStatus: 1,
          order_number: 1,
          products: 1,
          paid: 1,
        },
      },
    ])
      .sort({ createdAt: -1 })
      .skip((page - 1) * 20)
      .limit(20);
    const count = await Order.countDocuments(query);
    return { status: "success", request: request, total: count };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  trackingLink?: string,
  trackingCompanyName?: string,
  trackingNumber?: string
) => {
  try {
    const trackingInfo = {
      link: trackingLink,
      companyName: trackingCompanyName,
      trackingNumber: trackingNumber,
    };
    const request = await Order.findOneAndUpdate(
      { _id: orderId },
      { orderStatus: status, trackinginfo: trackingInfo },
      { new: true }
    );
    return { status: "success", request: request };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};

export const updatePaymentOrderStatus = async (
  orderId: string,
  status: boolean,
  orderStatus?: string
) => {
  try {
    const query: any = {};
    if (orderStatus) {
      query.orderStatus = orderStatus;
    }
    query.paid = status;
    const request = await Order.findOneAndUpdate({ _id: orderId }, query, {
      new: true,
    });
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

export const getAllProcessedOrdersCount = async () => {
  try {
    const request = await Order.countDocuments({ orderStatus: "Processing" });
    return { status: "success", request: request };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};

export const getTotalRevenue = async () => {
  // return revenue of each month by calculating total price of each order in that month using createdAt field for specific current year
  const currentYear = new Date().getFullYear();
  try {
    const request = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
          orderStatus: "Shipped",
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
    return { status: "success", request: request };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};

export const getBestProductsSold = async () => {
  try {
    const request = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $group: {
          _id: "$products.product_name",
          total: { $sum: "$products.quantity" },
        },
      },
      {
        $sort: { total: -1 },
      },
      {
        $limit: 5,
      },
    ]);
    return { status: "success", request: request };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};
