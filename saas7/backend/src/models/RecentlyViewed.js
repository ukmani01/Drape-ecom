import mongoose from 'mongoose';

const recentlyViewedSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    unique: true,
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true });

recentlyViewedSchema.index({ storeId: 1 });
recentlyViewedSchema.index({ 'items.productId': 1 });

export default mongoose.model('RecentlyViewed', recentlyViewedSchema);