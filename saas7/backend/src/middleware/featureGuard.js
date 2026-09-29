import NodeCache from 'node-cache';
import Subscription from '../models/Subscription.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';

// 🔥 CACHE: 5 minutes TTL (Time To Live)
const featureCache = new NodeCache({ stdTTL: 300 });

// =============================================================
// 🔥 Helper: Get Plan with Cache + Trial Support + Auto-Create
// =============================================================
const getPlanWithCache = async (storeId) => {
  const cacheKey = `plan_${storeId}`;
  
  // 1. Check Cache
  let cached = featureCache.get(cacheKey);
  if (cached) {
    return cached; // ✅ Plain Object from Cache
  }

  try {
    // 2. Query Database
    let subscription = await Subscription.findOne({
      storeId,
      status: { $in: ['active', 'trial'] }
    }).populate('planId');

    // 3. Auto-Create Free Plan if no subscription
    if (!subscription) {
      const freePlan = await Plan.findOne({ code: 'free' });
      if (!freePlan) {
        console.error('❌ Free plan not found in database. Please run seeder.');
        return null;
      }

      subscription = new Subscription({
        storeId,
        planId: freePlan._id,
        status: 'trial',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        autoRenew: false,
      });
      await subscription.save();
      console.log(`✅ Auto-created FREE trial subscription for store ${storeId}`);
    }

    // 4. Get Plan and Convert to Plain Object
    const planDoc = subscription?.planId;
    if (!planDoc) return null;

    // ✅ Convert to plain object before caching (avoids Mongoose document issues)
    const plan = planDoc.toObject ? planDoc.toObject() : planDoc;
    
    // ✅ Store plain object in cache (5 minutes)
    featureCache.set(cacheKey, plan);
    return plan;

  } catch (err) {
    console.error('❌ getPlanWithCache error:', err.message);
    console.error(err.stack);
    return null;
  }
};

// =============================================================
// 🔥 Helper: Clear Cache (for Super Admin)
// =============================================================
export const clearFeatureCache = (storeId) => {
  if (storeId) {
    featureCache.del(`plan_${storeId}`);
  } else {
    featureCache.flushAll();
  }
  console.log(`✅ Cache cleared for store: ${storeId || 'ALL'}`);
};

// =============================================================
// 🔥 Generic Feature Guard Middleware
// =============================================================
export const featureGuard = (featureKey) => {
  return async (req, res, next) => {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Store not found.' });
      }

      // 🔥 Fetch plan (with cache + auto-create)
      const plan = await getPlanWithCache(storeId);
      if (!plan) {
        return res.status(403).json({
          success: false,
          message: 'No subscription found. Please contact support.'
        });
      }

      // =============================================================
      // Boolean Features (analytics, bulkImport, etc.)
      // =============================================================
      if (typeof plan.features[featureKey] === 'boolean') {
        if (plan.features[featureKey] === false) {
          return res.status(403).json({
            success: false,
            message: `"${featureKey}" is not available in your current plan. Please upgrade.`
          });
        }
        return next();
      }

      // =============================================================
      // Numeric Limits (maxProducts, maxStaff, etc.)
      // =============================================================
      if (featureKey === 'maxProducts') {
        const limit = plan.features.maxProducts;
        if (limit === -1) return next();

        const count = await Product.countDocuments({ storeId });
        if (count >= limit) {
          return res.status(403).json({
            success: false,
            message: `Product limit reached (${limit}). Please upgrade your plan to add more products.`
          });
        }
        return next();
      }

      if (featureKey === 'maxStaff') {
        const limit = plan.features.maxStaff;
        if (limit === -1) return next();

        const count = await User.countDocuments({ storeId, role: { $in: ['staff', 'admin'] } });
        if (count >= limit) {
          return res.status(403).json({
            success: false,
            message: `Staff limit reached (${limit}). Please upgrade to add more staff.`
          });
        }
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Feature "${featureKey}" not recognized.`
      });

    } catch (err) {
      // ✅ Fixed: Log only message and stack, not the full error object
      console.error('❌ featureGuard error:', err.message);
      console.error(err.stack);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  };
};

// =============================================================
// 🔥 Theme Guard (With Cache + Trial Support)
// =============================================================
export const themeGuard = async (req, res, next) => {
  try {
    const storeId = req.user?.storeId;
    if (!storeId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { themeId } = req.body;
    if (!themeId) {
      return res.status(400).json({ success: false, message: 'Theme ID required.' });
    }

    // 🔥 Use cached plan (plain object)
    const plan = await getPlanWithCache(storeId);
    if (!plan) {
      return res.status(403).json({
        success: false,
        message: 'No subscription found. Please contact support.'
      });
    }

    const allowedThemes = plan.features?.themeAccess || [];
    if (!allowedThemes.includes(parseInt(themeId))) {
      return res.status(403).json({
        success: false,
        message: `Theme ID ${themeId} is not included in your current plan. Allowed themes: ${allowedThemes.join(', ')}`
      });
    }

    next();
  } catch (err) {
    console.error('❌ themeGuard error:', err.message);
    console.error(err.stack);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};