// backend/src/controllers/adminController.js
import Order from '../models/Order.js';
import Store from '../models/Store.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
export const getDashboardStats = async (req, res, next) => {
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

// @desc    Get recent orders
// @route   GET /api/admin/recent-orders
export const getRecentOrders = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const orders = await Order.find({ storeId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customerId', 'firstName lastName email');
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// @desc    Get sales overview (daily/weekly/monthly)
// @route   GET /api/admin/sales-overview
export const getSalesOverview = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;
    if (period === 'week') startDate = new Date(now.setDate(now.getDate() - 7));
    else if (period === 'month') startDate = new Date(now.setMonth(now.getMonth() - 1));
    else startDate = new Date(now.setDate(now.getDate() - 30)); // default 30 days

    const sales = await Order.aggregate([
      {
        $match: {
          storeId,
          orderStatus: 'Delivered',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json({ success: true, data: sales });
  } catch (err) {
    next(err);
  }
};