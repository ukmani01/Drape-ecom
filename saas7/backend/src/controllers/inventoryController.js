import Product from '../models/Product.js';
import ActivityLog from '../models/ActivityLog.js';

export const getInventory = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { page = 1, limit = 20 } = req.query;
    const products = await Product.find({ storeId })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Product.countDocuments({ storeId });
    res.status(200).json({
      success: true,
      data: { docs: products, total, page, limit },
    });
  } catch (err) {
    next(err);
  }
};

export const updateInventory = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { stock } = req.body;
    const product = await Product.findOne({ _id: req.params.id, storeId });
    if (!product) throw new Error('Product not found');
    if (product.variants && product.variants.length > 0) {
      product.variants[0].stock = stock;
    } else {
      product.stock = stock;
    }
    await product.save();
    await ActivityLog.create({
      storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'INVENTORY_UPDATED',
      details: { productId: product._id, title: product.title, stock },
    });
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};