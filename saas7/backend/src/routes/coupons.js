import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,   // ✅ Import added
} from '../controllers/couponController.js';

const router = express.Router();

router.use(protect);

router.get('/', getCoupons);
router.get('/:id', getCoupon);
router.post('/', createCoupon);
router.post('/validate', validateCoupon);   // ✅ Route added
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;