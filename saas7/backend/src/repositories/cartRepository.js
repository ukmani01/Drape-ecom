// backend/src/repositories/cartRepository.js
import Cart from '../models/Cart.js';

export const getCart = async (storeId, customerId) => {
  return Cart.findOne({ storeId, customerId }).populate('items.productId');
};

export const getCartBySession = async (storeId, sessionId) => {
  return Cart.findOne({ storeId, sessionId }).populate('items.productId');
};

export const createCart = async (data) => {
  const cart = new Cart(data);
  await cart.save();
  return cart;
};

export const updateCart = async (storeId, customerId, items) => {
  return Cart.findOneAndUpdate(
    { storeId, customerId },
    { items },
    { new: true, upsert: true }
  ).populate('items.productId');
};

export const clearCart = async (storeId, customerId) => {
  const cart = await Cart.findOne({ storeId, customerId });
  if (cart) {
    cart.items = [];
    await cart.save();
    return cart;
  }
  return null;
};

export const deleteCart = async (storeId, customerId) => {
  return Cart.findOneAndDelete({ storeId, customerId });
};

export const findOrCreateCart = async (storeId, customerId, sessionId = null) => {
  let cart = await Cart.findOne({ storeId, customerId });
  if (!cart) {
    cart = new Cart({
      storeId,
      customerId,
      sessionId,
      items: [],
    });
    await cart.save();
  }
  return cart;
};

export default {
  getCart,
  getCartBySession,
  createCart,
  updateCart,
  clearCart,
  deleteCart,
  findOrCreateCart,
};