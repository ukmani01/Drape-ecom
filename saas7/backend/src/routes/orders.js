import express from 'express';
import { protect, admin, staff } from '../middleware/auth.js';
import { listOrders, getOrder, createOrder, updateOrderStatus, getOrderByOrderId, getOrderTimeline, getOrderStats } from '../controllers/orderController.js';
import { validate } from '../middleware/validate.js';
import { orderSchema } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', listOrders);
router.get('/stats', admin, getOrderStats);
router.get('/:id', getOrder);
router.get('/by-order-id/:orderId', getOrderByOrderId);
router.get('/:id/timeline', getOrderTimeline);

router.post('/', createOrder);
router.put('/:id/status', staff, updateOrderStatus);

export default router;
