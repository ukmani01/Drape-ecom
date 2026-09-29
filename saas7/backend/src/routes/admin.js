import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { getDashboardStats, getRecentOrders, getSalesOverview } from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/recent-orders', getRecentOrders);
router.get('/sales-overview', getSalesOverview);

export default router;
