// backend/src/controllers/analyticsController.js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';

// @desc    Get general analytics
// @route   GET /api/analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const totalOrders = await Order.countDocuments({ storeId });
    const totalCustomers = await Customer.countDocuments({ storeId });
    const totalProducts = await Product.countDocuments({ storeId });
    const revenue = await Order.aggregate([
      { $match: { storeId, orderStatus: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalCustomers,
        totalProducts,
        revenue: revenue[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get sales report
// @route   GET /api/analytics/sales
export const getSalesReport = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { period = 'month' } = req.query;
    // similar to getSalesOverview, you can reuse or refine
    // For brevity, we return a stub
    res.status(200).json({
      success: true,
      data: { message: 'Sales report endpoint' },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get product analytics (top selling, etc.)
// @route   GET /api/analytics/products
export const getProductAnalytics = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const topProducts = await Product.find({ storeId })
      .sort({ totalSales: -1 })
      .limit(10)
      .select('title totalSales views');
    res.status(200).json({ success: true, data: topProducts });
  } catch (err) {
    next(err);
  }
};

// @desc    Get customer analytics
// @route   GET /api/analytics/customers
export const getCustomerAnalytics = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const total = await Customer.countDocuments({ storeId });
    const active = await Customer.countDocuments({ storeId, lastOrderDate: { $exists: true } });
    res.status(200).json({ success: true, data: { total, active } });
  } catch (err) {
    next(err);
  }
};