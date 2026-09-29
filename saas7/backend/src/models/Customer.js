import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  addresses: [{
    type: { type: String, enum: ['shipping', 'billing'], default: 'shipping' },
    label: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
    phone: String,
    isDefault: { type: Boolean, default: false },
  }],
  totalOrders: { type: Number, default: 0 },
  lifetimeValue: { type: Number, default: 0 },
  lastOrderDate: Date,
  lastLogin: Date,
  notes: String,
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

customerSchema.index({ storeId: 1, email: 1 }, { unique: true });
customerSchema.index({ storeId: 1, phone: 1 });
customerSchema.index({ storeId: 1, totalOrders: -1 });
customerSchema.index({ storeId: 1, lifetimeValue: -1 });

export default mongoose.model('Customer', customerSchema);
