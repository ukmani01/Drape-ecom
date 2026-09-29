// =============================================================
// 🔥 FIXED: Orders API for Storefront (My Orders Page)
// =============================================================
// PROBLEM: Orders were not showing on "My Orders" page because
// the API used User ID instead of Customer ID.
//
// FIX: Added getCustomerIdFromUser() helper that:
//   1. Finds Customer by storeId + email
//   2. Auto-creates Customer if missing (fixes missing customer issue)
//   3. Returns Customer ID for order queries
// =============================================================

import Order from '../models/Order.js';
import Customer from '../models/Customer.js';

// =============================================================
// ✅ HELPER: Get Customer ID from Logged-in User
// =============================================================
async function getCustomerIdFromUser(user, storeId) {
  // 1. Check if user exists
  if (!user) {
    console.warn('⚠️ No user provided');
    return null;
  }

  console.log(`🔍 Looking for customer: ${user.email} in store ${storeId}`);

  // 2. Check if Customer exists for this store + email
  let customer = await Customer.findOne({ storeId, email: user.email });

  // 3. If not, AUTO-CREATE (fixes the missing customer issue)
  if (!customer) {
    console.log(`🆕 Auto-creating customer for: ${user.email}`);
    
    const nameParts = user.name ? user.name.split(' ') : ['User', 'Customer'];
    
    customer = new Customer({
      storeId,
      firstName: nameParts[0] || 'User',
      lastName: nameParts.slice(1).join(' ') || 'Customer',
      email: user.email,
      phone: user.phone || '',
      isGuest: false, // ✅ Real registered user
    });
    
    await customer.save();
    console.log(`✅ Customer created successfully: ${customer._id}`);
  } else {
    console.log(`✅ Customer found: ${customer._id}`);
  }

  return customer._id;
}

// =============================================================
// ✅ LIST ORDERS (FIXED – Uses Customer ID, not User ID)
// =============================================================
// Endpoint: GET /api/public/orders?storeSlug=divya
// Used by: "My Orders" page in storefront
// =============================================================
export const listOrders = async (req, res) => {
  console.log(`🔍 listOrders called for store: ${req.storeId}`);
  console.log(`👤 User: ${req.user?.email}`);

  try {
    const storeId = req.storeId;

    // ✅ FIX: Get Customer ID from User (NOT req.user._id)
    const customerId = await getCustomerIdFromUser(req.user, storeId);

    if (!customerId) {
      console.warn('⚠️ No customer found for user');
      return res.json({ 
        success: true, 
        data: [] // Return empty array instead of 401 (better UX)
      });
    }

    // ✅ FIX: Query orders by Customer ID (correct!)
    const orders = await Order.find({ 
      storeId, 
      customerId 
    })
    .sort({ createdAt: -1 }); // Latest first

    console.log(`✅ Found ${orders.length} orders for customer ${customerId}`);
    res.json({ 
      success: true, 
      data: orders 
    });

  } catch (err) {
    console.error('❌ listOrders error:', err.message);
    console.error('❌ Stack:', err.stack);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// =============================================================
// ✅ GET SINGLE ORDER (With Customer Ownership Check)
// =============================================================
// Endpoint: GET /api/public/orders/:orderId?storeSlug=divya
// Used by: Order Confirmation page
// =============================================================
export const getOrder = async (req, res) => {
  console.log(`🔍 getOrder called for orderId: ${req.params.orderId}`);

  try {
    const { orderId } = req.params;
    const storeId = req.storeId;

    // ✅ Ensure user is logged in
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please login to view order' 
      });
    }

    // ✅ Get Customer ID
    const customerId = await getCustomerIdFromUser(req.user, storeId);

    if (!customerId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // ✅ Verify order belongs to this customer
    const order = await Order.findOne({ 
      storeId, 
      orderId,
      customerId: customerId // ✅ Security: Ensure customer owns this order
    });

    if (!order) {
      console.warn(`⚠️ Order not found: ${orderId} for customer ${customerId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    console.log(`✅ Order found: ${orderId}`);
    res.json({ 
      success: true, 
      data: order 
    });

  } catch (err) {
    console.error('❌ getOrder error:', err.message);
    console.error('❌ Stack:', err.stack);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};