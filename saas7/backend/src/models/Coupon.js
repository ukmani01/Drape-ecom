import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  value: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  perCustomerLimit: { type: Number, default: 1 },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  appliesTo: { type: String, enum: ['all', 'products', 'categories'], default: 'all' },
  appliesToIds: [{ type: mongoose.Schema.Types.ObjectId }],
  isActive: { type: Boolean, default: true },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

couponSchema.index({ storeId: 1, code: 1 }, { unique: true });
couponSchema.index({ storeId: 1, isActive: 1 });

export default mongoose.model('Coupon', couponSchema);
