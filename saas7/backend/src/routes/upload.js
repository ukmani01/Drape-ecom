import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { storageGuard, updateStorageUsage } from '../middleware/storageGuard.js'; // 🔥 NEW
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';
import { 
  uploadSingleImage, 
  uploadMultipleImages, 
  deleteSingleImage, 
  replaceImage, 
  uploadProductImage, 
  uploadHeroImage, 
  uploadLogo 
} from '../controllers/uploadController.js';

const router = express.Router();

router.use(protect,admin);

// =============================================================
// 🔥 NEW: Wrap upload handlers to update storage usage after success
// =============================================================
const withStorageUpdate = (handler) => {
  return async (req, res, next) => {
    try {
      // Store the original send function
      const originalSend = res.send;
      res.send = function (data) {
        // If upload succeeded and we have file size, update storage
        if (req.fileSizeToAdd && res.statusCode === 200) {
          const storeId = req.user?.storeId;
          if (storeId) {
            updateStorageUsage(storeId, req.fileSizeToAdd).catch(console.error);
          }
        }
        originalSend.call(this, data);
      };
      await handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

router.post('/single', uploadSingle, storageGuard, withStorageUpdate(uploadSingleImage));
router.post('/multiple', uploadMultiple, storageGuard, withStorageUpdate(uploadMultipleImages));
router.post('/replace', uploadSingle, storageGuard, withStorageUpdate(replaceImage));
router.post('/product', uploadSingle, storageGuard, withStorageUpdate(uploadProductImage));
router.post('/hero', uploadSingle, storageGuard, withStorageUpdate(uploadHeroImage));
router.post('/logo', uploadSingle, storageGuard, withStorageUpdate(uploadLogo));

router.delete('/delete', deleteSingleImage);

export default router;