import express from 'express';
import { protect } from '../middleware/auth.js';
import { getSubscriptionStatus, getPlans, upgradePlan, cancelSubscription } from '../controllers/subscriptionController.js';

const router = express.Router();

router.use(protect);

router.get('/status', getSubscriptionStatus);
router.get('/plans', getPlans);
router.post('/upgrade', upgradePlan);
router.post('/cancel', cancelSubscription);

export default router;