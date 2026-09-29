import Store from '../models/Store.js';
import Subscription from '../models/Subscription.js';

// =============================================================
// 🔥 Storage Guard - Checks upload size against plan limit
// =============================================================
export const storageGuard = async (req, res, next) => {
  try {
    const storeId = req.user?.storeId;
    if (!storeId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Only check if file exists in request
    if (!req.file) {
      // No file to upload, skip
      return next();
    }

    // Fetch store and subscription
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const subscription = await Subscription.findOne({ storeId, status: 'active' }).populate('planId');
    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'No active subscription found. Please subscribe to upload files.'
      });
    }

    const plan = subscription.planId;
    const maxStorageMB = plan.features?.maxStorage || 0;
    if (maxStorageMB === -1) {
      // Unlimited
      return next();
    }

    const maxStorageBytes = maxStorageMB * 1024 * 1024; // Convert MB to bytes
    const currentUsedBytes = store.usedStorage || 0;
    const fileSizeBytes = req.file.size;

    if (currentUsedBytes + fileSizeBytes > maxStorageBytes) {
      return res.status(413).json({
        success: false,
        message: `Storage limit exceeded. You have used ${(currentUsedBytes / (1024 * 1024)).toFixed(2)} MB out of ${maxStorageMB} MB. Please upgrade or free up space.`
      });
    }

    // Store file size temporarily for later update (in controller after upload)
    req.fileSizeToAdd = fileSizeBytes;

    next();
  } catch (err) {
    console.error('❌ storageGuard error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// =============================================================
// 🔥 Helper to update usedStorage after successful upload
// =============================================================
export const updateStorageUsage = async (storeId, fileSizeBytes) => {
  if (!storeId || !fileSizeBytes) return;
  await Store.findByIdAndUpdate(storeId, { $inc: { usedStorage: fileSizeBytes } });
};

export const decreaseStorageUsage = async (storeId, fileSizeBytes) => {
  if (!storeId || !fileSizeBytes) return;
  await Store.findByIdAndUpdate(storeId, { $inc: { usedStorage: -fileSizeBytes } });
};