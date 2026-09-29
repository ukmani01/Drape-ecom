import express from 'express';
import { protect } from '../middleware/auth.js';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, mergeGuestCart } from '../controllers/cartController.js';

const router = express.Router();

router.use(protect);
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item', updateCartItem);
router.delete('/item/:productId', removeFromCart);
router.delete('/clear', clearCart);
router.post('/merge', mergeGuestCart);

export default router;
