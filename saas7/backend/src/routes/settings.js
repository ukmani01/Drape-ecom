import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { getStoreSettings, updateStoreSettings, updateBrandSettings, updateHeroSettings, updateFooterSettings, updateSEOSettings, updateShopSettings, createBanner, deleteBanner, updateBannerData, createNavItem, deleteNavItem } from '../controllers/settingsController.js';

const router = express.Router();

router.get('/public', async (req, res, next) => {
  try {
    const { storeId } = req.query;
    if (!storeId) throw new Error('Store ID required');
    const settings = await getSettings(storeId);
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
});

router.use(protect, admin);

router.get('/', getStoreSettings);
router.put('/', updateStoreSettings);
router.put('/brand', updateBrandSettings);
router.put('/hero', updateHeroSettings);
router.put('/footer', updateFooterSettings);
router.put('/seo', updateSEOSettings);
router.put('/shop', updateShopSettings);
router.post('/banners', createBanner);
router.delete('/banners/:index', deleteBanner);
router.put('/banners/:index', updateBannerData);
router.post('/nav', createNavItem);
router.delete('/nav/:index', deleteNavItem);

export default router;
