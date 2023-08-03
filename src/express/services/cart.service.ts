import Cart from "../schemas/cart.schema";

export const updateUserCart = async (data: any) => {
  try {
    const cart = await Cart.findOne({ browserId: data.browserId });
    if (cart) {
      cart?.products?.push(data.product);
      const unique: any = {};
      cart?.products?.forEach((product: any) => {
        if (!unique[product?._id]) {
          unique[product?._id] = product;
        } else {
          if (product.cartVariations.length === 0) {
            unique[product?._id].cartQuantity += product.cartQuantity;
          } else {
            unique[product?._id].cartVariations = [
              ...unique[product?._id].cartVariations,
              ...product.cartVariations,
            ];
          }
        }
      });
      const finalUnique: any[] = Object.values(unique);
      // loop and check if cartVariations is not empty and if it is not empty then remove duplicates and increment the variation.quantity
      finalUnique.forEach((product: any) => {
        if ((product?.cartVariations?.length ?? 0) > 0) {
          const uniqueVariations: any = {};
          product?.cartVariations?.forEach((variation: any) => {
            if (
              !uniqueVariations[
                variation?.variation_id || variation?.variation_id
              ]
            ) {
              uniqueVariations[
                variation?.variation_id || variation?.variation_id
              ] = variation;
            } else {
              uniqueVariations[
                variation?.variation_id || variation?.variation_id
              ].quantity += variation.quantity;
            }
          });
          product.cartVariations = Object.values(uniqueVariations);
        }
      });
      cart.products = finalUnique;
      // console.log("cart", cart.products);
      const result = await Cart.findOneAndUpdate(
        { browserId: data.browserId },
        cart,
        { upsert: true, new: true }
      );
      // console.log("result", result);
      return result;
    } else {
      const newCart = new Cart({
        browserId: data.browserId,
        userId: data.userId,
        $push: { products: data.product },
      });
      const result = await newCart.save();
      console.log("result", result);
      return result;
    }
  } catch (err) {
    console.log("err", err);
    return { status: "failed", err: err };
  }
};

export const getCartByBrowserId = async (browserId: string) => {
  try {
    const result = await Cart.findOne({ browserId: browserId });
    return result;
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const deleteProductCart = async (product: any) => {
  try {
    if (product?.cartVariations?.length > 0) {
      const filter = {
        "products._id": product._id, // Search for the product with the given _id inside the products array
      };

      const update = {
        $set: {
          "products.$.cartVariations": product.cartVariations, // Update the description of the matched product
        },
      };
      const result = await Cart.updateOne(filter, update);
      return result;
    }
    const result = await Cart.findOneAndUpdate(
      { browserId: product.browserId },
      {
        $pull: {
          products: {
            _id: product._id,
          },
        },
      },
      { upsert: true, new: true }
    );
    if (result?.products?.length === 0) {
      await Cart.deleteOne({ browserId: product.browserId });
    }
    return result;
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const handleDecIncVariationProducts = async (data: any) => {
  try {
    if (data.isVariation) {
      const filter = {
        browserId: data.browserId,
        "products._id": data.productId, // Search for the product with the given _id inside the products array
      };
      const update = {
        $inc: {
          [`products.$.cartVariations.${data.variationIndex}.quantity`]:
            data.quantity, // Update the description of the matched product
        },
      };
      const result = await Cart.updateOne(filter, update);
      return result;
    } else {
      const filter = {
        browserId: data.browserId,
        "products._id": data.productId, // Search for the product with the given _id inside the products array
      };
      const update = {
        $inc: {
          "products.$.cartQuantity": data.quantity, // Update the description of the matched product
        },
      };
      const result = await Cart.updateOne(filter, update);
      return result;
    }
  } catch (err) {
    console.log("err", err);
    return { status: "failed", err: err };
  }
};
