import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { featureGuard } from '../middleware/featureGuard.js'; // 🔥 NEW
import { getAnalytics, getSalesReport, getProductAnalytics, getCustomerAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

// All analytics routes require authentication and admin role
router.use(protect, admin);

// 🔥 NEW: Protect all analytics endpoints with featureGuard
router.get('/', featureGuard('analytics'), getAnalytics);
router.get('/sales', featureGuard('analytics'), getSalesReport);
router.get('/products', featureGuard('analytics'), getProductAnalytics);
router.get('/customers', featureGuard('analytics'), getCustomerAnalytics);

export default router;