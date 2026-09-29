import express from 'express';
import { protect, admin, staff } from '../middleware/auth.js';
import {
  getCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  bulkDeleteCategories,
} from '../controllers/categoryController.js';

const router = express.Router();

// All routes require authentication (store isolation)
router.use(protect);

// Public (authenticated) routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategory);

// Admin/Staff only routes
router.use(staff);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.post('/bulk-delete', bulkDeleteCategories);

export default router;