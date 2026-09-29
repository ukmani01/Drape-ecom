import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  status: { type: String, enum: ['trial', 'active', 'expired', 'suspended', 'cancelled'], default: 'trial' },
  trialStart: Date,
  trialEnd: Date,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  autoRenew: { type: Boolean, default: true },
  cancelledAt: Date,
  paymentHistory: [{
    date: { type: Date, default: Date.now },
    amount: Number,
    currency: { type: String, default: 'INR' },
    invoiceUrl: String,
    gateway: String,
    paymentId: String,
    status: String,
  }],
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

subscriptionSchema.index({ storeId: 1 });
subscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });

export default mongoose.model('Subscription', subscriptionSchema);
