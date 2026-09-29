// backend/src/controllers/wishlistController.js
import Wishlist from '../models/Wishlist.js';

// @desc    Get wishlist
// @route   GET /api/wishlist
export const getWishlist = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const customerId = req.user._id; // assuming customer is logged in
    let wishlist = await Wishlist.findOne({ storeId, customerId }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ storeId, customerId, products: [] });
    }
    res.status(200).json({ success: true, data: wishlist });
  } catch (err) {
    next(err);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
export const addToWishlist = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const customerId = req.user._id;
    const { productId } = req.body;
    if (!productId) throw new Error('Product ID required');

    let wishlist = await Wishlist.findOne({ storeId, customerId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ storeId, customerId, products: [] });
    }
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }
    await wishlist.populate('products');
    res.status(200).json({ success: true, data: wishlist });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove/:productId
export const removeFromWishlist = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const customerId = req.user._id;
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ storeId, customerId });
    if (!wishlist) throw new Error('Wishlist not found');
    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();
    await wishlist.populate('products');
    res.status(200).json({ success: true, data: wishlist });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist/clear
export const clearWishlist = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const customerId = req.user._id;
    const wishlist = await Wishlist.findOne({ storeId, customerId });
    if (wishlist) {
      wishlist.products = [];
      await wishlist.save();
    }
    res.status(200).json({ success: true, message: 'Wishlist cleared' });
  } catch (err) {
    next(err);
  }
};