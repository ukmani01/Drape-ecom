import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { themeGuard } from '../middleware/featureGuard.js'; // 🔥 NEW (themeGuard is exported from featureGuard)
import { getThemes, getTheme, applyThemeToStore } from '../controllers/themeController.js';

const router = express.Router();

router.get('/', getThemes);
router.get('/:id', getTheme);

router.use(protect, admin);

// 🔥 NEW: Protect apply theme with themeGuard
router.post('/apply', themeGuard, applyThemeToStore);

export default router;