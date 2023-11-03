import Order from "../schemas/order.schema";

export const createOrder = async (data: any) => {
  try {
    const request = await Order.create({
      shippingAddress: data.shipping_address,
      shippingName: data.shipping_name,
      totalQuantity: data.totalQuantity,
      paymentStatus: data.payment_status,
      paymentMethod: data.paymentMethod,
      orderStatus: data.order_status,
      paymentId: data.payment_id,
      totalPrice: data.order_amount,
      products: data.products,
      userId: data.userId,
      order_number: data.order_number,
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
        $project: {
          _id: 1,
          "user.email": 1,
          "user.firstName": 1,
          "user.lastName": 1,
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
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalPrice" },
        },
      },
    ]);
    return { status: "success", request: request };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};
