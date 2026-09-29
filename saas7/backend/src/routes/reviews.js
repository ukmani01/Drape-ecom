import express from 'express';
import { protect } from '../middleware/auth.js';
import { getReviews, approveReview, rejectReview } from '../controllers/reviewController.js';

const router = express.Router();

router.use(protect);

router.get('/', getReviews);
router.patch('/:id/approve', approveReview);
router.patch('/:id/reject', rejectReview);

export default router;