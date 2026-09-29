// backend/src/controllers/cartController.js
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import mongoose from 'mongoose';

// =============================================================
// ✅ Helper: Get or Create Customer for Guest
// =============================================================
async function getOrCreateCustomer(storeId, customerId, sessionId) {
  if (customerId) return customerId;

  const guestEmail = `guest_${sessionId || Date.now()}_${Math.random().toString(36).substring(2, 8)}@temp.com`;
  let customer = await Customer.findOne({ storeId, email: guestEmail });
  if (!customer) {
    customer = new Customer({
      storeId,
      firstName: 'Guest',
      lastName: 'User',
      email: guestEmail,
      phone: '',
      isGuest: true,
    });
    await customer.save();
  }
  return customer._id;
}

// =============================================================
// GET CART
// =============================================================
export const getCart = async (req, res, next) => {
  try {
    const storeId = req.storeId || req.user?.storeId;
    if (!storeId) {
      return res.status(200).json({
        success: true,
        data: { items: [], storeId: null, _id: null }
      });
    }

    let customerId = req.user?._id || req.query.customerId || null;
    if (!customerId) {
      const sessionId = req.session?.id || req.headers['x-session-id'] || `guest_${Date.now()}`;
      customerId = await getOrCreateCustomer(storeId, null, sessionId);
    }

    let cart = await Cart.findOne({ storeId, customerId }).populate('items.productId');
    if (!cart) {
      cart = await Cart.create({ storeId, customerId, items: [] });
    }
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error('❌ getCart error:', err);
    next(err);
  }
};

// =============================================================
// ADD TO CART
// =============================================================
export const addToCart = async (req, res, next) => {
  try {
    const storeId = req.storeId || req.user?.storeId;
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Store ID required' });
    }

    const { productId, quantity = 1, variant = '' } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    let customerId = req.user?._id || req.body.customerId || null;
    if (!customerId) {
      const sessionId = req.session?.id || req.headers['x-session-id'] || `guest_${Date.now()}`;
      customerId = await getOrCreateCustomer(storeId, null, sessionId);
    }

    const product = await Product.findOne({ _id: productId, storeId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const variantData = product.variants.find(v => v.sku === variant);
    const price = variantData ? variantData.price : (product.variants[0]?.price || 0);

    let cart = await Cart.findOne({ storeId, customerId });
    if (!cart) {
      cart = await Cart.create({ storeId, customerId, items: [] });
    }

    const existing = cart.items.find(
      (item) => item.productId.toString() === productId && item.variant === variant
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        variant,
        price,
        name: product.title,
        image: product.images[0] || '',
      });
    }
    await cart.save();
    await cart.populate('items.productId');
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error('❌ addToCart error:', err);
    next(err);
  }
};

// =============================================================
// UPDATE CART ITEM
// =============================================================
export const updateCartItem = async (req, res, next) => {
  try {
    const storeId = req.storeId || req.user?.storeId;
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Store ID required' });
    }

    const { productId, quantity, variant = '' } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    let customerId = req.user?._id || req.body.customerId || null;
    if (!customerId) {
      const sessionId = req.session?.id || req.headers['x-session-id'] || `guest_${Date.now()}`;
      customerId = await getOrCreateCustomer(storeId, null, sessionId);
    }

    const cart = await Cart.findOne({ storeId, customerId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find(
      (i) => i.productId.toString() === productId && i.variant === variant
    );
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => !(i.productId.toString() === productId && i.variant === variant)
      );
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    await cart.populate('items.productId');
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error('❌ updateCartItem error:', err);
    next(err);
  }
};

// =============================================================
// REMOVE FROM CART
// =============================================================
export const removeFromCart = async (req, res, next) => {
  try {
    const storeId = req.storeId || req.user?.storeId;
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Store ID required' });
    }

    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    let customerId = req.user?._id || req.query.customerId || null;
    if (!customerId) {
      const sessionId = req.session?.id || req.headers['x-session-id'] || `guest_${Date.now()}`;
      customerId = await getOrCreateCustomer(storeId, null, sessionId);
    }

    const cart = await Cart.findOne({ storeId, customerId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
    await cart.save();
    await cart.populate('items.productId');
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error('❌ removeFromCart error:', err);
    next(err);
  }
};

// =============================================================
// CLEAR CART
// =============================================================
export const clearCart = async (req, res, next) => {
  try {
    const storeId = req.storeId || req.user?.storeId;
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Store ID required' });
    }

    let customerId = req.user?._id || req.query.customerId || null;
    if (!customerId) {
      const sessionId = req.session?.id || req.headers['x-session-id'] || `guest_${Date.now()}`;
      customerId = await getOrCreateCustomer(storeId, null, sessionId);
    }

    await Cart.findOneAndDelete({ storeId, customerId });
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error('❌ clearCart error:', err);
    next(err);
  }
};

// =============================================================
// MERGE GUEST CART
// =============================================================
export const mergeGuestCart = async (req, res, next) => {
  try {
    const storeId = req.storeId || req.user?.storeId;
    const customerId = req.user?._id;
    const guestCustomerId = req.body.guestCustomerId;

    if (!storeId || !customerId || !guestCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID, Customer ID, and Guest Customer ID required'
      });
    }

    const guestCart = await Cart.findOne({ storeId, customerId: guestCustomerId });
    const customerCart = await Cart.findOne({ storeId, customerId });

    if (!guestCart || guestCart.items.length === 0) {
      return res.status(200).json({ success: true, message: 'No guest cart to merge' });
    }

    if (!customerCart) {
      guestCart.customerId = customerId;
      await guestCart.save();
      res.status(200).json({ success: true, message: 'Guest cart assigned to customer' });
    } else {
      for (const guestItem of guestCart.items) {
        const existing = customerCart.items.find(
          (item) => item.productId.toString() === guestItem.productId.toString()
        );
        if (existing) {
          existing.quantity += guestItem.quantity;
        } else {
          customerCart.items.push(guestItem);
        }
      }
      await customerCart.save();
      await Cart.findOneAndDelete({ storeId, customerId: guestCustomerId });
      res.status(200).json({ success: true, message: 'Carts merged successfully' });
    }
  } catch (err) {
    console.error('❌ mergeGuestCart error:', err);
    next(err);
  }
};