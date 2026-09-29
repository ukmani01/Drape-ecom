import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

wishlistSchema.index({ storeId: 1, customerId: 1 }, { unique: true });

export default mongoose.model('Wishlist', wishlistSchema);
