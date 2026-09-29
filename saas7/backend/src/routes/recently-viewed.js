import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getRecentlyViewed,
  addRecentlyViewed,
  clearRecentlyViewed,
} from '../controllers/recentlyViewedController.js';

const router = express.Router();

router.use(protect);

router.get('/', getRecentlyViewed);
router.post('/', addRecentlyViewed);
router.delete('/', clearRecentlyViewed);

export default router;