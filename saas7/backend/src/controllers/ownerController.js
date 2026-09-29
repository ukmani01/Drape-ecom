import storeRepository from '../repositories/storeRepository.js';
import userRepository from '../repositories/userRepository.js';
// ✅ FIX: Order, Customer, Product - Missing Imports-ஐ சேர்க்கப்பட்டுள்ளது
import { ActivityLog, User, Order, Customer, Product } from '../models/index.js';
import { generateResetToken } from '../services/authService.js';
import { getSubscriptionStatus } from '../services/subscriptionService.js';

export const listStores = async (req, res, next) => {
  try {
    const { page, limit, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const result = await storeRepository.find(filter, { page, limit });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getStoreDetails = async (req, res, next) => {
  try {
    const store = await storeRepository.findById(req.params.id);
    if (!store) throw new Error('Store not found');
    const subscription = await getSubscriptionStatus(store._id);
    const admin = await User.findOne({ storeId: store._id, role: 'admin' }).select('-password');
    res.status(200).json({
      success: true,
      data: {
        store,
        subscription,
        admin,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const suspendStore = async (req, res, next) => {
  try {
    const store = await storeRepository.updateStatus(req.params.id, 'suspended');
    if (!store) throw new Error('Store not found');
    await ActivityLog.create({
      storeId: store._id,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'OWNER_STORE_SUSPENDED',
      details: { storeName: store.name },
    });
    res.status(200).json({
      success: true,
      message: 'Store suspended successfully',
      data: store,
    });
  } catch (err) {
    next(err);
  }
};

export const activateStore = async (req, res, next) => {
  try {
    const store = await storeRepository.updateStatus(req.params.id, 'active');
    if (!store) throw new Error('Store not found');
    await ActivityLog.create({
      storeId: store._id,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'OWNER_STORE_ACTIVATED',
      details: { storeName: store.name },
    });
    res.status(200).json({
      success: true,
      message: 'Store activated successfully',
      data: store,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteStore = async (req, res, next) => {
  try {
    const store = await storeRepository.delete(req.params.id);
    if (!store) throw new Error('Store not found');
    await ActivityLog.create({
      storeId: store._id,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'OWNER_STORE_DELETED',
      details: { storeName: store.name },
    });
    res.status(200).json({
      success: true,
      message: 'Store deleted permanently',
    });
  } catch (err) {
    next(err);
  }
};

export const resetAdminPassword = async (req, res, next) => {
  try {
    const store = await storeRepository.findById(req.params.id);
    if (!store) throw new Error('Store not found');
    const admin = await User.findOne({ storeId: store._id, role: 'admin' });
    if (!admin) throw new Error('Admin user not found for this store');
    await generateResetToken(admin.email);
    await ActivityLog.create({
      storeId: store._id,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'OWNER_ADMIN_PASSWORD_RESET',
      details: { storeName: store.name, adminEmail: admin.email },
    });
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to admin email',
    });
  } catch (err) {
    next(err);
  }
};

export const getOwnerDashboard = async (req, res, next) => {
  try {
    const totalStores = await storeRepository.count();
    const activeStores = await storeRepository.count({ status: 'active' });
    const suspendedStores = await storeRepository.count({ status: 'suspended' });
    const expiredStores = await storeRepository.count({ status: 'expired' });
    const trialStores = await storeRepository.count({ status: 'trial' });

    const recentStores = await storeRepository.find({}, { limit: 5, sort: { createdAt: -1 } });
    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStores,
        activeStores,
        suspendedStores,
        expiredStores,
        trialStores,
        recentStores,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getStoreAnalytics = async (req, res, next) => {
  try {
    const storeId = req.params.id;
    const store = await storeRepository.findById(storeId);
    if (!store) throw new Error('Store not found');

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
        storeName: store.name,
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