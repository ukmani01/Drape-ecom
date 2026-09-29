import express from 'express';
import { protect } from '../middleware/auth.js';
import { getSalesReport, getCustomerReport, getProductReport } from '../controllers/reportController.js';

const router = express.Router();

router.use(protect);

router.get('/sales', getSalesReport);
router.get('/customers', getCustomerReport);
router.get('/products', getProductReport);

export default router;