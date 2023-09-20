import Cart from "../schemas/cart.schema";

export const updateUserCart = async (data: any) => {
  try {
    const result = await Cart.findOne({ userId: data.userId });
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
      await result.save();
      return result;
    } else {
      const result = await Cart.create({
        userId: data.userId,
        products: data.products,
        totalQuantity: data.totalQuantity,
      });
      return result;
    }
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const getCartByUserId = async (userId: string) => {
  try {
    const result = await Cart.findOne({ userId: userId });
    return result;
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const deleteProductCart = async (product: any) => {
  try {
    const result = await Cart.findOneAndUpdate(
      { userId: product.userId },
      {
        $pull: { products: { id: product.id } },
        $inc: { totalQuantity: -product.quantity },
      },
      { new: true, upsert: true }
    );
    if (result.products.length === 0) {
      await Cart.deleteOne({ userId: product.userId });
    }
    return result;
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const deleteCart = async (userId: string) => {
  try {
    const request = await Cart.deleteOne({ userId: userId });
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
    };
    const result = await Cart.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    });
    return result;
  } catch (err) {
    return { status: "failed", err: err };
  }
};
