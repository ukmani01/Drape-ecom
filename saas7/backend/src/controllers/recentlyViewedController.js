import RecentlyViewed from '../models/RecentlyViewed.js';
import Product from '../models/Product.js';

export const getRecentlyViewed = async (req, res, next) => {
  try {
    const storeId = req.storeId || req.user?.storeId;
    if (!storeId) {
      return res.status(200).json({ success: true, data: [] });
    }

    let recentlyViewed = await RecentlyViewed.findOne({ storeId })
      .populate({
        path: 'items.productId',
        select: 'title images slug variants price',
      });

    if (!recentlyViewed) {
      recentlyViewed = await RecentlyViewed.create({ storeId, items: [] });
    }

    const products = recentlyViewed.items
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .map(item => item.productId)
      .filter(Boolean);

    res.status(200).json({ success: true, data: products });
  } catch (err) {
    console.error('getRecentlyViewed error:', err);
    next(err);
  }
};

export const addRecentlyViewed = async (req, res, next) => {
  try {
    console.log('🔍 === addRecentlyViewed DEBUG ===');
    console.log('🔍 req.storeId:', req.storeId);
    console.log('🔍 req.user?.storeId:', req.user?.storeId);
    console.log('🔍 req.user?.email:', req.user?.email);
    console.log('🔍 req.body:', req.body);

    const storeId = req.storeId || req.user?.storeId;
    if (!storeId) {
      console.error('❌ storeId is missing!');
      return res.status(400).json({ success: false, message: 'Store ID required' });
    }

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    const product = await Product.findOne({ _id: productId, storeId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let recentlyViewed = await RecentlyViewed.findOne({ storeId });
    if (!recentlyViewed) {
      recentlyViewed = new RecentlyViewed({ storeId, items: [] });
    }

    // Remove if already exists
    recentlyViewed.items = recentlyViewed.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // Add to front
    recentlyViewed.items.unshift({ productId, viewedAt: new Date() });

    // Keep only last 20
    if (recentlyViewed.items.length > 20) {
      recentlyViewed.items = recentlyViewed.items.slice(0, 20);
    }

    await recentlyViewed.save();

    res.status(200).json({
      success: true,
      message: 'Added to recently viewed',
    });
  } catch (err) {
    console.error('❌ addRecentlyViewed error:', err);
    next(err);
  }
};

export const clearRecentlyViewed = async (req, res, next) => {
  try {
    const storeId = req.storeId || req.user?.storeId;
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Store ID required' });
    }

    await RecentlyViewed.findOneAndDelete({ storeId });

    res.status(200).json({
      success: true,
      message: 'Recently viewed cleared',
    });
  } catch (err) {
    console.error('clearRecentlyViewed error:', err);
    next(err);
  }
};