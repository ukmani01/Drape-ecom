import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';

export const getSalesReport = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;
    if (period === 'week') startDate = new Date(now.setDate(now.getDate() - 7));
    else if (period === 'month') startDate = new Date(now.setMonth(now.getMonth() - 1));
    else startDate = new Date(now.setDate(now.getDate() - 30));

    const revenue = await Order.aggregate([
      { $match: { storeId, orderStatus: 'Delivered', createdAt: { $gte: startDate } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 } } },
    ]);
    const result = revenue[0] || { totalRevenue: 0, totalOrders: 0 };
    res.status(200).json({
      success: true,
      data: {
        totalRevenue: result.totalRevenue || 0,
        totalOrders: result.totalOrders || 0,
        averageOrderValue: result.totalOrders > 0 ? result.totalRevenue / result.totalOrders : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomerReport = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const topCustomers = await Customer.find({ storeId })
      .sort({ lifetimeValue: -1 })
      .limit(10);
    res.status(200).json({ success: true, data: topCustomers });
  } catch (err) {
    next(err);
  }
};

export const getProductReport = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const topProducts = await Product.find({ storeId })
      .sort({ totalSales: -1 })
      .limit(10);
    res.status(200).json({ success: true, data: topProducts });
  } catch (err) {
    next(err);
  }
};