import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: Number,
  name: String,
  image: String,
});

const cartSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  sessionId: { type: String, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  items: [cartItemSchema],
  expiresAt: { type: Date, index: { expires: '7d' } },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

cartSchema.index({ storeId: 1, sessionId: 1 });
cartSchema.index({ storeId: 1, customerId: 1 });

export default mongoose.model('Cart', cartSchema);
