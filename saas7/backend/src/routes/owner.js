import express from 'express';
import { protect, owner } from '../middleware/auth.js';
import { listStores, getStoreDetails, suspendStore, activateStore, deleteStore, resetAdminPassword, getOwnerDashboard, getStoreAnalytics } from '../controllers/ownerController.js';

const router = express.Router();

router.use(protect, owner);

router.get('/dashboard', getOwnerDashboard);
router.get('/stores', listStores);
router.get('/stores/:id', getStoreDetails);
router.get('/stores/:id/analytics', getStoreAnalytics);
router.post('/stores/:id/suspend', suspendStore);
router.post('/stores/:id/activate', activateStore);
router.delete('/stores/:id', deleteStore);
router.post('/stores/:id/reset-password', resetAdminPassword);

export default router;
