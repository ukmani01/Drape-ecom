// =============================================================
// 🔥 FIX: GUEST BLOCKED - optionalAuth → protect
// =============================================================

import express from 'express';
import { resolveStoreFromSlug } from '../middleware/public.js';
import { protect, validateStoreAccess } from '../middleware/auth.js';
import * as cartController from '../controllers/cartController.js';
import * as orderController from '../controllers/orderController.js';
import { listOrders, getOrder } from '../controllers/publicOrderController.js';
import Cart from '../models/Cart.js';

const router = express.Router();

console.log('🛣️ Initializing Public Routes...');

// =============================================================
// ✅ CART ROUTES – Guest Blocked (protect) + Cross-Store Blocked (validateStoreAccess)
// =============================================================
router.post('/cart', resolveStoreFromSlug, protect, validateStoreAccess, cartController.addToCart);
router.put('/cart', resolveStoreFromSlug, protect, validateStoreAccess, cartController.updateCartItem);
router.delete('/cart/:productId', resolveStoreFromSlug, protect, validateStoreAccess, cartController.removeFromCart);
router.get('/cart', resolveStoreFromSlug, protect, validateStoreAccess, cartController.getCart);
router.delete('/cart', resolveStoreFromSlug, protect, validateStoreAccess, cartController.clearCart);

console.log('✅ Cart routes mounted (Guest Blocked)');

// =============================================================
// ✅ CART COUNT – Guest Blocked (protect)
// =============================================================
router.get('/cart/count', resolveStoreFromSlug, protect, validateStoreAccess, async (req, res) => {
  try {
    // req.user is guaranteed by protect middleware
    const customerId = req.user?._id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const cart = await Cart.findOne({ storeId: req.storeId, customerId });
    const count = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    res.json({ count });
  } catch (err) {
    console.error('❌ Cart count error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
console.log('✅ Cart count route mounted (Guest Blocked)');

// =============================================================
// ✅ ORDERS ROUTES – Guest Blocked (protect) + Cross-Store Blocked (validateStoreAccess)
// =============================================================
router.post('/orders', resolveStoreFromSlug, protect, validateStoreAccess, orderController.createOrder);
router.get('/orders', protect, resolveStoreFromSlug, validateStoreAccess, listOrders);
router.get('/orders/:orderId', resolveStoreFromSlug, protect, validateStoreAccess, getOrder);
console.log('✅ Order routes mounted (Guest Blocked)');

export default router;