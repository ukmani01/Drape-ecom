import storeRepository from '../repositories/storeRepository.js';
import { ActivityLog, Store } from '../models/index.js';
import { getSubscriptionStatus } from '../services/subscriptionService.js';
import { encrypt } from '../services/paymentService.js'; // 🔥 NEW: Import encrypt

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

export const getStore = async (req, res, next) => {
  try {
    const store = await storeRepository.findById(req.params.id);
    if (!store) throw new Error('Store not found');
    const subscription = await getSubscriptionStatus(store._id);
    res.status(200).json({
      success: true,
      data: { ...store.toObject(), subscription },
    });
  } catch (err) {
    next(err);
  }
};

export const createStore = async (req, res, next) => {
  try {
    const storeData = { ...req.body, ownerId: req.user.id };
    const store = await storeRepository.create(storeData);
    await ActivityLog.create({
      storeId: store._id,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'STORE_CREATED',
      details: { storeName: store.name },
    });
    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: store,
    });
  } catch (err) {
    next(err);
  }
};

export const updateStore = async (req, res, next) => {
  try {
    const store = await storeRepository.findById(req.params.id);
    if (!store) throw new Error('Store not found');
    if (store.ownerId.toString() !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this store'
      });
    }
    const updatedStore = await storeRepository.update(req.params.id, req.body);
    await ActivityLog.create({
      storeId: store._id,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'STORE_UPDATED',
      details: { storeName: store.name },
    });
    res.status(200).json({
      success: true,
      message: 'Store updated successfully',
      data: updatedStore,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteStore = async (req, res, next) => {
  try {
    const store = await storeRepository.findById(req.params.id);
    if (!store) throw new Error('Store not found');
    if (store.ownerId.toString() !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this store'
      });
    }
    await storeRepository.delete(req.params.id);
    await ActivityLog.create({
      storeId: store._id,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'STORE_DELETED',
      details: { storeName: store.name },
    });
    res.status(200).json({
      success: true,
      message: 'Store deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const suspendStore = async (req, res, next) => {
  try {
    const store = await storeRepository.findById(req.params.id);
    if (!store) throw new Error('Store not found');
    if (store.ownerId.toString() !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to suspend this store'
      });
    }
    const suspendedStore = await storeRepository.updateStatus(req.params.id, 'suspended');
    await ActivityLog.create({
      storeId: store._id,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'STORE_SUSPENDED',
      details: { storeName: store.name },
    });
    res.status(200).json({
      success: true,
      message: 'Store suspended successfully',
      data: suspendedStore,
    });
  } catch (err) {
    next(err);
  }
};

export const activateStore = async (req, res, next) => {
  try {
    const store = await storeRepository.findById(req.params.id);
    if (!store) throw new Error('Store not found');
    if (store.ownerId.toString() !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to activate this store'
      });
    }
    const activatedStore = await storeRepository.updateStatus(req.params.id, 'active');
    await ActivityLog.create({
      storeId: store._id,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'STORE_ACTIVATED',
      details: { storeName: store.name },
    });
    res.status(200).json({
      success: true,
      message: 'Store activated successfully',
      data: activatedStore,
    });
  } catch (err) {
    next(err);
  }
};

export const getStoreStats = async (req, res, next) => {
  try {
    const store = await storeRepository.findById(req.params.id);
    if (!store) throw new Error('Store not found');
    if (store.ownerId.toString() !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view stats for this store'
      });
    }
    const subscription = await getSubscriptionStatus(store._id);
    res.status(200).json({
      success: true,
      data: {
        store,
        subscription,
      },
    });
  } catch (err) {
    next(err);
  }
};

// =============================================================
// 🔥 NEW: Store Owner Payment Gateway Setup (Encrypted Save)
// =============================================================
export const updatePaymentGateway = async (req, res, next) => {
  try {
    const storeId = req.user?.storeId;
    if (!storeId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { razorpayKeyId, razorpayKeySecret } = req.body;
    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay Key ID and Secret are required.',
      });
    }

    const store = await Store.findById(storeId);
    if (!store) throw new Error('Store not found');

    // ✅ AES-256-GCM-ஆக Encrypt பண்ணு (Hack-Proof)
    const encryptedKeyId = encrypt(razorpayKeyId);
    const encryptedSecret = encrypt(razorpayKeySecret);

    store.razorpayKeyId = encryptedKeyId;
    store.razorpayKeySecret = encryptedSecret;
    await store.save();

    await ActivityLog.create({
      storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PAYMENT_GATEWAY_UPDATED',
      details: { keyId: razorpayKeyId.slice(0, 10) + '****' }, // Log-ல Mask பண்ணு
    });

    res.status(200).json({
      success: true,
      message: 'Payment gateway configured successfully! Your customers can now pay directly to your account.',
    });
  } catch (err) {
    console.error('❌ Update Payment Gateway Error:', err);
    next(err);
  }
};