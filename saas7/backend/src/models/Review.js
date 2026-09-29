import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '' },
  comment: { type: String, default: '' },
  images: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  helpfulCount: { type: Number, default: 0 },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

reviewSchema.index({ storeId: 1, productId: 1 });
reviewSchema.index({ storeId: 1, customerId: 1 });
reviewSchema.index({ storeId: 1, status: 1 });

export default mongoose.model('Review', reviewSchema);
