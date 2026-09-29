import express from 'express';
import { protect, owner, checkStoreAccess } from '../middleware/auth.js';
import { listStores, getStore, createStore, updateStore, deleteStore, suspendStore, activateStore, getStoreStats,updatePaymentGateway } from '../controllers/storeController.js';

const router = express.Router();

router.use(protect);

// Owner routes
router.get('/all', owner, listStores);
router.post('/', owner, createStore);
router.delete('/:id', owner, deleteStore);
router.post('/:id/suspend', owner, suspendStore);
router.post('/:id/activate', owner, activateStore);
router.get('/:id/stats', owner, getStoreStats);
router.post('/payment-gateway', protect, updatePaymentGateway);

// Admin routes (store isolation)
router.get('/:id', checkStoreAccess, getStore);
router.put('/:id', checkStoreAccess, updateStore);

export default router;
