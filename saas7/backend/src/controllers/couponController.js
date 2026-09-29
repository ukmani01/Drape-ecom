import Coupon from '../models/Coupon.js';
import ActivityLog from '../models/ActivityLog.js';

export const getCoupons = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { page = 1, limit = 20 } = req.query;
    const coupons = await Coupon.find({ storeId })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Coupon.countDocuments({ storeId });
    res.status(200).json({
      success: true,
      data: { docs: coupons, total, page, limit },
    });
  } catch (err) {
    next(err);
  }
};

export const getCoupon = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const coupon = await Coupon.findOne({ _id: req.params.id, storeId });
    if (!coupon) throw new Error('Coupon not found');
    res.status(200).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { code, type, value, minOrderAmount, maxDiscount, usageLimit, startDate, endDate, isActive } = req.body;
    const existing = await Coupon.findOne({ storeId, code: code.toUpperCase() });
    if (existing) throw new Error('Coupon code already exists');
    const coupon = new Coupon({
      storeId,
      code: code.toUpperCase(),
      type,
      value,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || 0,
      usageLimit: usageLimit || 1,
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true,
    });
    await coupon.save();
    await ActivityLog.create({
      storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'COUPON_CREATED',
      details: { couponId: coupon._id, code: coupon.code },
    });
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { code, type, value, minOrderAmount, maxDiscount, usageLimit, startDate, endDate, isActive } = req.body;
    const coupon = await Coupon.findOne({ _id: req.params.id, storeId });
    if (!coupon) throw new Error('Coupon not found');
    if (code && code !== coupon.code) {
      const existing = await Coupon.findOne({ storeId, code: code.toUpperCase() });
      if (existing) throw new Error('Coupon code already exists');
      coupon.code = code.toUpperCase();
    }
    if (type !== undefined) coupon.type = type;
    if (value !== undefined) coupon.value = value;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (startDate !== undefined) coupon.startDate = startDate;
    if (endDate !== undefined) coupon.endDate = endDate;
    if (isActive !== undefined) coupon.isActive = isActive;
    await coupon.save();
    await ActivityLog.create({
      storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'COUPON_UPDATED',
      details: { couponId: coupon._id, code: coupon.code },
    });
    res.status(200).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const coupon = await Coupon.findOneAndDelete({ _id: req.params.id, storeId });
    if (!coupon) throw new Error('Coupon not found');
    await ActivityLog.create({
      storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'COUPON_DELETED',
      details: { couponId: coupon._id, code: coupon.code },
    });
    res.status(200).json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
};

// ✅ ADD THIS FUNCTION – Coupon Validation
export const validateCoupon = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { code, cartTotal } = req.body;

    // 1. Check if code is provided
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    // 2. Find the coupon
    const coupon = await Coupon.findOne({
      storeId,
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    // 3. Check if coupon is expired
    const now = new Date();
    if (coupon.endDate && now > new Date(coupon.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired',
      });
    }

    // 4. Check if coupon is not yet active
    if (coupon.startDate && now < new Date(coupon.startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is not active yet',
      });
    }

    // 5. Check minimum order amount
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
      });
    }

    // 6. Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit exceeded',
      });
    }

    // 7. Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (cartTotal * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      // Fixed discount
      discount = coupon.value;
      if (discount > cartTotal) {
        discount = cartTotal;
      }
    }

    // 8. Round to 2 decimal places
    discount = Math.round(discount * 100) / 100;
    const finalTotal = Math.round((cartTotal - discount) * 100) / 100;

    res.status(200).json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
        },
        discount,
        finalTotal,
      },
    });
  } catch (err) {
    console.error('Validate coupon error:', err);
    next(err);
  }
};
