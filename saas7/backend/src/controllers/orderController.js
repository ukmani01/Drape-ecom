// =============================================================
// 🔥 FIX: Guest Creation Removed → Only Logged-in Users
// ✅ FIX 2: Clear ONLY the user's cart using Customer ID
// =============================================================

import orderRepository from '../repositories/orderRepository.js';
import customerRepository from '../repositories/customerRepository.js';
import productRepository from '../repositories/productRepository.js';
import cartRepository from '../repositories/cartRepository.js';
import { ActivityLog, Order, Customer, Cart } from '../models/index.js';
import mongoose from 'mongoose';

// =============================================================
// ✅ HELPER: Get or Create Customer for Logged-in User
// =============================================================
async function getOrCreateCustomerByUser(user, storeId) {
  if (!user) {
    throw new Error('User not authenticated');
  }

  let customer = await Customer.findOne({ storeId, email: user.email });
  if (!customer) {
    const nameParts = user.name ? user.name.split(' ') : ['User', 'Customer'];
    customer = new Customer({
      storeId,
      firstName: nameParts[0] || 'User',
      lastName: nameParts.slice(1).join(' ') || 'Customer',
      email: user.email,
      phone: user.phone || '',
      isGuest: false,
    });
    await customer.save();
    console.log(`✅ Customer created for user: ${user.email} in store ${storeId}`);
  }
  return customer._id;
}

// =============================================================
// LIST ORDERS
// =============================================================
export const listOrders = async (req, res, next) => {
  try {
    const { status, page, limit, customerId } = req.query;
    const filter = { storeId: req.storeId };
    if (status) filter.orderStatus = status;
    if (customerId) filter.customerId = customerId;
    const result = await orderRepository.find(filter, { page, limit });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// =============================================================
// GET ORDER
// =============================================================
export const getOrder = async (req, res, next) => {
  try {
    const order = await orderRepository.findById(req.params.id, req.storeId);
    if (!order) throw new Error('Order not found');
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// =============================================================
// ✅ CREATE ORDER (FIXED - CLEAR CART SAFELY)
// =============================================================
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;
    const storeId = req.storeId;

    console.log('🔍 ===== Order Create Debug =====');
    console.log('🔍 storeId:', storeId);

    // 1. Validate storeId
    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID required. Please login with store admin account.'
      });
    }

    // 2. Validate items
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // 3. Validate shipping address
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.line1) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address with name and line1 is required'
      });
    }

    // 4. Get Customer ID (Logged-in User)
    let customerId;
    try {
      customerId = await getOrCreateCustomerByUser(req.user, storeId);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login to place order.'
      });
    }
    console.log(`✅ Customer found/created: ${customerId}`);

    // 5. Process Items
    let subtotal = 0;
    const orderItems = [];
    const productErrors = [];

    for (const item of items) {
      let productId = item.productId;
      if (typeof productId === 'object' && productId !== null) {
        productId = productId._id || productId.id || String(productId);
      }
      if (typeof productId === 'object') {
        productId = String(productId);
      }
      productId = String(productId);

      const product = await productRepository.findById(productId, storeId);
      if (!product) {
        productErrors.push(`Product ${productId} not found`);
        continue;
      }

      if (!product._id) {
        productErrors.push(`Product ${productId} is invalid (missing _id)`);
        continue;
      }

      const variant = product.variants?.find(v => v.sku === item.sku);
      const price = variant?.price || product.variants?.[0]?.price || 0;
      
      if (!price || price === 0) {
        productErrors.push(`Product ${product.title} has no price`);
        continue;
      }

      const quantity = item.quantity || 1;
      const total = price * quantity;
      subtotal += total;

      orderItems.push({
        productId: product._id,
        name: product.title || 'Product',
        variant: item.sku || '',
        sku: item.sku || '',
        quantity,
        price,
        image: product.images?.[0] || '',
        total,
      });

      try {
        await productRepository.updateStock(storeId, product._id, quantity);
        await productRepository.updateSales(storeId, product._id, quantity);
      } catch (stockErr) {
        console.error(`Stock update failed:`, stockErr.message);
      }
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: productErrors.length > 0 
          ? `No valid products found: ${productErrors.join(', ')}` 
          : 'No valid products found',
        errors: productErrors
      });
    }

    const tax = subtotal * 0.08;
    const shippingFee = req.body.shippingFee || 0;
    const total = subtotal + tax + shippingFee;

    // 6. Create order
    const order = await orderRepository.create({
      storeId,
      customerId,
      items: orderItems,
      subtotal,
      tax,
      shippingFee,
      total,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      notes,
    });

    console.log(`✅ Order created: ${order.orderId}`);

    // 7. Update customer stats
    try {
      await customerRepository.updateOrderStats(storeId, customerId, total);
    } catch (err) {
      console.warn('Could not update customer stats:', err);
    }

    // =============================================================
    // ✅ 8. CLEAR CART (SAFE & RELIABLE)
    // =============================================================
    try {
      const result = await Cart.deleteOne({ storeId, customerId });
      if (result.deletedCount > 0) {
        console.log(`🗑️ Cart cleared for customer: ${customerId}`);
      } else if (req.user?.email) {
        const targetCustomer = await Customer.findOne({ storeId, email: req.user.email }).select('_id');
        if (targetCustomer) {
          await Cart.deleteOne({ storeId, customerId: targetCustomer._id });
          console.log(`🗑️ Fallback: Deleted cart for ${req.user.email}`);
        }
      }
    } catch (err) {
      console.warn('Could not clear cart:', err);
    }

    // 9. Activity log
    try {
      await ActivityLog.create({
        storeId,
        userId: req.user?.id,
        userEmail: req.user?.email,
        action: 'ORDER_CREATED',
        details: { orderId: order.orderId, total },
      });
    } catch (err) {
      console.warn('Could not create activity log:', err);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });

  } catch (err) {
    console.error('❌ Order creation error:', err);
    console.error('❌ Stack:', err.stack);
    next(err);
  }
};

// =============================================================
// UPDATE ORDER STATUS, GET ORDER, etc. (unchanged)
// =============================================================
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await orderRepository.updateStatus(req.params.id, status, req.storeId, note);
    if (!order) throw new Error('Order not found');
    await ActivityLog.create({
      storeId: req.storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ORDER_STATUS_UPDATED',
      details: { orderId: order.orderId, status, note },
    });
    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderByOrderId = async (req, res, next) => {
  try {
    const order = await orderRepository.findByOrderId(req.storeId, req.params.orderId);
    if (!order) throw new Error('Order not found');
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const getOrderTimeline = async (req, res, next) => {
  try {
    const order = await orderRepository.findById(req.params.id, req.storeId);
    if (!order) throw new Error('Order not found');
    res.status(200).json({ success: true, data: order.timeline });
  } catch (err) {
    next(err);
  }
};

export const getOrderStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    const summary = await orderRepository.getRevenueSummary(req.storeId, start, end);
    const daily = await orderRepository.getDailyRevenue(req.storeId, 30);
    const statusCounts = await Order.aggregate([
      { $match: { storeId: req.storeId } },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);
    res.status(200).json({
      success: true,
      data: {
        summary,
        daily,
        statusCounts: statusCounts.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      },
    });
  } catch (err) {
    next(err);
  }
};