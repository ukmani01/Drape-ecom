// backend/src/controllers/customerController.js
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';

// @desc    List customers
// @route   GET /api/customers
export const listCustomers = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { page = 1, limit = 20 } = req.query;
    const customers = await Customer.find({ storeId })
      .select('firstName lastName email phone totalOrders lifetimeValue createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Customer.countDocuments({ storeId });
    res.status(200).json({ success: true, data: { docs: customers, total, page, limit } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
export const getCustomer = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const customer = await Customer.findOne({ _id: req.params.id, storeId });
    if (!customer) throw new Error('Customer not found');
    res.status(200).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

// @desc    Create customer
// @route   POST /api/customers
export const createCustomer = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const customer = new Customer({ ...req.body, storeId });
    await customer.save();
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
export const updateCustomer = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, storeId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) throw new Error('Customer not found');
    res.status(200).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
export const deleteCustomer = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, storeId });
    if (!customer) throw new Error('Customer not found');
    res.status(200).json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get customer orders
// @route   GET /api/customers/:id/orders
export const getCustomerOrders = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const orders = await Order.find({ storeId, customerId: req.params.id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// @desc    Search customers
// @route   GET /api/customers/search?q=...
export const searchCustomers = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { q } = req.query;
    if (!q) throw new Error('Search query required');
    const regex = new RegExp(q, 'i');
    const customers = await Customer.find({
      storeId,
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }, { phone: regex }],
    });
    res.status(200).json({ success: true, data: customers });
  } catch (err) {
    next(err);
  }
};

// @desc    Get top customers by lifetime value
// @route   GET /api/customers/top
export const getTopCustomers = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const customers = await Customer.find({ storeId })
      .sort({ lifetimeValue: -1 })
      .limit(10);
    res.status(200).json({ success: true, data: customers });
  } catch (err) {
    next(err);
  }
};