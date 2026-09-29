import jwt from 'jsonwebtoken';
import { User, Store } from '../models/index.js';

// =============================================================
// PROTECT MIDDLEWARE - Full Authentication
// =============================================================
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (jwtError) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  try {
    const user = await User.findById(decoded.id).select('-password -resetToken -resetExpiry');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended' });
    }

    req.user = user;
    req.storeId = user.storeId;

    if (user.role !== 'super_admin' && user.storeId) {
      let store = req.store && req.store._id.toString() === user.storeId.toString()
        ? req.store
        : await Store.findById(user.storeId);

      if (!store) {
        return res.status(403).json({ success: false, message: 'Your store no longer exists.' });
      }
      const blockedStatuses = ['suspended', 'expired', 'deleted', 'inactive', 'blocked'];
      if (blockedStatuses.includes(store.status)) {
        return res.status(403).json({ success: false, message: `Your store is ${store.status}.` });
      }
      req.store = store;
    }

    if (!req.storeId && user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Store not found for this user.' });
    }

    next();
  } catch (dbError) {
    console.error('❌ Database error in protect middleware:', dbError);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// =============================================================
// ADMIN MIDDLEWARE
// =============================================================
export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'owner' || req.user.role === 'super_admin')) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

// =============================================================
// OWNER MIDDLEWARE (Super Admin Only)
// =============================================================
export const owner = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Super Admin access required' });
};

// =============================================================
// STAFF MIDDLEWARE
// =============================================================
export const staff = (req, res, next) => {
  if (req.user && ['admin', 'staff', 'owner', 'super_admin'].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Staff access required' });
};

// =============================================================
// CHECK STORE ACCESS
// =============================================================
export const checkStoreAccess = async (req, res, next) => {
  const storeId = req.params.storeId || req.params.id || req.body.storeId || req.query.storeId;
  if (storeId && req.user?.role !== 'super_admin') {
    if (!req.user?.storeId || req.user.storeId.toString() !== storeId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this store' });
    }
  }
  next();
};

// =============================================================
// ✅ FIXED: OPTIONAL AUTH - NO OVERWRITE of req.storeId
// 
// 🔥 CRITICAL FIX: This middleware was overwriting req.storeId
//    with user.storeId, which was breaking tenant isolation.
//    Now it ONLY sets req.user and does NOT touch req.storeId.
// =============================================================
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        // ✅ IMPORTANT: DO NOT overwrite req.storeId
        // req.storeId was already set by resolveStoreFromSlug middleware
        // If we set it here, it breaks tenant isolation
        // req.storeId = user.storeId; // <-- THIS WAS THE BUG!
      }
    }
  } catch (err) {
    // ignore - optional auth should not fail the request
  }
  next();
};

// =============================================================
// ✅ STORE ACCESS VALIDATION - Prevent Cross-Store Data Leakage
// 
// This middleware compares:
//   1. req.storeId (from the URL/query - set by resolveStoreFromSlug)
//   2. req.user.storeId (from the JWT token)
// 
// If they don't match → 403 Forbidden (Cross-Store Access Blocked)
// =============================================================
export const validateStoreAccess = async (req, res, next) => {
  try {
    // 1. Super Admin - Skip validation (can access all stores)
    if (req.user && req.user.role === 'super_admin') {
      console.log('🔐 Super Admin - Allowing access');
      return next();
    }

    // 2. Get storeId from request (set by resolveStoreFromSlug)
    const storeId = req.storeId || req.params.storeId || req.query.storeId || req.body.storeId;
    
    // 3. If no storeId → Skip (Guest cart creation, no store context)
    if (!storeId) {
      console.warn('⚠️ No storeId in request, skipping validation');
      return next();
    }

    // 4. Guest user (no login) → Skip (Guest checkout allowed)
    if (!req.user) {
      console.warn('⚠️ No user (guest), skipping validation');
      return next();
    }

    // 5. User has no store association → Error
    const userStoreId = req.user.storeId;
    if (!userStoreId) {
      console.error('❌ User has no store association:', req.user.email);
      return res.status(403).json({
        success: false,
        message: 'User has no store association. Please contact support.'
      });
    }

    // 6. ✅ CRITICAL CHECK: User's store vs Requested store
    if (userStoreId.toString() !== storeId.toString()) {
      console.warn(`⚠️ CROSS-STORE BLOCKED: ${req.user.email} (${userStoreId}) tried to access ${storeId}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied to this store. You do not have permission.'
      });
    }

    console.log(`✅ Store validation passed for: ${req.user.email}`);
    next();
  } catch (err) {
    console.error('❌ validateStoreAccess error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during store validation'
    });
  }
};