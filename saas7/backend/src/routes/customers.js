import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, getCustomerOrders, searchCustomers, getTopCustomers } from '../controllers/customerController.js';

const router = express.Router();

router.use(protect, admin);

router.get('/', listCustomers);
router.get('/search', searchCustomers);
router.get('/top', getTopCustomers);
router.get('/:id', getCustomer);
router.get('/:id/orders', getCustomerOrders);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
