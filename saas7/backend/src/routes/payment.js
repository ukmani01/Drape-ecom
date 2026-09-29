import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { createRazorpayOrder, verifyPayment, paymentWebhook, capturePaymentOrder } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/webhook', paymentWebhook);

router.use(protect);
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.post('/capture', admin, capturePaymentOrder);

export default router;
