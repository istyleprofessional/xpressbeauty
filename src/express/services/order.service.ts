import Order from "../schemas/order.schema";

export const createOrder = async (data: any) => {
  try {
    const request = await Order.create({
      shippingAddress: data.shipping_address,
      shippingName: data.shipping_name,
      browserId: data.browserId,
      totalQuantity: data.totalQuantity,
      orderId: data.order_id,
      paymentStatus: data.order_status,
      totalPrice: data.order_amount,
      products: data.products,
      userId: data.userId,
    });
    return request;
  } catch (error: any) {
    return { err: error.message };
  }
};
