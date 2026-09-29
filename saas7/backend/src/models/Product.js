import mongoose from 'mongoose';
import { generateSlug } from '../utils/helpers.js';

const productSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images: [{ type: String }],
  variants: [{
    size: String,
    color: String,
    sku: { type: String, unique: true, sparse: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: 0 },
    costPerItem: { type: Number, default: 0 },
    stock: { type: Number, default: 0, min: 0 },
    weight: Number,
    dimensions: { length: Number, width: Number, height: Number },
  }],
  variantType: { type: String, enum: ['size-color', 'custom', 'none'], default: 'none' },
  trackInventory: { type: Boolean, default: true },
  allowBackorder: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNew: { type: Boolean, default: true },
  tags: [{ type: String }],
  seo: {
    title: String,
    description: String,
    keywords: String,
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = generateSlug(this.title);
  }
  next();
});

productSchema.index({ storeId: 1, slug: 1 }, { unique: true });
productSchema.index({ storeId: 1, categoryId: 1 });
productSchema.index({ storeId: 1, status: 1, createdAt: -1 });
productSchema.index({ storeId: 1, isFeatured: 1 });
productSchema.index({ storeId: 1, tags: 1 });
productSchema.index({ storeId: 1, totalSales: -1 });
productSchema.index({ storeId: 1, 'variants.0.price': 1 });

export default mongoose.model('Product', productSchema);
