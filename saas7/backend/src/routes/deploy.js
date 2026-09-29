
import express from 'express';
import { protect } from '../middleware/auth.js';
import { deployStore, getDeployStatus } from '../controllers/deployController.js';

const router = express.Router();

router.use(protect);

router.post('/:id/deploy', deployStore);
router.get('/:id/deploy/status', getDeployStatus);

export default router;
