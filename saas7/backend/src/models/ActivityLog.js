import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  action: { type: String, required: true },
  category: { type: String, default: 'general' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: { createdAt: true, updatedAt: false } });

activityLogSchema.index({ storeId: 1 });
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ category: 1 });

export default mongoose.model('ActivityLog', activityLogSchema);
