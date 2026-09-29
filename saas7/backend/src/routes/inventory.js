import express from 'express';
import { protect } from '../middleware/auth.js';
import { getInventory, updateInventory } from '../controllers/inventoryController.js';

const router = express.Router();

router.use(protect);

router.get('/', getInventory);
router.put('/:id', updateInventory);

export default router;   // ✅ THIS LINE IS CRITICAL