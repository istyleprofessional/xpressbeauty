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

export const getOrdersService = async () => {
  try {
    const request = await Order.find({});
    return { status: "success", request: request };
  } catch (error: any) {
    return { status: "failed", err: error.message };
  }
};
