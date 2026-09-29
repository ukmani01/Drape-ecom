import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  billingCycle: { type: String, enum: ['monthly', 'yearly', 'lifetime'], default: 'monthly' },
  features: {
    maxProducts: { type: Number, default: 10 },
    maxStorage: { type: Number, default: 100 },
    maxStaff: { type: Number, default: 1 },
    themeAccess: [{ type: Number }],
    analytics: { type: Boolean, default: false },
    bulkImport: { type: Boolean, default: false },
    aiTools: { type: Boolean, default: false },
    customDomain: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    advancedReports: { type: Boolean, default: false },
    multiCurrency: { type: Boolean, default: false },
    multiLanguage: { type: Boolean, default: false },
  },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

planSchema.index({ code: 1 }, { unique: true });
planSchema.index({ isActive: 1 });

export default mongoose.model('Plan', planSchema);
