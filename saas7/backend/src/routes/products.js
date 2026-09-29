import express from 'express';
import { protect, admin, staff } from '../middleware/auth.js';
import { featureGuard } from '../middleware/featureGuard.js'; // 🔥 NEW
import { 
  listProducts, 
  getProduct, 
  getProductBySlug,
  createProduct, 
  updateProduct, 
  deleteProduct, 
  bulkDeleteProducts, 
  updateStock, 
  getFeaturedProducts, 
  getBestSellers, 
  getNewArrivals 
} from '../controllers/productController.js';

const router = express.Router();

// Public routes (with optional auth for store isolation)
router.get('/', protect, listProducts);
router.get('/featured', protect, getFeaturedProducts);
router.get('/bestsellers', protect, getBestSellers);
router.get('/newarrivals', protect, getNewArrivals);

// Get product by slug (MUST be BEFORE /:id)
router.get('/slug/:slug', protect, getProductBySlug);

// Get product by ID
router.get('/:id', protect, getProduct);

// Admin/Staff routes
router.use(protect, staff);

// 🔥 NEW: Protect create product with maxProducts limit
router.post('/', featureGuard('maxProducts'), createProduct);

router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/bulk-delete', bulkDeleteProducts);
router.patch('/:id/stock', updateStock);

export default router;